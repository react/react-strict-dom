/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const babelConfig = require('../react-strict-dom/tools/jest/babelConfig.js');

module.exports = {
  displayName: 'react-strict-svg (web)',
  rootDir: __dirname,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/web/**/__tests__/*-test.js'],
  moduleNameMapper: {
    '^react-strict-dom$': '<rootDir>/../react-strict-dom/src/web/index.js'
  },
  transform: {
    '\\.[jt]sx?$': ['babel-jest', babelConfig()]
  }
};
