/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { threadId } = require('node:worker_threads');
const { normalize, resolve } = require('path');
const babel = require('@babel/core');
const { globSync } = require('fast-glob');
const isGlob = require('is-glob');
const globParent = require('glob-parent');
const createBundler = require('./bundler');
const { version } = require('../package.json');

// Parses a glob pattern and extracts its base directory and pattern.
// Returns an object with `base` and `glob` properties.
function parseGlob(pattern) {
  // License: MIT
  // Based on:
  // https://github.com/chakra-ui/panda/blob/6ab003795c0b076efe6879a2e6a2a548cb96580e/packages/node/src/parse-glob.ts
  let glob = pattern;
  const base = globParent(pattern);

  if (base !== '.') {
    glob = pattern.substring(base.length);
    if (glob.charAt(0) === '/') {
      glob = glob.substring(1);
    }
  }

  if (glob.substring(0, 2) === './') {
    glob = glob.substring(2);
  }
  if (glob.charAt(0) === '/') {
    glob = glob.substring(1);
  }

  return { base, glob };
}

// Parses a file path or glob pattern into a PostCSS dependency message.
function parseDependency(fileOrGlob) {
  // License: MIT
  // Based on:
  // https://github.com/chakra-ui/panda/blob/6ab003795c0b076efe6879a2e6a2a548cb96580e/packages/node/src/parse-dependency.ts
  if (fileOrGlob.startsWith('!')) {
    return null;
  }

  let message = null;

  if (isGlob(fileOrGlob)) {
    const { base, glob } = parseGlob(fileOrGlob);
    message = { type: 'dir-dependency', dir: normalize(resolve(base)), glob };
  } else {
    message = { type: 'dependency', file: normalize(resolve(fileOrGlob)) };
  }

  return message;
}

// Returns the mtime of a file, or null if the file does not exist.
function getMtime(file) {
  try {
    return fs.statSync(file).mtimeMs;
  } catch {
    return null;
  }
}

