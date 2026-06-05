/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const config = {
  assumptions: {
    iterableIsArray: true
  },
  comments: false,
  parserOpts: {
    enableExperimentalComponentSyntax: true,
    reactRuntimeTarget: '19'
  },
  plugins: ['babel-plugin-syntax-hermes-parser'],
  presets: [
    [
      '@babel/preset-react',
      {
        runtime: 'automatic'
      }
    ],
    '@babel/preset-flow'
  ]
};

export default config;
