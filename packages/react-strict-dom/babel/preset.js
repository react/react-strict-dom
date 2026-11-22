/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const reactStrictPlugin = require('./plugin');
const styleXPlugin = require('@stylexjs/babel-plugin');

const defaultOptions = {
  debug: true,
  dev: true,
  platform: 'web'
};

function reactStrictPreset(_, options = {}) {
  const opts = { ...defaultOptions, ...options };

  const pluginsWeb = [
    [
      reactStrictPlugin,
      {
        debug: opts.debug
      }
    ],
    [
      styleXPlugin,
      {
        debug: opts.debug,
        dev: opts.dev,
        aliases: opts.aliases,
        importSources: [{ from: 'react-strict-dom', as: 'css' }],
        runtimeInjection: false,
        styleResolution: 'property-specificity',
        unstable_moduleResolution: {
          rootDir: process.cwd(),
          themeFileExtension: '.css',
          type: 'commonJS'
        }
      }
    ]
  ];

  return {
    plugins: opts.platform === 'web' ? pluginsWeb : null
  };
}

reactStrictPreset.generateStyles = styleXPlugin.processStylexRules;

module.exports = reactStrictPreset;
