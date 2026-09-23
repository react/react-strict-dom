/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const postcss = require('postcss');
const createPlugin = require('../src/plugin');

describe('postcss-react-strict-dom', () => {
  const fixturesDir = path.resolve(__dirname, '__fixtures__');

  async function runPlugin(options = {}, inputCSS = '@react-strict-dom;') {
    // Create a new instance for each test as the plugin is stateful
    const postcssPlugin = createPlugin();

    const plugin = postcssPlugin({
      cwd: fixturesDir,
      include: ['**/*.js'],
      babelConfig: {
        configFile: path.join(fixturesDir, '.babelrc.js')
      },
      ...options
    });

    const processor = postcss([plugin]);
    const result = await processor.process(inputCSS, {
      from: path.join(fixturesDir, 'input.css')
    });

    return result;
  }

  test('extracts CSS from files', async () => {
    const result = await runPlugin();

    expect(result.css).toMatchInlineSnapshot(`
"
@layer priority1, priority2, priority3, priority4;
@layer priority1{
.x1ghz6dp{margin:0}
.x1717udv{padding:0}
}
@layer priority2{
.xng3xce{border-style:none}
.x1y0btm7{border-style:solid}
.xc342km{border-width:0}
.xmkeg23{border-width:1px}
.xe8uvvx{list-style:none}
.xysyzu8{overflow:auto}
.x1hl2dhg{text-decoration:none}
}
@layer priority3{
.xuw900x{aspect-ratio:attr(width)  / attr(height)}
.x42x0ya{background-color:black}
.x1u857p9{background-color:green}
.xrkmrrc{background-color:red}
.x9f619{box-sizing:border-box}
.x1lxnp44{font-family:monospace,"monospace"}
.xngnso2{font-size:1.5rem}
.xrv4cvt{font-size:1em}
.x117nqv4{font-weight:bold}
.x288g5{resize:vertical}
.x16tdsg8{text-align:inherit}
.x1vvkbs{word-wrap:break-word}
}
@layer priority4{
.xjm9jq1{height:1px}
.xt7dq6l{height:auto}
.x193iq5w{max-width:100%}
}"
`);

    // Check that messages contain dependency information
    expect(result.messages.length).toBeGreaterThan(0);
    expect(result.messages.some((m) => m.type === 'dir-dependency')).toBe(true);
  });

  test('handles empty CSS input without @-rule', async () => {
    const result = await runPlugin({}, '/* No @-rule here */');

    expect(result.css).toMatchInlineSnapshot('"/* No @-rule here */"');
    expect(result.messages.length).toBe(0);
  });

  test('handles exclude patterns', async () => {
    const result = await runPlugin({
      exclude: ['**/styles-second.js']
    });

    // Should not contain styles-second.js styles
    expect(result.css).not.toContain('green');

    expect(result.css).toMatchInlineSnapshot(`
"
@layer priority1, priority2, priority3, priority4;
@layer priority1{
.x1ghz6dp{margin:0}
.x1717udv{padding:0}
}
@layer priority2{
.xng3xce{border-style:none}
.x1y0btm7{border-style:solid}
.xc342km{border-width:0}
.xmkeg23{border-width:1px}
.xe8uvvx{list-style:none}
.xysyzu8{overflow:auto}
.x1hl2dhg{text-decoration:none}
}
@layer priority3{
.xuw900x{aspect-ratio:attr(width)  / attr(height)}
.x42x0ya{background-color:black}
.xrkmrrc{background-color:red}
.x9f619{box-sizing:border-box}
.x1lxnp44{font-family:monospace,"monospace"}
.xngnso2{font-size:1.5rem}
.xrv4cvt{font-size:1em}
.x117nqv4{font-weight:bold}
.x288g5{resize:vertical}
.x16tdsg8{text-align:inherit}
.x1vvkbs{word-wrap:break-word}
}
@layer priority4{
.xjm9jq1{height:1px}
.xt7dq6l{height:auto}
.x193iq5w{max-width:100%}
}"
`);
  });

  test('skips files that do not match include/exclude patterns', async () => {
    const result = await runPlugin({
      include: ['**/styles-second.js']
    });

    // Should contain styles-second.js styles but not styles.js
    expect(result.css).not.toContain('red');

    expect(result.css).toMatchInlineSnapshot(`
"
@layer priority1, priority2, priority3, priority4;
@layer priority1{
.x1ghz6dp{margin:0}
.x1717udv{padding:0}
}
@layer priority2{
.xng3xce{border-style:none}
.x1y0btm7{border-style:solid}
.xc342km{border-width:0}
.xmkeg23{border-width:1px}
.xe8uvvx{list-style:none}
.xysyzu8{overflow:auto}
.x1hl2dhg{text-decoration:none}
}
@layer priority3{
.xuw900x{aspect-ratio:attr(width)  / attr(height)}
.x42x0ya{background-color:black}
.x1u857p9{background-color:green}
.x9f619{box-sizing:border-box}
.x1lxnp44{font-family:monospace,"monospace"}
.xngnso2{font-size:1.5rem}
.xrv4cvt{font-size:1em}
.x117nqv4{font-weight:bold}
.x288g5{resize:vertical}
.x16tdsg8{text-align:inherit}
.x1vvkbs{word-wrap:break-word}
}
@layer priority4{
.xjm9jq1{height:1px}
.xt7dq6l{height:auto}
.x193iq5w{max-width:100%}
}"
`);
  });

  test('skips files that Babel ignores', async () => {
    const result = await runPlugin({
      babelConfig: {
        configFile: path.join(fixturesDir, '.babelrc.js'),
        ignore: [path.join(fixturesDir, 'styles-second.js')]
      }
    });

    expect(result.css).toContain('red');
    expect(result.css).not.toContain('green');
  });

  describe('incremental builds', () => {
    const RED = `import { css } from 'react-strict-dom';
export const styles = css.create({ box: { color: 'red' } });
`;

    const NO_STYLES = `import { css } from 'react-strict-dom';
export const styles = {};
`;

    let tempDir;
    let mtime;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'postcss-rsd-'));
      mtime = Date.now() / 1000;
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    // Gives each write a different mtime, because the builder uses the mtime
    // to find changed files.
    function writeFile(name, contents) {
      const file = path.join(tempDir, name);
      fs.writeFileSync(file, contents);
      mtime += 1;
      fs.utimesSync(file, mtime, mtime);
    }

    // Returns a function that runs the same plugin instance on each call,
    // like a bundler in watch mode. Watchers that get the same postcssPlugin
    // share its builders.
    function createWatcher(options = {}, postcssPlugin = createPlugin()) {
      const plugin = postcssPlugin({
        cwd: tempDir,
        include: ['*.js'],
        babelConfig: {
          configFile: path.join(fixturesDir, '.babelrc.js')
        },
        ...options
      });
      const processor = postcss([plugin]);
      return async () => {
        const result = await processor.process('@react-strict-dom;', {
          from: path.join(tempDir, 'input.css')
        });
        return result.css;
      };
    }

    test('removes the styles of deleted files', async () => {
      writeFile('a.js', RED);
      const build = createWatcher();
      expect(await build()).toContain('color:red');

      fs.rmSync(path.join(tempDir, 'a.js'));
      expect(await build()).not.toContain('color:red');
    });

    test('handles a file that is deleted during a build', async () => {
      writeFile('a.js', RED);
      const file = path.join(tempDir, 'a.js');
      const { readFileSync } = fs;
      // Delete the file after the glob finds it, but before the builder
      // reads it
      const spy = jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation((name, ...args) => {
          if (name === file) {
            fs.rmSync(file, { force: true });
          }
          return readFileSync(name, ...args);
        });
      try {
        expect(await createWatcher()()).not.toContain('color:red');
      } finally {
        spy.mockRestore();
      }
    });

    test('removes the styles of a file that no longer creates styles', async () => {
      writeFile('a.js', RED);
      const build = createWatcher();
      expect(await build()).toContain('color:red');

      writeFile('a.js', NO_STYLES);
      expect(await build()).not.toContain('color:red');
    });

    test('removes the styles of a file that no longer uses react-strict-dom', async () => {
      writeFile('a.js', RED);
      const build = createWatcher();
      expect(await build()).toContain('color:red');

      writeFile('a.js', 'export const styles = {};\n');
      expect(await build()).not.toContain('color:red');
    });

    test('keeps the styles of a file that fails to transform', async () => {
      writeFile('a.js', RED);
      const build = createWatcher();
      expect(await build()).toContain('color:red');

      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        writeFile('a.js', `${RED}export const broken = ;\n`);
        expect(await build()).toContain('color:red');
        expect(warn).toHaveBeenCalledTimes(1);
      } finally {
        warn.mockRestore();
      }
    });

    test('does not transform a file that failed to transform until it changes', async () => {
      writeFile('a.js', RED);
      const build = createWatcher();
      expect(await build()).toContain('color:red');

      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        writeFile('a.js', `${RED}export const broken = ;\n`);
        await build();
        await build();
        expect(warn).toHaveBeenCalledTimes(1);

        writeFile('a.js', NO_STYLES);
        expect(await build()).not.toContain('color:red');
        expect(warn).toHaveBeenCalledTimes(1);
      } finally {
        warn.mockRestore();
      }
    });

    test('builds with other options in the same process do not share state', async () => {
      const postcssPlugin = createPlugin();
      writeFile('a.js', RED);
      writeFile('b.js', RED.replace('red', 'blue'));
      const buildA = createWatcher({ include: ['a.js'] }, postcssPlugin);
      const buildB = createWatcher({ include: ['b.js'] }, postcssPlugin);

      for (let i = 0; i < 2; i++) {
        const [cssA, cssB] = await Promise.all([buildA(), buildB()]);
        expect(cssA).toContain('color:red');
        expect(cssA).not.toContain('color:blue');
        expect(cssB).toContain('color:blue');
        expect(cssB).not.toContain('color:red');
      }
    });

    test('concurrent builds transform a file once', async () => {
      const transformedFiles = [];
      const options = {
        babelConfig: {
          configFile: path.join(fixturesDir, '.babelrc.js'),
          plugins: [
            () => ({
              visitor: {
                Program(_, state) {
                  transformedFiles.push(path.basename(state.filename));
                }
              }
            })
          ]
        }
      };
      const postcssPlugin = createPlugin();
      writeFile('a.js', RED);
      // The same options give the same builder
      const build1 = createWatcher(options, postcssPlugin);
      const build2 = createWatcher(options, postcssPlugin);

      const [css1, css2] = await Promise.all([build1(), build2()]);
      expect(css1).toContain('color:red');
      expect(css2).toContain('color:red');
      expect(transformedFiles.filter((file) => file === 'a.js')).toHaveLength(
        1
      );
    });

    describe('disk cache', () => {
      const BLUE = RED.replace('red', 'blue');
      const cacheDir = () =>
        path.join(
          tempDir,
          'node_modules',
          '.cache',
          'postcss-react-strict-dom'
        );

      let env;
      let ppid;

      beforeEach(() => {
        env = process.env;
        ppid = process.ppid;
        // The plugin reads NODE_ENV and TURBOPACK when it is created
        process.env = { ...env, NODE_ENV: 'development', TURBOPACK: '1' };
      });

      afterEach(() => {
        process.env = env;
        process.ppid = ppid;
      });

      // Changes the contents of a file, but keeps its mtime. The builder
      // transforms the file again only if it has no cache entry for it.
      function replaceContents(name, contents) {
        const file = path.join(tempDir, name);
        const { atime, mtime } = fs.statSync(file);
        fs.writeFileSync(file, contents);
        fs.utimesSync(file, atime, mtime);
      }

      test('a new plugin instance uses the styles in the cache', async () => {
        writeFile('a.js', RED);
        expect(await createWatcher()()).toContain('color:red');

        replaceContents('a.js', BLUE);
        expect(await createWatcher()()).toContain('color:red');

        writeFile('a.js', BLUE);
        const css = await createWatcher()();
        expect(css).toContain('color:blue');
        expect(css).not.toContain('color:red');
      });

      test('a new plugin instance removes the styles of deleted files', async () => {
        writeFile('a.js', RED);
        writeFile('b.js', BLUE);
        expect(await createWatcher()()).toContain('color:red');

        fs.rmSync(path.join(tempDir, 'a.js'));
        expect(await createWatcher()()).not.toContain('color:red');
      });

      test('a new dev server session does not use the old cache', async () => {
        writeFile('a.js', RED);
        expect(await createWatcher()()).toContain('color:red');

        replaceContents('a.js', BLUE);
        process.ppid = ppid + 1;
        expect(await createWatcher()()).toContain('color:blue');
      });

      test('removes the cache files of dev server sessions that ended', async () => {
        // A process id that no process has
        const endedSession = `cache-${2 ** 30}-0123456789abcdef.json`;
        // The test process runs
        const runningSession = `cache-${process.pid}-0123456789abcdef.json`;
        fs.mkdirSync(cacheDir(), { recursive: true });
        fs.writeFileSync(path.join(cacheDir(), endedSession), '{}');
        fs.writeFileSync(path.join(cacheDir(), runningSession), '{}');

        writeFile('a.js', RED);
        await createWatcher()();
        const files = fs.readdirSync(cacheDir());
        expect(files).toHaveLength(2);
        expect(files).not.toContain(endedSession);
        expect(files).toContain(runningSession);
      });

      test('a change to the Babel options does not use the old cache', async () => {
        const babelConfig = (pattern) => ({
          configFile: path.join(fixturesDir, '.babelrc.js'),
          ignore: [pattern]
        });
        writeFile('a.js', RED);
        expect(
          await createWatcher({ babelConfig: babelConfig(/first/) })()
        ).toContain('color:red');

        // JSON.stringify gives the same value for both patterns
        replaceContents('a.js', BLUE);
        expect(
          await createWatcher({ babelConfig: babelConfig(/second/) })()
        ).toContain('color:blue');
      });

      test('a change to the include or exclude patterns uses the same cache', async () => {
        writeFile('a.js', RED);
        expect(await createWatcher()()).toContain('color:red');

        replaceContents('a.js', BLUE);
        expect(await createWatcher({ exclude: ['b.js'] })()).toContain(
          'color:red'
        );
      });

      test('a change to a Babel config file does not use the old cache', async () => {
        // Babel finds babel.config.json in its cwd without a configFile option
        const babelConfigJson = JSON.stringify({
          extends: path.join(fixturesDir, '.babelrc.js')
        });
        const options = { babelConfig: { cwd: tempDir } };
        writeFile('babel.config.json', babelConfigJson);
        writeFile('a.js', RED);
        expect(await createWatcher(options)()).toContain('color:red');

        replaceContents('a.js', BLUE);
        writeFile('babel.config.json', babelConfigJson);
        expect(await createWatcher(options)()).toContain('color:blue');
      });

      test('a new plugin instance shows the error of a file that failed to transform', async () => {
        writeFile('a.js', RED);
        const build = createWatcher();
        expect(await build()).toContain('color:red');

        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        try {
          writeFile('a.js', `${RED}export const broken = ;\n`);
          expect(await build()).toContain('color:red');
        } finally {
          warn.mockRestore();
        }

        await expect(createWatcher()()).rejects.toThrow('Unexpected token');
      });

      test('writes the cache only when the state changes', async () => {
        writeFile('a.js', RED);
        const build = createWatcher();
        await build();
        fs.rmSync(cacheDir(), { recursive: true });

        await build();
        expect(fs.existsSync(cacheDir())).toBe(false);

        writeFile('a.js', BLUE);
        await build();
        expect(fs.existsSync(cacheDir())).toBe(true);
      });

      test('is not used when the Babel options contain a function', async () => {
        const options = {
          babelConfig: {
            configFile: path.join(fixturesDir, '.babelrc.js'),
            plugins: [() => ({})]
          }
        };
        writeFile('a.js', RED);
        expect(await createWatcher(options)()).toContain('color:red');
        expect(fs.existsSync(cacheDir())).toBe(false);
      });

      test('is not used without Turbopack', async () => {
        delete process.env.TURBOPACK;
        writeFile('a.js', RED);
        expect(await createWatcher()()).toContain('color:red');
        expect(fs.existsSync(cacheDir())).toBe(false);

        replaceContents('a.js', BLUE);
        expect(await createWatcher()()).toContain('color:blue');
      });

      test('is not used outside development', async () => {
        process.env.NODE_ENV = 'production';
        writeFile('a.js', RED);
        expect(await createWatcher()()).toContain('color:red');
        expect(fs.existsSync(cacheDir())).toBe(false);

        replaceContents('a.js', BLUE);
        expect(await createWatcher()()).toContain('color:blue');
      });

      test('leaves no temporary files', async () => {
        writeFile('a.js', RED);
        await createWatcher()();
        const files = fs.readdirSync(cacheDir());
        expect(files).toHaveLength(1);
        expect(files[0]).toMatch(/^cache-\d+-[0-9a-f]{16}\.json$/);
      });
    });
  });
});
