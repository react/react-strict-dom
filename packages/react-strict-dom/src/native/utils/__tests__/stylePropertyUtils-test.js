/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import { toReactNativeStyle, safeTransformArray } from '../stylePropertyUtils';

describe('stylePropertyUtils', () => {
  describe('toReactNativeStyle', () => {
    test('converts valid style properties', () => {
      const mixedStyle = {
        color: 'red',
        fontSize: 16,
        opacity: 0.5,
        transform: [{ translateX: 10 }],
        animatedValue: { interpolate: jest.fn() },
        nullValue: null
      };

      const result = toReactNativeStyle(mixedStyle);

      expect(result).toEqual({
        color: 'red',
        fontSize: 16,
        opacity: 0.5,
        transform: [{ translateX: 10 }],
        animatedValue: { interpolate: expect.any(Function) },
        nullValue: null
      });
    });

    test('filters out invalid property types', () => {
      const mixedStyle = {
        color: 'red',
        fontSize: 16,
        invalidBool: true,
        invalidObj: { someProperty: 'value' }, // Object without interpolate
        invalidSymbol: Symbol('test'),
        invalidFunction: () => {},
        validNull: null,
        validUndefined: undefined
      };

      const result = toReactNativeStyle(mixedStyle);

      expect(result).toEqual({
        color: 'red',
        fontSize: 16,
        validNull: null,
        validUndefined: undefined
      });
    });

    test('handles empty style object', () => {
      const result = toReactNativeStyle({});
      expect(result).toEqual({});
    });

    test('handles string values', () => {
      const mixedStyle = {
        backgroundColor: '#000000',
        fontFamily: 'Arial'
      };

      const result = toReactNativeStyle(mixedStyle);

      expect(result).toEqual({
        backgroundColor: '#000000',
        fontFamily: 'Arial'
      });
    });

    test('handles number values', () => {
      const mixedStyle = {
        width: 100,
        height: 200,
        borderRadius: 0
      };

      const result = toReactNativeStyle(mixedStyle);

      expect(result).toEqual({
        width: 100,
        height: 200,
        borderRadius: 0
      });
    });

    test('handles array values', () => {
      const mixedStyle = {
        transform: [{ rotateX: '45deg' }, { scale: 1.5 }],
        shadowOffset: { width: 0, height: 2 }
      };

      const result = toReactNativeStyle(mixedStyle);

      expect(result).toEqual({
        transform: [{ rotateX: '45deg' }, { scale: 1.5 }]
        // shadowOffset should be filtered out as it's an object without interpolate
      });
    });

    test('handles animated values with interpolate property', () => {
      const animatedValue = {
        interpolate: jest.fn(),
        _value: 0
      };

      const mixedStyle = {
        opacity: animatedValue,
        translateX: animatedValue
      };

      const result = toReactNativeStyle(mixedStyle);

      expect(result).toEqual({
        opacity: animatedValue,
        translateX: animatedValue
      });
    });

    test('handles null and undefined values', () => {
      const mixedStyle = {
        color: null,
        fontSize: undefined,
        backgroundColor: 'red'
      };

      const result = toReactNativeStyle(mixedStyle);

      expect(result).toEqual({
        color: null,
        fontSize: undefined,
        backgroundColor: 'red'
      });
    });

    test('filters out complex objects without interpolate method', () => {
      const mixedStyle = {
        validStyle: 'red',
        invalidObject: {
          nested: {
            property: 'value'
          }
        },
        anotherValidStyle: 16
      };

      const result = toReactNativeStyle(mixedStyle);

      expect(result).toEqual({
        validStyle: 'red',
        anotherValidStyle: 16
      });
    });
  });

  describe('safeTransformArray', () => {
    test('returns array when value is array', () => {
      const transformArray = [
        { translateX: 10 },
        { rotateZ: '45deg' },
        { scale: 1.2 }
      ];

      const result = safeTransformArray(transformArray);

      expect(result).toBe(transformArray);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    test('returns empty array when value is not array', () => {
      expect(safeTransformArray('not-an-array')).toEqual([]);
      expect(safeTransformArray(null)).toEqual([]);
      expect(safeTransformArray(undefined)).toEqual([]);
      expect(safeTransformArray(42)).toEqual([]);
      expect(safeTransformArray({})).toEqual([]);
      expect(safeTransformArray(true)).toEqual([]);
    });

    test('returns empty array when value is empty array', () => {
      const result = safeTransformArray([]);
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    test('handles nested transform objects', () => {
      const complexTransform = [
        {
          matrix: [1, 0, 0, 1, 0, 0]
        },
        {
          perspective: 800
        }
      ];

      const result = safeTransformArray(complexTransform);

      expect(result).toBe(complexTransform);
      expect(result).toHaveLength(2);
    });

    test('handles falsy array values correctly', () => {
      const arrayWithFalsyValues = [
        null,
        undefined,
        { translateX: 0 },
        { opacity: 0 }
      ];

      const result = safeTransformArray(arrayWithFalsyValues);

      // Array contains null/undefined elements that fail isReactNativeTransform validation
      expect(result).toEqual([]);
    });
  });

  describe('integration tests', () => {
    test('toReactNativeStyle and safeTransformArray work together', () => {
      const mixedStyle = {
        transform: [{ translateX: 10 }, { rotateY: '30deg' }],
        color: 'blue',
        invalidProp: { complex: 'object' }
      };

      const cleanedStyle = toReactNativeStyle(mixedStyle);
      const safeTransform = safeTransformArray(cleanedStyle.transform);

      expect(cleanedStyle).toEqual({
        transform: [{ translateX: 10 }, { rotateY: '30deg' }],
        color: 'blue'
      });
      expect(safeTransform).toEqual([{ translateX: 10 }, { rotateY: '30deg' }]);
    });

    test('handles edge case with malformed transform', () => {
      const styleWithBadTransform = {
        transform: 'not-an-array',
        color: 'red'
      };

      const cleanedStyle = toReactNativeStyle(styleWithBadTransform);
      const safeTransform = safeTransformArray(cleanedStyle.transform);

      expect(cleanedStyle).toEqual({
        transform: 'not-an-array',
        color: 'red'
      });
      expect(safeTransform).toEqual([]); // Should return empty array for non-array
    });
  });
});
