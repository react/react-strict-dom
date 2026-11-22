/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

// Mock react-native module
jest.mock('../../react-native', () => ({
  Animated: {
    Value: jest.fn(() => ({
      interpolate: jest.fn()
    }))
  }
}));

// Mock shared interpolation dependencies
jest.mock('../../modules/sharedInterpolation', () => ({
  transformsHaveSameLengthTypesAndOrder: jest.fn(),
  createTransformWithProperty: jest.fn((property, value) => ({
    [property]: value
  })),
  interpolateTransformProperty: jest.fn(
    (animatedValue, inputRange, outputRange) => 'interpolated'
  ),
  TRANSFORM_PROPERTIES: [
    'perspective',
    'rotate',
    'rotateX',
    'rotateY',
    'rotateZ',
    'scale',
    'scaleX',
    'scaleY',
    'scaleZ',
    'skewX',
    'skewY',
    'translateX',
    'translateY'
  ]
}));

import {
  createAnimatedTransform,
  extractTransformPropertyValues,
  validateTransformPropertyConsistency,
  interpolateTransformArrays,
  interpolateTransformProperty,
  transformsHaveSameLengthTypesAndOrder,
  createTransformWithProperty,
  TRANSFORM_PROPERTIES
} from '../transformInterpolation';
import * as ReactNative from '../../react-native';
import * as SharedInterpolation from '../../modules/sharedInterpolation';

