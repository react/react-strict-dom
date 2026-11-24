/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { css, html } from 'react-strict-dom';
import { act, create } from 'react-test-renderer';

describe('css.* themes', () => {
  const ReactNative = require('../../src/native/react-native');

  beforeEach(() => {
    jest.spyOn(console, 'error');
    jest.spyOn(console, 'warn');
    console.error.mockImplementation(() => {});
    console.warn.mockImplementation(() => {});

    ReactNative.useColorScheme.mockReturnValue('light');
  });

  afterEach(() => {
    console.error.mockRestore();
    console.warn.mockRestore();
  });

  test('css.defineConsts', () => {
    const constants = css.defineConsts({
      redColor: 'red',
      blueColor: 'blue'
    });
    expect(constants).toMatchSnapshot('constants');
    expect(() => {
      constants.redColor = 'black';
    }).toThrow();
  });

  test('css.defineVars', () => {
    const tokens = css.defineVars({
      rootColor: 'red',
      themeAwareColor: {
        default: 'blue',
        '@media (prefers-color-scheme: dark)': 'green'
      }
    });

    expect(tokens).toMatchSnapshot('tokens');

    const styles = css.create({
      rootColor: {
        color: tokens.rootColor
      },
      themeAwareColor: {
        color: tokens.themeAwareColor
      }
    });

    let root;
    act(() => {
      root = create(<html.span style={styles.rootColor} />);
    });
    expect(root.toJSON().props.style.color).toBe('red');
    act(() => {
      root = create(<html.span style={styles.themeAwareColor} />);
    });
    expect(root.toJSON().props.style.color).toBe('blue');

    // dark theme
    ReactNative.useColorScheme.mockReturnValue('dark');
    act(() => {
      root = create(<html.span style={styles.themeAwareColor} />);
    });
    expect(root.toJSON().props.style.color).toBe('green');
  });

  test('css.createTheme', () => {
    const tokens = css.defineVars({
      rootColor: 'red'
    });
    const theme = css.createTheme(tokens, {
      rootColor: 'green'
    });

    expect(theme).toMatchSnapshot('theme');

    const styles = css.create({
      rootColor: {
        color: tokens.rootColor
      }
    });

    let root;
    act(() => {
      root = create(<html.span style={[theme, styles.rootColor]} />);
    });
    expect(root.toJSON().props.style.color).toBe('green');
  });

  test('does not parse malformed vars', () => {
    const styles = css.create({
      unfinished: {
        color: 'var(--testUnfinished'
      },
      bad: {
        color: 'var(bad--input)'
      },
      noVarFunc: {
        color: '--noVarFunc'
      },
      invalidVarFunc: {
        color: 'var ( --invalidVarFunc)'
      }
    });

    let root;
    act(() => {
      root = create(<html.span style={styles.unfinished} />);
    });
    expect(root.toJSON().props.style.color).toEqual(undefined);
    act(() => {
      root = create(<html.span style={styles.bad} />);
    });
    expect(root.toJSON().props.style.color).toEqual(undefined);
    act(() => {
      root = create(<html.span style={styles.noVarFunc} />);
    });
    expect(root.toJSON().props.style.color).toEqual('--noVarFunc');
    act(() => {
      root = create(<html.span style={styles.invalidVarFunc} />);
    });
    expect(root.toJSON().props.style.color).toEqual('var ( --invalidVarFunc)');
  });

  test('handles undefined variables', () => {
    const styles = css.create({
      root: {
        width: 'var(--unprovided)'
      }
    });
    let root;
    act(() => {
      root = create(<html.span style={styles.root} />);
    });
    expect(root.toJSON().props.style).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('unrecognized custom property "--unprovided"')
    );
  });

  test('inherited themes', () => {
    const tokens = css.defineVars({
      rootColor: 'red',
      otherColor: 'pink'
    });
    const theme = css.createTheme(tokens, {
      rootColor: 'green'
    });
    const nestedTheme = css.createTheme(tokens, {
      rootColor: {
        default: 'blue',
        '@media (prefers-color-scheme: dark)': 'purple'
      }
    });

    const styles = css.create({
      root: {
        backgroundColor: tokens.otherColor,
        color: tokens.rootColor
      },
      input: {
        '::placeholder': {
          color: tokens.rootColor
        }
      }
    });

    let root;
    act(() => {
      root = create(
        <>
          <html.span style={styles.root}>Expect color:red</html.span>
          <html.span style={[theme, styles.root]}>Expect color:green</html.span>
          <html.input
            placeholder="Expect placeholderTextColor:green"
            style={[theme, styles.input]}
          />
          <html.div style={theme}>
            <html.span style={styles.root}>
              Expect color:green (inherited)
            </html.span>
            <html.input
              placeholder="Expect placeholderTextColor:green"
              style={styles.input}
            />
            <html.div style={nestedTheme}>
              <html.span style={styles.root}>
                Expect color:blue (nested)
              </html.span>
              <html.input
                placeholder="Expect placeholderTextColor:blue"
                style={styles.input}
              />
            </html.div>
          </html.div>
          <html.span style={styles.root}>Expect color:red</html.span>
        </>
      );
    });
    expect(root.toJSON()).toMatchSnapshot();
  });

  test.each(['light', 'dark'])(
    'updates a width-dependent variable in %s mode',
    (colorScheme) => {
      const tokens = css.defineVars({
        fontSize: {
          default: '1rem',
          '@media (min-width: 400px)': '2rem'
        }
      });
      const styles = css.create({ text: { fontSize: tokens.fontSize } });
      ReactNative.useColorScheme.mockReturnValue(colorScheme);
      ReactNative.useWindowDimensions.mockReturnValue({
        fontScale: 1,
        height: 1000,
        width: 200
      });
      let root;
      act(() => {
        root = create(<html.span style={styles.text} />);
      });
      expect(root.toJSON().props.style.fontSize).toBe(16);

      ReactNative.useWindowDimensions.mockReturnValue({
        fontScale: 1,
        height: 1000,
        width: 400
      });
      act(() => {
        root.update(<html.span style={styles.text} />);
      });
      expect(root.toJSON().props.style.fontSize).toBe(32);
    }
  );

  test('resolves nested media, aliases and omitted variable declarations', () => {
    const wide = '@media (min-width: 400px)';
    const dark = '@media (prefers-color-scheme: dark)';
    const tokens = css.defineVars({
      size: {
        default: '1rem',
        [wide]: { default: '2rem', [dark]: '3rem' },
        [dark]: '1.5rem'
      },
      opacity: { default: null, [wide]: 0 },
      color: { default: 'red', [dark]: null },
      width: { default: '10px', '@media (width >= 400px)': '20px' }
    });
    const aliases = css.defineVars({
      fontSize: { default: '1rem', [wide]: tokens.size }
    });
    const styles = css.create({
      text: {
        color: tokens.color,
        fontSize: aliases.fontSize,
        minWidth: tokens.width,
        opacity: tokens.opacity.replace(')', ', 1)')
      }
    });
    ReactNative.useColorScheme.mockReturnValue('dark');
    ReactNative.useWindowDimensions.mockReturnValue({
      fontScale: 1,
      height: 1000,
      width: 200
    });
    let root;
    act(() => {
      root = create(<html.span style={styles.text} />);
    });
    expect(root.toJSON().props.style).toMatchObject({
      color: 'red',
      fontSize: 16,
      minWidth: 10,
      opacity: 1
    });

    ReactNative.useWindowDimensions.mockReturnValue({
      fontScale: 1,
      height: 1000,
      width: 400
    });
    act(() => {
      root.update(<html.span style={styles.text} />);
    });
    expect(root.toJSON().props.style).toMatchObject({
      color: 'red',
      fontSize: 48,
      minWidth: 10,
      opacity: 0
    });
  });

  test('matches compound media in scoped theme overrides', () => {
    const tokens = css.defineVars({ color: 'red' });
    const theme = css.createTheme(tokens, {
      color: {
        default: 'blue',
        '@media (min-width: 400px) and (prefers-color-scheme: dark)': 'green'
      }
    });
    const styles = css.create({ text: { color: tokens.color } });
    ReactNative.useWindowDimensions.mockReturnValue({
      height: 1000,
      width: 400
    });
    const render = () => (
      <>
        <html.span style={styles.text} />
        <html.div style={theme}>
          <html.span style={styles.text} />
        </html.div>
      </>
    );
    let root;
    act(() => {
      root = create(render());
    });
    expect(root.toJSON()[1].children[0].props.style.color).toBe('blue');

    ReactNative.useColorScheme.mockReturnValue('dark');
    act(() => {
      root.update(render());
    });
    expect(root.toJSON()[0].props.style.color).toBe('red');
    expect(root.toJSON()[1].children[0].props.style.color).toBe('green');
  });
});
