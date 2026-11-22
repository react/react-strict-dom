/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

'use strict';

import { merge } from '../merge';

/**
 * Based on https://github.com/necolas/styleq/blob/main/test/styleq.test.js
 *
 * Copyright (c) Nicolas Gallagher
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function stringifyInlineStyle(inlineStyle) {
  let str = '';
  Object.keys(inlineStyle).forEach((prop) => {
    const value = inlineStyle[prop];
    str += `${prop}:${value};`;
  });
  return str;
}

describe('merge()', () => {
  describe('invalid values', () => {
    beforeAll(() => {
      jest.spyOn(global.console, 'error').mockImplementation((msg) => {
        throw new Error(msg);
      });
    });
    afterAll(() => {
      global.console.error.mockRestore();
    });

    test('error if extracted property values are not strings or null', () => {
      expect(() => merge({ $$css: true, a: 1 })).toThrow();
      expect(() => merge({ $$css: true, a: undefined })).toThrow();
      expect(() => merge({ $$css: true, a: false })).toThrow();
      expect(() => merge({ $$css: true, a: true })).toThrow();
      expect(() => merge({ $$css: true, a: {} })).toThrow();
      expect(() => merge({ $$css: true, a: [] })).toThrow();
      expect(() => merge({ $$css: true, a: new Date() })).toThrow();
    });
  });

  test('combines different class names', () => {
    const style = { $$css: true, a: 'aaa', b: 'bbb' };
    expect(merge(style).className).toBe('aaa bbb');
  });

  test('combines different class names in order', () => {
    const a = { $$css: true, a: 'a', ':focus$aa': 'focus$aa' };
    const b = { $$css: true, b: 'b' };
    const c = { $$css: true, c: 'c', ':focus$cc': 'focus$cc' };
    expect(merge([a, b, c]).className).toBe('a focus$aa b c focus$cc');
  });

  test('dedupes class names for the same key', () => {
    const a = { $$css: true, backgroundColor: 'backgroundColor-a' };
    const b = { $$css: true, backgroundColor: 'backgoundColor-b' };
    const c = { $$css: true, backgroundColor: 'backgoundColor-c' };
    expect(merge([a, b]).className).toEqual('backgoundColor-b');
    // Tests memoized result of [a,b] is correct
    expect(merge([c, a, b]).className).toEqual('backgoundColor-b');
  });

  test('dedupes class names with "null" value', () => {
    const a = { $$css: true, backgroundColor: 'backgroundColor-a' };
    const b = { $$css: true, backgroundColor: null };
    expect(merge([a, b]).className).toEqual(undefined);
  });

  test('dedupes class names in complex merges', () => {
    const styles = {
      a: {
        $$css: true,
        backgroundColor: 'backgroundColor-a',
        borderColor: 'borderColor-a',
        borderStyle: 'borderStyle-a',
        borderWidth: 'borderWidth-a',
        boxSizing: 'boxSizing-a',
        display: 'display-a',
        listStyle: 'listStyle-a',
        marginTop: 'marginTop-a',
        marginEnd: 'marginEnd-a',
        marginBottom: 'marginBottom-a',
        marginStart: 'marginStart-a',
        paddingTop: 'paddingTop-a',
        paddingEnd: 'paddingEnd-a',
        paddingBottom: 'paddingBottom-a',
        paddingStart: 'paddingStart-a',
        textAlign: 'textAlign-a',
        textDecoration: 'textDecoration-a',
        whiteSpace: 'whiteSpace-a',
        wordWrap: 'wordWrap-a',
        zIndex: 'zIndex-a'
      },
      b: {
        $$css: true,
        cursor: 'cursor-b',
        touchAction: 'touchAction-b'
      },
      c: {
        $$css: true,
        outline: 'outline-c'
      },
      d: {
        $$css: true,
        cursor: 'cursor-d',
        touchAction: 'touchAction-d'
      },
      e: {
        $$css: true,
        textDecoration: 'textDecoration-e',
        ':focus$textDecoration': 'focus$textDecoration-e'
      },
      f: {
        $$css: true,
        backgroundColor: 'backgroundColor-f',
        color: 'color-f',
        cursor: 'cursor-f',
        display: 'display-f',
        marginEnd: 'marginEnd-f',
        marginStart: 'marginStart-f',
        textAlign: 'textAlign-f',
        textDecoration: 'textDecoration-f',
        ':focus$color': 'focus$color-f',
        ':focus$textDecoration': 'focus$textDecoration-f',
        ':active$transform': 'active$transform-f',
        ':active$transition': 'active$transition-f'
      },
      g: {
        $$css: true,
        display: 'display-g',
        width: 'width-g'
      },
      h: {
        $$css: true,
        ':active$transform': 'active$transform-h'
      }
    };

    // This tests that repeat results are the same, and that memoization
    // works correctly when reusing data from earlier merges.

    // ONE
    const one = [
      styles.a,
      false,
      [
        styles.b,
        false,
        styles.c,
        [styles.d, false, styles.e, false, [styles.f, styles.g], [styles.h]]
      ]
    ];
    const oneValue = merge(one).className;
    const oneRepeat = merge(one).className;
    // Check the memoized result is correct
    expect(oneValue).toEqual(oneRepeat);
    expect(oneValue).toMatchInlineSnapshot(
      // eslint-disable-next-line
      `"borderColor-a borderStyle-a borderWidth-a boxSizing-a listStyle-a marginTop-a marginBottom-a paddingTop-a paddingEnd-a paddingBottom-a paddingStart-a whiteSpace-a wordWrap-a zIndex-a outline-c touchAction-d backgroundColor-f color-f cursor-f marginEnd-f marginStart-f textAlign-f textDecoration-f focus$color-f focus$textDecoration-f active$transition-f display-g width-g active$transform-h"`
    );

    // TWO
    const two = [
      styles.d,
      false,
      [
        styles.c,
        false,
        styles.b,
        [styles.a, false, styles.e, false, [styles.f, styles.g], [styles.h]]
      ]
    ];
    const twoValue = merge(two).className;
    const twoRepeat = merge(two).className;
    // Check the memoized result is correct
    expect(twoValue).toEqual(twoRepeat);
    expect(twoValue).toMatchInlineSnapshot(
      // eslint-disable-next-line
      `"outline-c touchAction-b borderColor-a borderStyle-a borderWidth-a boxSizing-a listStyle-a marginTop-a marginBottom-a paddingTop-a paddingEnd-a paddingBottom-a paddingStart-a whiteSpace-a wordWrap-a zIndex-a backgroundColor-f color-f cursor-f marginEnd-f marginStart-f textAlign-f textDecoration-f focus$color-f focus$textDecoration-f active$transition-f display-g width-g active$transform-h"`
    );
  });

  test('dedupes inline styles', () => {
    const { style } = merge([{ '--a': 'a' }, { '--a': 'aa' }]);
    expect(style).toEqual({ '--a': 'aa' });
    const { style: style2 } = merge([{ a: 'a' }, { a: null }]);
    expect(style2).toEqual({ a: null });
  });

  test('preserves order of stringified inline style', () => {
    const { style } = merge([{ font: 'inherit', fontSize: 12 }]);
    const str = stringifyInlineStyle(style);
    // eslint-disable-next-line
    expect(str).toMatchInlineSnapshot(`"font:inherit;fontSize:12;"`);

    const { style: style2 } = merge([{ font: 'inherit' }, { fontSize: 12 }]);
    const str2 = stringifyInlineStyle(style2);
    // eslint-disable-next-line
    expect(str2).toMatchInlineSnapshot(`"font:inherit;fontSize:12;"`);
  });

  test('does not dedupe class names and inline styles', () => {
    const a = { $$css: true, a: 'a', ':focus$a': 'focus$a' };
    const b = { $$css: true, b: 'b' };
    const binline = { b: 'b', bb: null };
    // Both should produce: [ 'a hover$a b', { b: 'b' } ]
    expect(merge([a, b, binline])).toEqual(merge([a, binline, b]));
  });

  test('supports generating debug strings', () => {
    const a = { $$css: 'path/to/a:1', a: 'aaa' };
    const b1 = { $$css: 'path/to/b:22', b: 'bbb' };
    const b2 = { $$css: 'path/to/b:33', b: 'bbb' };
    const b3 = { $$css: 'path/to/b:44', b: 'bbb' };
    const c = { $$css: 'path/to/c:3', b: 'ccc' };
    const { 'data-style-src': dataStyleSrc } = merge([a]);
    expect(dataStyleSrc).toBe('path/to/a:1');
    const { 'data-style-src': dataStyleSrc2 } = merge([a, [b1, c, b2], b3]);
    expect(dataStyleSrc2).toBe('path/to/a:1; path/to/b:22,33,44; path/to/c:3');
  });

  test('does not generate empty debug strings', () => {
    const a = { $$css: '', a: 'a' };
    const b = { $$css: true, b: 'b' };
    const { 'data-style-src': dataStyleSrc } = merge([a, b]);
    expect(dataStyleSrc).toBeUndefined();
  });

  test('handles debug strings without line numbers', () => {
    // This tests the line 67 coverage: if (line != null)
    const a = { $$css: 'path/to/a', a: 'aaa' }; // No line number after colon
    const { 'data-style-src': dataStyleSrc } = merge([a]);
    expect(dataStyleSrc).toBe('');
  });
});