describe('transformInterpolation', () => {
  let mockAnimatedValue;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAnimatedValue = new ReactNative.Animated.Value(0);
  });

  describe('re-exports from sharedInterpolation', () => {
    test('should re-export interpolateTransformProperty', () => {
      expect(interpolateTransformProperty).toBe(
        SharedInterpolation.interpolateTransformProperty
      );
    });

    test('should re-export transformsHaveSameLengthTypesAndOrder', () => {
      expect(transformsHaveSameLengthTypesAndOrder).toBe(
        SharedInterpolation.transformsHaveSameLengthTypesAndOrder
      );
    });

    test('should re-export createTransformWithProperty', () => {
      expect(createTransformWithProperty).toBe(
        SharedInterpolation.createTransformWithProperty
      );
    });

    test('should re-export TRANSFORM_PROPERTIES', () => {
      expect(TRANSFORM_PROPERTIES).toBe(
        SharedInterpolation.TRANSFORM_PROPERTIES
      );
    });
  });

  describe('createAnimatedTransform', () => {
    test('should create animated transform for translateX', () => {
      const inputRange = [0, 1];
      const outputRange = [0, 100];

      const result = createAnimatedTransform(
        'translateX',
        mockAnimatedValue,
        inputRange,
        outputRange
      );

      expect(result).toEqual({
        translateX: 'interpolated'
      });
      expect(
        SharedInterpolation.interpolateTransformProperty
      ).toHaveBeenCalledWith(mockAnimatedValue, inputRange, outputRange);
    });

    test('should create animated transform for scale', () => {
      const inputRange = [0, 0.5, 1];
      const outputRange = [1, 1.5, 2];

      const result = createAnimatedTransform(
        'scale',
        mockAnimatedValue,
        inputRange,
        outputRange
      );

      expect(result).toEqual({
        scale: 'interpolated'
      });
      expect(
        SharedInterpolation.interpolateTransformProperty
      ).toHaveBeenCalledWith(mockAnimatedValue, inputRange, outputRange);
    });

    test('should create animated transform for rotate with string values', () => {
      const inputRange = [0, 1];
      const outputRange = ['0deg', '360deg'];

      const result = createAnimatedTransform(
        'rotate',
        mockAnimatedValue,
        inputRange,
        outputRange
      );

      expect(result).toEqual({
        rotate: 'interpolated'
      });
      expect(
        SharedInterpolation.interpolateTransformProperty
      ).toHaveBeenCalledWith(mockAnimatedValue, inputRange, outputRange);
    });
  });

  describe('extractTransformPropertyValues', () => {
    test('should extract translateX values from transform array', () => {
      const transforms = [
        { translateX: 10 },
        { translateX: 20, scale: 1.5 },
        { rotateZ: '45deg' }
      ];

      const result = extractTransformPropertyValues(transforms, 'translateX');

      expect(result).toEqual([10, 20, null]);
    });

    test('should extract scale values from transform array', () => {
      const transforms = [
        { scale: 1 },
        { translateX: 20, scale: 1.5 },
        { scale: 2 }
      ];

      const result = extractTransformPropertyValues(transforms, 'scale');

      expect(result).toEqual([1, 1.5, 2]);
    });

    test('should return null for missing properties', () => {
      const transforms = [{ translateX: 10 }, { rotateZ: '45deg' }];

      const result = extractTransformPropertyValues(transforms, 'scaleY');

      expect(result).toEqual([null, null]);
    });

    test('should handle empty transform array', () => {
      const result = extractTransformPropertyValues([], 'translateX');
      expect(result).toEqual([]);
    });
  });

  describe('validateTransformPropertyConsistency', () => {
    test('should return true for consistent transform arrays', () => {
      const transformArrays = [
        [{ translateX: 0 }, { scale: 1 }],
        [{ translateX: 10 }, { scale: 1.5 }],
        [{ translateX: 20 }, { scale: 2 }]
      ];

      const result = validateTransformPropertyConsistency(
        transformArrays,
        'translateX'
      );

      expect(result).toBe(true);
    });

    test('should return false for inconsistent lengths', () => {
      const transformArrays = [
        [{ translateX: 0 }, { scale: 1 }],
        [{ translateX: 10 }], // Different length
        [{ translateX: 20 }, { scale: 2 }]
      ];

      const result = validateTransformPropertyConsistency(
        transformArrays,
        'translateX'
      );

      expect(result).toBe(false);
    });

    test('should return false for inconsistent property presence', () => {
      const transformArrays = [
        [{ translateX: 0 }, { scale: 1 }],
        [{ translateX: 10 }, { rotateZ: '45deg' }], // Missing scale, has rotateZ instead
        [{ translateX: 20 }, { scale: 2 }]
      ];

      const result = validateTransformPropertyConsistency(
        transformArrays,
        'scale'
      );

      expect(result).toBe(false);
    });

    test('should return true for single transform array', () => {
      const transformArrays = [[{ translateX: 0 }, { scale: 1 }]];

      const result = validateTransformPropertyConsistency(
        transformArrays,
        'translateX'
      );

      expect(result).toBe(true);
    });

    test('should return true for empty transform arrays', () => {
      const result = validateTransformPropertyConsistency([], 'translateX');
      expect(result).toBe(true);
    });

    test('should handle mixed property presence correctly', () => {
      const transformArrays = [
        [{ translateX: 0, scale: 1 }, { rotateZ: '0deg' }],
        [{ translateX: 10, scale: 1.5 }, { rotateZ: '45deg' }]
      ];

      // translateX is present in both arrays at same positions
      expect(
        validateTransformPropertyConsistency(transformArrays, 'translateX')
      ).toBe(true);
      // scale is present in both arrays at same positions
      expect(
        validateTransformPropertyConsistency(transformArrays, 'scale')
      ).toBe(true);
      // rotateZ is present in both arrays at same positions
      expect(
        validateTransformPropertyConsistency(transformArrays, 'rotateZ')
      ).toBe(true);
      // rotateX is absent in both arrays at all positions
      expect(
        validateTransformPropertyConsistency(transformArrays, 'rotateX')
      ).toBe(true);
    });
  });

  describe('interpolateTransformArrays', () => {
    beforeEach(() => {
      // Mock createTransformWithProperty to return objects with the property
      SharedInterpolation.createTransformWithProperty.mockImplementation(
        (property, value) => ({ [property]: value })
      );
    });

    test('should return empty array for empty input', () => {
      const result = interpolateTransformArrays(mockAnimatedValue, [0, 1], []);
      expect(result).toEqual([]);
    });

    test('should interpolate single property transforms', () => {
      const inputRange = [0, 1];
      const transformArrays = [[{ translateX: 0 }], [{ translateX: 100 }]];

      const result = interpolateTransformArrays(
        mockAnimatedValue,
        inputRange,
        transformArrays
      );

      expect(result).toEqual([{ translateX: 'interpolated' }]);
      expect(
        SharedInterpolation.interpolateTransformProperty
      ).toHaveBeenCalledWith(mockAnimatedValue, [0, 1], [0, 100]);
    });

    test('should interpolate multiple property transforms', () => {
      const inputRange = [0, 1];
      const transformArrays = [
        [{ translateX: 0, scale: 1 }],
        [{ translateX: 100, scale: 2 }]
      ];

      const result = interpolateTransformArrays(
        mockAnimatedValue,
        inputRange,
        transformArrays
      );

      expect(result).toEqual([
        { translateX: 'interpolated', scale: 'interpolated' }
      ]);
      expect(
        SharedInterpolation.interpolateTransformProperty
      ).toHaveBeenCalledTimes(2);
    });

    test('should handle multiple transforms in array', () => {
      const inputRange = [0, 1];
      const transformArrays = [
        [{ translateX: 0 }, { scale: 1 }],
        [{ translateX: 100 }, { scale: 2 }]
      ];

      const result = interpolateTransformArrays(
        mockAnimatedValue,
        inputRange,
        transformArrays
      );

      expect(result).toEqual([
        { translateX: 'interpolated' },
        { scale: 'interpolated' }
      ]);
    });

    test('should handle missing transforms in some keyframes', () => {
      const inputRange = [0, 0.5, 1];
      const transformArrays = [
        [{ translateX: 0 }],
        [{ translateX: 50 }],
        [{ translateX: 100 }]
      ];

      const result = interpolateTransformArrays(
        mockAnimatedValue,
        inputRange,
        transformArrays
      );

      expect(result).toEqual([{ translateX: 'interpolated' }]);
    });

    test('should handle partial property presence', () => {
      const inputRange = [0, 0.5, 1];
      const transformArrays = [
        [{ translateX: 0, scale: 1 }],
        [{ translateX: 50 }], // Missing scale
        [{ translateX: 100, scale: 2 }]
      ];

      interpolateTransformArrays(
        mockAnimatedValue,
        inputRange,
        transformArrays
      );

      // Should interpolate translateX from all three keyframes
      expect(
        SharedInterpolation.interpolateTransformProperty
      ).toHaveBeenCalledWith(mockAnimatedValue, [0, 0.5, 1], [0, 50, 100]);

      // Should interpolate scale from only first and third keyframes
      expect(
        SharedInterpolation.interpolateTransformProperty
      ).toHaveBeenCalledWith(mockAnimatedValue, [0, 1], [1, 2]);
    });

    test('should handle single valid value as static', () => {
      const inputRange = [0, 1];
      const transformArrays = [
        [{ translateX: 50 }],
        [{}] // No translateX in second keyframe
      ];

      const result = interpolateTransformArrays(
        mockAnimatedValue,
        inputRange,
        transformArrays
      );

      expect(result).toEqual([{ translateX: 50 }]);
      // Should not call interpolation for single value
      expect(
        SharedInterpolation.interpolateTransformProperty
      ).not.toHaveBeenCalled();
    });

    test('should skip properties with no valid values', () => {
      const inputRange = [0, 1];
      const transformArrays = [
        [{}], // No properties
        [{}] // No properties
      ];

      const result = interpolateTransformArrays(
        mockAnimatedValue,
        inputRange,
        transformArrays
      );

      expect(result).toEqual([]);
    });

    test('should handle complex multi-keyframe scenario', () => {
      const inputRange = [0, 0.33, 0.66, 1];
      const transformArrays = [
        [{ translateX: 0, scale: 1 }, { rotate: '0deg' }],
        [{ translateX: 33, scale: 1.33 }, { rotate: '120deg' }],
        [{ translateX: 66, scale: 1.66 }, { rotate: '240deg' }],
        [{ translateX: 100, scale: 2 }, { rotate: '360deg' }]
      ];

      const result = interpolateTransformArrays(
        mockAnimatedValue,
        inputRange,
        transformArrays
      );

      expect(result).toEqual([
        { translateX: 'interpolated', scale: 'interpolated' },
        { rotate: 'interpolated' }
      ]);

      expect(
        SharedInterpolation.interpolateTransformProperty
      ).toHaveBeenCalledTimes(3);
    });

    test('should not include transforms with no animated or static properties', () => {
      const inputRange = [0, 1];
      const transformArrays = [
        [{ translateX: 0 }, {}], // Second transform is empty
        [{ translateX: 100 }, {}] // Second transform is empty
      ];

      const result = interpolateTransformArrays(
        mockAnimatedValue,
        inputRange,
        transformArrays
      );

      expect(result).toEqual([{ translateX: 'interpolated' }]);
      // Should only return the first transform since second has no properties
    });
  });
});
