/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { css, html } from 'react-strict-dom';
import { act, create } from 'react-test-renderer';

describe('css.defineVars(): @media', () => {
  const ReactNative = require('../../src/native/react-native');

  beforeEach(() => {
    ReactNative.useWindowDimensions.mockReturnValue({
      height: 1000,
      width: 2000
    });
    ReactNative.useColorScheme.mockReturnValue('light');

    // avoid console messages for these tests
    jest.spyOn(console, 'error');
    console.error.mockImplementation(() => {});
    jest.spyOn(console, 'warn');
    console.warn.mockImplementation(() => {});
  });

  afterEach(() => {
    ReactNative.useWindowDimensions.mockReturnValue({
      height: 1000,
      width: 2000
    });
    ReactNative.useColorScheme.mockReturnValue('light');

    console.error.mockRestore();
    console.warn.mockRestore();
    jest.clearAllMocks();
  });

  const tokens = css.defineVars({
    prefersColor: {
      default: 'blue',
      '@media (prefers-color-scheme: dark)': 'darkblue'
    },
    maxHeight: {
      default: 100,
      '@media (max-height: 400px)': 300
    }
  });

  const styles = css.create({
    root: {
      backgroundColor: tokens.prefersColor,
      maxHeight: tokens.maxHeight
    }
  });

  describe('@media (prefers-color-scheme)', () => {
    test('color-scheme: light - returns default', () => {
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style.backgroundColor).toBe('blue');
    });

    test('color-scheme: dark - returns media query value)', () => {
      ReactNative.useColorScheme.mockReturnValue('dark');
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style.backgroundColor).toBe('darkblue');
    });
  });

  describe('other media queries', () => {
    test('matches (max-height: 400px) - returns default', () => {
      ReactNative.useWindowDimensions.mockReturnValue({ height: 100 });
      let root;
      act(() => {
        root = create(<html.span style={styles.root} />);
      });
      expect(root.toJSON().props.style.maxHeight).toBe(100);
    });
    test('matches (max-height: 400px) with color-scheme: dark - returns default', () => {
      ReactNative.useColorScheme.mockReturnValue('dark');
      ReactNative.useWindowDimensions.mockReturnValue({ height: 100 });
      let root;
      act(() => {
        root = create(<html.span style={styles.root} />);
      });
      expect(root.toJSON().props.style.maxHeight).toBe(100);
    });
    test('does not match (max-height: 400px) - returns default', () => {
      ReactNative.useWindowDimensions.mockReturnValue({ height: 1000 });
      let root;
      act(() => {
        root = create(<html.span style={styles.root} />);
      });
      expect(root.toJSON().props.style.maxHeight).toBe(100);
    });
  });
});
