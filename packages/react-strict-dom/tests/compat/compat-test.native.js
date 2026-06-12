/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { css, compat, html } from 'react-strict-dom';
import { act, create } from 'react-test-renderer';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

describe('<compat.native>', () => {
  beforeEach(() => {
    // avoid console messages for these tests
    jest.spyOn(console, 'error');
    console.error.mockImplementation(() => {});
    jest.spyOn(console, 'warn');
    console.warn.mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.warn.mockRestore();
    jest.clearAllMocks();
  });

  test('errors if no function child', () => {
    expect(() =>
      act(() => {
        create(
          <compat.native>
            <View />
          </compat.native>
        );
      })
    ).toThrow();
  });

  test('default', () => {
    const styles = css.create({
      block: {
        paddingInline: '2rem'
      }
    });

    let root;
    act(() => {
      root = create(
        <compat.native style={styles.block}>
          {(nativeProps) => (
            <Pressable {...nativeProps} accessibilityLabel="label" />
          )}
        </compat.native>
      );
    });
    expect(root.toJSON()).toMatchSnapshot('default');
  });

  test('"as" equals "div"', () => {
    const styles = css.create({
      view: {
        paddingInline: '2rem'
      }
    });

    let root;
    act(() => {
      root = create(
        <compat.native as="div" style={styles.view}>
          {(nativeProps) => (
            <View {...nativeProps} accessibilityLabel="label" />
          )}
        </compat.native>
      );
    });
    expect(root.toJSON()).toMatchSnapshot('as=div');
  });

  test('"as" equals "img"', () => {
    const styles = css.create({
      image: {
        aspectRatio: '16/9'
      }
    });

    let root;
    act(() => {
      root = create(
        <compat.native as="img" srcSet="1x.img, 2x.img 2x" style={styles.image}>
          {(nativeProps) => (
            <Image {...nativeProps} accessibilityLabel="label" />
          )}
        </compat.native>
      );
    });
    expect(root.toJSON()).toMatchSnapshot('as=img');
  });

  test('"as" equals "input"', () => {
    const styles = css.create({
      input: {
        '::placeholder': {
          color: 'green'
        }
      }
    });

    let root;
    act(() => {
      root = create(
        <compat.native as="input" style={styles.input} type="password">
          {(nativeProps) => (
            <TextInput {...nativeProps} accessibilityLabel="label" />
          )}
        </compat.native>
      );
    });
    expect(root.toJSON()).toMatchSnapshot('as=input');
  });

  test('"as" equals "span"', () => {
    const styles = css.create({
      text: {
        color: 'blue',
        lineClamp: 3
      }
    });

    let root;
    act(() => {
      root = create(
        <compat.native as="span" style={styles.text}>
          {(nativeProps) => (
            <Text {...nativeProps} accessibilityLabel="label" />
          )}
        </compat.native>
      );
    });
    expect(root.toJSON()).toMatchSnapshot('as=span');
  });

  test('"as" equals "textarea"', () => {
    const styles = css.create({
      textarea: {}
    });

    let root;
    act(() => {
      root = create(
        <compat.native as="textarea" rows={3} style={styles.textarea}>
          {(nativeProps) => (
            <TextInput {...nativeProps} accessibilityLabel="label" />
          )}
        </compat.native>
      );
    });
    expect(root.toJSON()).toMatchSnapshot('as=textarea');
  });

  test('nested', () => {
    const styles = css.create({
      block: {
        color: 'red'
      }
    });

    let root;
    act(() => {
      root = create(
        <compat.native style={styles.block}>
          {(nativeProps) => (
            <View {...nativeProps} accessibilityLabel="label">
              <html.span>back to html</html.span>
            </View>
          )}
        </compat.native>
      );
    });
    expect(root.toJSON()).toMatchSnapshot('nested');
  });

  test('exposes inheritedTextStyle (resolved inherited color) to the function child', () => {
    const styles = css.create({
      red: { color: 'red' }
    });

    let captured;
    act(() => {
      create(
        <html.p style={styles.red}>
          <compat.native>
            {(nativeProps, meta) => {
              captured = meta;
              return <View {...nativeProps} />;
            }}
          </compat.native>
        </html.p>
      );
    });
    expect(captured.inheritedTextStyle.color).toBe('red');
  });

  test('own inheritable style overrides inherited in inheritedTextStyle', () => {
    const ancestor = css.create({ red: { color: 'red' } });
    const own = css.create({ green: { color: 'green' } });

    let captured;
    act(() => {
      create(
        <html.p style={ancestor.red}>
          <compat.native style={own.green}>
            {(nativeProps, meta) => {
              captured = meta;
              return <View {...nativeProps} />;
            }}
          </compat.native>
        </html.p>
      );
    });
    expect(captured.inheritedTextStyle.color).toBe('green');
  });

  test('exposes resolveStyleValue so var(...) can be resolved on host-only props', () => {
    const vars = css.defineVars({ brand: 'blue' });
    const theme = css.createTheme(vars, { brand: 'magenta' });

    let captured;
    act(() => {
      create(
        <html.div style={theme}>
          <compat.native>
            {(nativeProps, meta) => {
              captured = meta;
              return <View {...nativeProps} />;
            }}
          </compat.native>
        </html.div>
      );
    });
    // a literal value is returned unchanged
    expect(captured.resolveStyleValue('red')).toBe('red');
    // a theme token resolves through the cascade
    expect(captured.resolveStyleValue(vars.brand)).toBe('magenta');
  });

  test('styled', () => {
    const styles = css.create({
      block: {
        paddingInline: '2rem'
      }
    });

    let root;
    act(() => {
      root = create(
        <compat.native style={styles.block}>
          {(nativeProps) => (
            <Pressable
              {...nativeProps}
              accessibilityLabel="label"
              style={[{ position: 'absolute' }, nativeProps.style]}
            />
          )}
        </compat.native>
      );
    });
    expect(root.toJSON()).toMatchSnapshot('styled');
  });
});