// Returns the contents of a file, or null if the file does not exist.
function readFile(file) {
  try {
    return fs.readFileSync(file, 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

// Gives each function in a configuration a number, which is the same for the
// same function in this process
const functionIds = new WeakMap();
let nextFunctionId = 0;

// Serializes a configuration for a key. JSON.stringify drops functions and
// turns a RegExp into {}, so two different configurations could get the same
// key. Here a RegExp keeps its source and flags. A function has no stable
// form, so it becomes a number that is valid only in this process. Returns
// null if the value cannot be serialized, or if it has a function and
// `allowFunctions` is false.
function serialize(value, { allowFunctions }) {
  try {
    return JSON.stringify(value, (key, item) => {
      if (typeof item === 'function') {
        if (!allowFunctions) {
          throw new Error('The configuration has a function');
        }
        if (!functionIds.has(item)) {
          functionIds.set(item, nextFunctionId++);
        }
        return { function: functionIds.get(item) };
      }
      if (item instanceof RegExp) {
        return { regexp: String(item) };
      }
      return item;
    });
  } catch {
    return null;
  }
}

// Returns a key for the builder configuration, or null if the configuration
// cannot be serialized. Equal configurations can share one builder.
function getBuilderKey(config) {
  return serialize(config, { allowFunctions: true });
}

// Turbopack runs PostCSS in short-lived worker processes. Each new process
// loses the in-memory state of the builder and must transform all files
// again. The disk cache below keeps that state between processes.
const CACHE_VERSION = 1;

// Returns the path of the package.json of a package, or null if it cannot be
// found.
function findPackageJson(name, paths) {
  try {
    return require.resolve(`${name}/package.json`, { paths });
  } catch {
    return null;
  }
}

// Returns the versions of the packages that create the styles. The versions
// come from the copies that this process loads. Babel loads the React Strict
// DOM preset from the project, and the preset loads the StyleX Babel plugin.
function getVersions(cwd) {
  const reactStrictDom = findPackageJson('react-strict-dom', [cwd, __dirname]);
  const stylex =
    reactStrictDom != null
      ? findPackageJson('@stylexjs/babel-plugin', [
          path.dirname(reactStrictDom)
        ])
      : null;
  return {
    'postcss-react-strict-dom': version,
    '@babel/core': babel.version,
    'react-strict-dom':
      reactStrictDom != null ? require(reactStrictDom).version : null,
    '@stylexjs/babel-plugin': stylex != null ? require(stylex).version : null
  };
}

// Returns the id of the dev server session. Turbopack starts the PostCSS
// workers of a session from the dev server process, so all these workers have
// the same parent process.
function getSessionId() {
  return process.ppid;
}

// Returns the disk cache file for the configuration, or null if the
// configuration cannot be a key. The file name contains:
// - The dev server session. A restart of the dev server starts with an empty
//   cache, like the in-memory state of other bundlers. A restart then also
//   fixes changes that the cache does not find, for example a new Babel config
//   file or a change to a file that another file imports.
// - A hash of the inputs that change the styles of an unchanged file. The
//   include and exclude patterns are not in the hash, because the builder
//   removes the files that they no longer match. The Babel config files are
//   not in the hash. The cache keeps their mtimes (see loadCache).
function getCacheFile(config) {
  const { cwd, babelConfig } = config;
  const key = serialize(
    { cacheVersion: CACHE_VERSION, versions: getVersions(cwd), babelConfig },
    // Other processes cannot find a change to a function
    { allowFunctions: false }
  );
  if (key == null) {
    return null;
  }
  const hash = crypto.createHash('sha1').update(key).digest('hex').slice(0, 16);
  return path.join(
    cwd,
    'node_modules',
    '.cache',
    'postcss-react-strict-dom',
    `cache-${getSessionId()}-${hash}.json`
  );
}

// Returns true if a process with the id runs.
function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // The process runs, but belongs to another user
    return error.code === 'EPERM';
  }
}

// Removes the cache files of dev server sessions that ended. Each session
// writes its own cache files, so old files stay until they are removed.
function removeOldCacheFiles(cacheDir) {
  try {
    for (const name of fs.readdirSync(cacheDir)) {
      const match = /^cache-(\d+)-/.exec(name);
      const sessionId = match != null ? Number(match[1]) : null;
      if (
        sessionId !== getSessionId() &&
        (sessionId == null || !isRunning(sessionId))
      ) {
        fs.rmSync(path.join(cacheDir, name), { force: true });
      }
    }
  } catch {}
}

function readCache(cacheFile) {
  try {
    const data = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    if (
      data.version === CACHE_VERSION &&
      Array.isArray(data.babelConfigFiles) &&
      Array.isArray(data.fileModified) &&
      Array.isArray(data.rules)
    ) {
      return data;
    }
  } catch {}
  return null;
}

function writeCache(cacheFile, data) {
  try {
    fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
    // Write to a temporary file, then rename it, so that other workers never
    // read a partial file. Worker threads share a process id, so the name
    // also contains the thread id and a random part.
    const tmpFile = `${cacheFile}.${process.pid}.${threadId}.${crypto
      .randomBytes(4)
      .toString('hex')}.tmp`;
    try {
      fs.writeFileSync(tmpFile, JSON.stringify(data));
      fs.renameSync(tmpFile, cacheFile);
    } finally {
      fs.rmSync(tmpFile, { force: true });
    }
  } catch {}
}

// Creates a builder for transforming files and bundling styles. Each builder
// has one configuration, so that builds with other options do not change its
// state.
function createBuilder(config) {
  const { cwd, include, exclude, babelConfig, isDev, useDiskCache } = config;

  const bundler = createBundler();

  // The mtime of each file whose styles the bundler keeps
  const fileModifiedMap = new Map();

  // The mtime of each file that failed to transform. The builder does not
  // transform such a file again until it changes. The disk cache does not
  // keep these mtimes, so that a new process shows the error.
  const failedFileMap = new Map();

  // The transform in progress for each file, with the mtime of the file.
  // Concurrent builds wait for the same transform.
  const pendingTransformMap = new Map();

  // The Babel config files of the stored styles, with their mtimes
  const babelConfigFileMap = new Map();

  // The disk cache file, or null if the builder does not use a disk cache
  const cacheFile = useDiskCache ? getCacheFile(config) : null;

  // Loads the state from the disk cache.
  function loadCache() {
    const cached = readCache(cacheFile);
    if (cached == null) {
      return;
    }
    // Do not use the cache if a Babel config file changed
    for (const [file, mtimeMs] of cached.babelConfigFiles) {
      if (getMtime(file) !== mtimeMs) {
        return;
      }
    }
    for (const [file, mtimeMs] of cached.babelConfigFiles) {
      babelConfigFileMap.set(file, mtimeMs);
    }
    for (const [file, mtimeMs] of cached.fileModified) {
      fileModifiedMap.set(file, mtimeMs);
    }
    bundler.restore(cached.rules);
  }

  // Keeps the mtimes of the Babel config files of a transformed file. If one
  // of these files changes later, a new process does not use the cache. The
  // builder keeps the first mtime of each file.
  function addBabelConfigFiles(files) {
    for (const file of files) {
      if (!babelConfigFileMap.has(file)) {
        babelConfigFileMap.set(file, getMtime(file));
      }
    }
  }

  // Finds the @-rule in the provided PostCSS root.
  function findAtRule(root) {
    let matchingAtRule = null;
    root.walkAtRules((atRule) => {
      if (atRule.name === 'react-strict-dom' && !atRule.params) {
        matchingAtRule = atRule;
      }
    });
    return matchingAtRule;
  }

  // Retrieves all files that match the include and exclude patterns.
  function getFiles() {
    return globSync(include, {
      onlyFiles: true,
      ignore: exclude,
      cwd
    });
  }

  // Forgets a file and removes its stored styles.
  function removeFile(file) {
    fileModifiedMap.delete(file);
    failedFileMap.delete(file);
    // The bundler stores rules by absolute path
    bundler.remove(path.resolve(cwd, file));
  }

  // Transforms a file and stores its styles. Returns true if the state of the
  // builder changed.
  async function transformFile(file, mtimeMs, shouldSkipTransformError) {
    const filePath = path.resolve(cwd, file);
    const contents = readFile(filePath);
    if (contents == null) {
      // The file was deleted after the glob found it
      removeFile(file);
      return true;
    }
    if (!bundler.shouldTransform(contents)) {
      // The file no longer uses React Strict DOM; remove its old styles
      bundler.remove(filePath);
    } else {
      const result = await bundler.transform(filePath, contents, babelConfig, {
        isDev,
        shouldSkipTransformError
      });
      if (result == null) {
        // The transform failed. Keep the old mtime, so that a new process
        // transforms the file again and shows the error.
        failedFileMap.set(file, mtimeMs);
        return false;
      }
      addBabelConfigFiles(result.configFiles);
    }
    failedFileMap.delete(file);
    fileModifiedMap.set(file, mtimeMs);
    return true;
  }

  // Transforms a file, or waits for the transform of the same version of the
  // file that another build started. Returns true if the state of the builder
  // changed.
  function transformFileOnce(file, mtimeMs, shouldSkipTransformError) {
    const pending = pendingTransformMap.get(file);
    if (pending != null && pending.mtimeMs === mtimeMs) {
      return pending.promise;
    }
    const promise = transformFile(file, mtimeMs, shouldSkipTransformError);
    const entry = { mtimeMs, promise };
    pendingTransformMap.set(file, entry);
    const clear = () => {
      if (pendingTransformMap.get(file) === entry) {
        pendingTransformMap.delete(file);
      }
    };
    promise.then(clear, clear);
    return promise;
  }

  // Transforms the included files, bundles the CSS, and returns the result.
  async function build({ shouldSkipTransformError, useCSSLayers }) {
    const files = getFiles();
    const fileSet = new Set(files);
    const filesToTransform = [];
    let hasDeletedFiles = false;

    // Remove deleted files since the last build
    for (const file of fileModifiedMap.keys()) {
      if (!fileSet.has(file)) {
        removeFile(file);
        hasDeletedFiles = true;
      }
    }
    for (const file of failedFileMap.keys()) {
      if (!fileSet.has(file)) {
        failedFileMap.delete(file);
      }
    }

    for (const file of files) {
      const mtimeMs = getMtime(path.resolve(cwd, file));

      // Skip files that have not been modified since the last build, and
      // files that failed to transform and did not change since then.
      // On first run, all files will be transformed
      const shouldSkip =
        mtimeMs != null &&
        (fileModifiedMap.get(file) === mtimeMs ||
          failedFileMap.get(file) === mtimeMs);

      if (shouldSkip) {
        continue;
      }

      filesToTransform.push({ file, mtimeMs });
    }

    const changes = await Promise.all(
      filesToTransform.map(({ file, mtimeMs }) =>
        transformFileOnce(file, mtimeMs, shouldSkipTransformError)
      )
    );

    // Write the cache only if the state changed. A file that failed to
    // transform does not change the state.
    if (cacheFile != null && (hasDeletedFiles || changes.includes(true))) {
      writeCache(cacheFile, {
        version: CACHE_VERSION,
        babelConfigFiles: Array.from(babelConfigFileMap.entries()),
        fileModified: Array.from(fileModifiedMap.entries()),
        rules: bundler.getRules()
      });
    }

    const css = bundler.bundle({ useCSSLayers });
    return css;
  }

  // Retrieves the dependencies that PostCSS should watch.
  function getDependencies() {
    const dependencies = [];

    for (const fileOrGlob of include) {
      const dependency = parseDependency(fileOrGlob);
      if (dependency != null) {
        dependencies.push(dependency);
      }
    }

    return dependencies;
  }

  if (cacheFile != null) {
    removeOldCacheFiles(path.dirname(cacheFile));
    loadCache();
  }

  return {
    findAtRule,
    build,
    getDependencies
  };
}

module.exports = { createBuilder, getBuilderKey };
