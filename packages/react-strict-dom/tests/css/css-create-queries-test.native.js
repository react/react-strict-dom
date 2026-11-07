/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { css, html } from 'react-strict-dom';
import { act, create } from 'react-test-renderer';

describe('css.create(): @media', () => {
  const ReactNative = require('../../src/native/react-native');

  beforeEach(() => {
    ReactNative.Dimensions.get.mockReturnValue({
      height: 1000,
      width: 2000
    });
    ReactNative.Appearance.getColorScheme.mockReturnValue('light');

    // avoid console messages for these tests
    jest.spyOn(console, 'error');
    console.error.mockImplementation(() => {});
    jest.spyOn(console, 'warn');
    console.warn.mockImplementation(() => {});
  });

  afterEach(() => {
    ReactNative.Dimensions.get.mockReturnValue({
      height: 1000,
      width: 2000
    });
    ReactNative.Appearance.getColorScheme.mockReturnValue('light');

    console.error.mockRestore();
    console.warn.mockRestore();
    jest.clearAllMocks();
  });

  const tokens = css.defineVars({
    prefersColor: {
      default: 'blue',
      '@media (prefers-color-scheme: dark)': 'darkblue'
    }
  });

  const themeTokens = css.defineVars({
    prefersColor: {
      default: 'red',
      '@media (prefers-color-scheme: dark)': 'darkred'
    }
  });

  const theme = css.createTheme(themeTokens, {
    prefersColor: {
      default: 'green',
      '@media (prefers-color-scheme: dark)': 'darkgreen'
    }
  });

  const styles = css.create({
    root: {
      maxHeight: {
        default: 100,
        '@media (max-height: 400px)': 300
      },
      minHeight: {
        default: 100,
        '@media (min-height: 400px)': 300
      },
      maxWidth: {
        default: 100,
        '@media (max-width: 400px)': 300
      },
      minWidth: {
        default: 100,
        '@media (min-width: 400px)': 300
      }
    },
    themed: {
      backgroundColor: tokens.prefersColor,
      borderColor: themeTokens.prefersColor,
      color: {
        default: 'black',
        '@media (prefers-color-scheme: dark)': 'white'
      }
    }
  });

  describe('query matches', () => {
    test('(max-height: 400px)', () => {
      ReactNative.Dimensions.get.mockReturnValue({ height: 200 });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style.maxHeight).toBe(300);
    });

    test('(min-height: 400px)', () => {
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style.minHeight).toBe(300);
    });

    test('(max-width: 400px)', () => {
      ReactNative.Dimensions.get.mockReturnValue({ width: 200 });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style.maxWidth).toBe(300);
    });

    test('(min-width: 400px)', () => {
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style.minWidth).toBe(300);
    });

    test('(prefers-color-scheme: light)', () => {
      ReactNative.Appearance.getColorScheme.mockReturnValue('light');
      let root;
      act(() => {
        root = create(<html.span style={[theme, styles.themed]} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('(prefers-color-scheme: dark)', () => {
      ReactNative.Appearance.getColorScheme.mockReturnValue('dark');
      let root;
      act(() => {
        root = create(<html.span style={[theme, styles.themed]} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });
  });

  describe('query does not match', () => {
    test('(max-height: 400px)', () => {
      ReactNative.Dimensions.get.mockReturnValue({ height: 500 });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style.maxHeight).toBe(100);
    });

    test('(min-height: 400px)', () => {
      ReactNative.Dimensions.get.mockReturnValue({ height: 200 });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style.minHeight).toBe(100);
    });

    test('(max-width: 400px)', () => {
      ReactNative.Dimensions.get.mockReturnValue({ width: 500 });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style.maxWidth).toBe(100);
    });

    test('(min-width: 400px)', () => {
      ReactNative.Dimensions.get.mockReturnValue({ width: 200 });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style.minWidth).toBe(100);
    });

    test('(prefers-color-scheme: light)', () => {
      ReactNative.Appearance.getColorScheme.mockReturnValue('dark');
      let root;
      act(() => {
        root = create(<html.span style={[theme, styles.themed]} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('(prefers-color-scheme: dark)', () => {
      ReactNative.Appearance.getColorScheme.mockReturnValue('light');
      let root;
      act(() => {
        root = create(<html.span style={[theme, styles.themed]} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });
  });
});
