/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const babelPlugin = babel({
  babelHelpers: 'bundled',
  configFile: path.resolve(__dirname, 'rollup/babelConfig.mjs')
});

function ossLicensePlugin() {
  const header = `/**
 * @license react-strict-dom
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';`;

  return {
    renderChunk(source) {
      return `${header}\n${source}`;
    }
  };
}

const sharedPlugins = [
  babelPlugin,
  ossLicensePlugin(),
  resolve(),
  commonjs() // commonjs packages: postcss-value-parser, styleq
];

/**
 * Web bundles
 */
const webConfigs = [
  // OSS build
  {
    external: ['react', 'react/jsx-runtime', 'react-strict-dom'],
    input: path.join(__dirname, '../src/web/index.js'),
    output: {
      file: path.join(__dirname, '../dist/web/index.js'),
      format: 'es'
    },
    plugins: [...sharedPlugins],
    treeshake: {
      moduleSideEffects: false
    }
  }
];

/**
 * Native bundles
 */
const nativeConfigs = [
  // OSS build
  {
    external: [
      'react',
      'react/jsx-runtime',
      'react-strict-dom',
      /^react-native.*/
    ],
    input: path.join(__dirname, '../src/native/index.js'),
    output: {
      file: path.join(__dirname, '../dist/native/index.js'),
      format: 'es'
    },
    plugins: [...sharedPlugins],
    treeshake: {
      moduleSideEffects: false
    }
  }
];

export default [...webConfigs, ...nativeConfigs];
