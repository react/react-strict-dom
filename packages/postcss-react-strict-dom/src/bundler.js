/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const babel = require('@babel/core');
const stylexBabelPlugin = require('@stylexjs/babel-plugin');

// Creates a stateful bundler for processing styles using Babel.
module.exports = function createBundler() {
  const styleXRulesMap = new Map();

  // Determines if the source code should be transformed
  function shouldTransform(sourceCode) {
    return sourceCode.includes('react-strict-dom');
  }

  // Transforms the source code using Babel, extracting styles and storing them.
  // Returns the result with the Babel config files that Babel loaded, or null
  // if the transform fails and the error is skipped.
  async function transform(id, sourceCode, babelConfig, options) {
    const { isDev, shouldSkipTransformError } = options;
    let result = null;
    let configFiles = [];
    try {
      // Load the config once, for the transform and for the list of config
      // files
      const partialConfig = await babel.loadPartialConfigAsync({
        filename: id,
        caller: {
          name: 'postcss-react-strict-dom',
          platform: 'web',
          isDev
        },
        ...babelConfig
      });
      if (partialConfig != null) {
        configFiles = Array.from(partialConfig.files);
        result = await babel.transformAsync(sourceCode, partialConfig.options);
      }
    } catch (error) {
      if (shouldSkipTransformError) {
        console.warn(
          `[postcss-react-strict-dom] Failed to transform "${id}": ${error.message}`
        );

        // Keep the old styles of the file. The error is often a temporary
        // syntax error during an edit.
        return null;
      }
      throw error;
    }

    if (result == null) {
      // Babel ignores the file (for example, with the `ignore` option), so
      // the file creates no styles
      result = { code: sourceCode, map: null, metadata: {} };
    }

    const { code, map, metadata } = result;
    const stylex = metadata.stylex;
    if (stylex != null && stylex.length > 0) {
      styleXRulesMap.set(id, stylex);
    } else {
      // The file no longer creates styles; remove its old styles
      styleXRulesMap.delete(id);
    }

    return { code, map, metadata, configFiles };
  }

  // Removes the stored styles for the specified file.
  function remove(id) {
    styleXRulesMap.delete(id);
  }

  // Returns all stored styles, so that they can be kept in a cache.
  function getRules() {
    return Array.from(styleXRulesMap.entries());
  }

  // Adds styles from a cache.
  function restore(entries) {
    for (const [id, rules] of entries) {
      styleXRulesMap.set(id, rules);
    }
  }

  //  Bundles all collected styles into a single CSS string.
  function bundle({ useCSSLayers }) {
    const rules = Array.from(styleXRulesMap.values()).flat();

    const css = stylexBabelPlugin.processStylexRules(rules, {
      useLayers: useCSSLayers
    });

    return css;
  }

  return {
    shouldTransform,
    transform,
    remove,
    getRules,
    restore,
    bundle
  };
};
