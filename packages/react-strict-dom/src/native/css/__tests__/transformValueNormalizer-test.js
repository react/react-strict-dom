/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import {
  normalizeTransformValue,
  normalizeKeyframeTransform,
  isValidTransformArray,
  IDENTITY_TRANSFORM
} from '../transformValueNormalizer';

describe('transformValueNormalizer', () => {
  describe('normalizeTransformValue', () => {
    test('should return identity transform for null/undefined', () => {
      expect(normalizeTransformValue(null)).toEqual(IDENTITY_TRANSFORM);
      expect(normalizeTransformValue()).toEqual(IDENTITY_TRANSFORM);
    });

    test('should handle CSS string transforms', () => {
      // This test will verify the integration with parseTransform
      const result = normalizeTransformValue('translateX(10px)');
      expect(Array.isArray(result)).toBe(true);
      // We can't easily test the exact parsed result without mocking parseTransform
    });

    test('should handle malformed CSS string transforms and return identity', () => {
      // Test case that will trigger the catch block (line 42)
      const result = normalizeTransformValue('invalidTransform(');
      expect(result).toEqual(IDENTITY_TRANSFORM);
    });

    test('should handle various malformed string inputs', () => {
      // Test more edge cases that might trigger errors in parsing
      const malformedInputs = [
        '', // empty string
        '   ', // whitespace only
        'scale()', // missing value
        'translate(', // incomplete
        'rotate(abc)', // invalid value
        'matrix(1,2,3)', // incomplete matrix
        'skewX(infinity)', // invalid number
        'perspective(-10)' // negative perspective
      ];

      malformedInputs.forEach((input) => {
        const result = normalizeTransformValue(input);
        expect(Array.isArray(result)).toBe(true);
        // Should either parse successfully or return identity transform
      });
    });

    test('should handle transform arrays with valid objects', () => {
      const transformArray = [{ translateX: 10 }, { scale: 2 }];
      const result = normalizeTransformValue(transformArray);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle transform arrays with all valid transform properties', () => {
      const validTransforms = [
        { matrix: [1, 0, 0, 1, 0, 0] },
        { perspective: 1000 },
        { rotate: 45 },
        { rotateX: 30 },
        { rotateY: 60 },
        { rotateZ: 90 },
        { scale: 1.5 },
        { scaleX: 2 },
        { scaleY: 0.5 },
        { scaleZ: 3 },
        { skewX: 15 },
        { skewY: -10 },
        { translateX: 100 },
        { translateY: 50 }
      ];

      const result = normalizeTransformValue(validTransforms);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(validTransforms.length);
    });

    test('should filter out invalid objects from transform arrays', () => {
      const mixedArray = [
        { translateX: 10 }, // valid
        null, // invalid - should be filtered out (line 50)
        { scale: 2 }, // valid
        { invalidProp: 123 }, // invalid - no valid transform property
        'string', // invalid - not object
        { translateY: 20 } // valid
      ];

      const result = normalizeTransformValue(mixedArray);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3); // Only 3 valid transforms should remain
    });

    test('should return identity transform when all array elements are invalid', () => {
      const invalidArray = [null, 'string', 123, { invalidProp: 'value' }, {}];

      const result = normalizeTransformValue(invalidArray);
      expect(result).toEqual(IDENTITY_TRANSFORM);
    });

    test('should return identity transform for invalid input types', () => {
      expect(normalizeTransformValue('invalid')).toEqual(IDENTITY_TRANSFORM);
      expect(normalizeTransformValue(123)).toEqual(IDENTITY_TRANSFORM);
      expect(normalizeTransformValue({})).toEqual(IDENTITY_TRANSFORM);
      expect(normalizeTransformValue(true)).toEqual(IDENTITY_TRANSFORM);
      expect(normalizeTransformValue(false)).toEqual(IDENTITY_TRANSFORM);
    });

    test('should create mutable copies of input arrays', () => {
      const originalArray = [{ translateX: 10 }];
      const result = normalizeTransformValue(originalArray);

      expect(result).not.toBe(originalArray); // Should be different reference
      expect(result).toEqual(originalArray); // But same content

      // Modify result to verify it's a mutable copy
      result.push({ scale: 2 });
      expect(originalArray.length).toBe(1); // Original unchanged
      expect(result.length).toBe(2); // Copy modified
    });

    test('should create mutable copy of identity transform', () => {
      const result1 = normalizeTransformValue(null);
      const result2 = normalizeTransformValue(undefined);

      expect(result1).not.toBe(IDENTITY_TRANSFORM); // Different reference
      expect(result2).not.toBe(IDENTITY_TRANSFORM); // Different reference
      expect(result1).not.toBe(result2); // Different references from each other
      expect(result1).toEqual(IDENTITY_TRANSFORM); // Same content
      expect(result2).toEqual(IDENTITY_TRANSFORM); // Same content
    });
  });

  describe('isValidTransformArray', () => {
    test('should return false for non-array values', () => {
      expect(isValidTransformArray(null)).toBe(false);
      expect(isValidTransformArray(undefined)).toBe(false);
      expect(isValidTransformArray('string')).toBe(false);
      expect(isValidTransformArray(123)).toBe(false);
      expect(isValidTransformArray({})).toBe(false);
      expect(isValidTransformArray(true)).toBe(false);
    });

    test('should return false for arrays with null/undefined elements', () => {
      expect(isValidTransformArray([null])).toBe(false);
      expect(isValidTransformArray([undefined])).toBe(false);
      expect(isValidTransformArray([{ scale: 1 }, null])).toBe(false);
    });

    test('should return false for arrays with non-object elements', () => {
      expect(isValidTransformArray(['string'])).toBe(false);
      expect(isValidTransformArray([123])).toBe(false);
      expect(isValidTransformArray([true])).toBe(false);
      expect(isValidTransformArray([{ scale: 1 }, 'invalid'])).toBe(false);
    });

    test('should return false for arrays with objects that have no valid transform properties', () => {
      expect(isValidTransformArray([{ invalidProp: 123 }])).toBe(false);
      expect(isValidTransformArray([{}])).toBe(false);
      expect(isValidTransformArray([{ color: 'red' }])).toBe(false);
    });

    test('should return true for valid transform arrays', () => {
      expect(isValidTransformArray([{ translateX: 10 }])).toBe(true);
      expect(isValidTransformArray([{ scale: 2 }, { rotate: 45 }])).toBe(true);
    });

    test('should return true for all valid transform properties', () => {
      const validProperties = [
        { matrix: [1, 0, 0, 1, 0, 0] },
        { perspective: 1000 },
        { rotate: 45 },
        { rotateX: 30 },
        { rotateY: 60 },
        { rotateZ: 90 },
        { scale: 1.5 },
        { scaleX: 2 },
        { scaleY: 0.5 },
        { scaleZ: 3 },
        { skewX: 15 },
        { skewY: -10 },
        { translateX: 100 },
        { translateY: 50 }
      ];

      // Test each property individually
      validProperties.forEach((transform) => {
        expect(isValidTransformArray([transform])).toBe(true);
      });

      // Test all properties together
      expect(isValidTransformArray(validProperties)).toBe(true);
    });

    test('should return true for empty array', () => {
      expect(isValidTransformArray([])).toBe(true);
    });

    test('should return false if any element in array is invalid', () => {
      const mixedArray = [
        { translateX: 10 }, // valid
        { invalidProp: 123 } // invalid
      ];
      expect(isValidTransformArray(mixedArray)).toBe(false);
    });
  });

  describe('normalizeKeyframeTransform', () => {
    test('should handle string keyframe values', () => {
      const result = normalizeKeyframeTransform('translateX(20px)');
      expect(Array.isArray(result)).toBe(true);
    });

    test('should handle array keyframe values', () => {
      const transformArray = [{ translateY: 15 }];
      const result = normalizeKeyframeTransform(transformArray);
      expect(Array.isArray(result)).toBe(true);
    });

    test('should handle invalid array keyframe values', () => {
      const invalidArray = [{ invalidProp: 'test' }];
      const result = normalizeKeyframeTransform(invalidArray);
      expect(result).toEqual(IDENTITY_TRANSFORM);
    });

    test('should handle non-string, non-array keyframe values', () => {
      expect(normalizeKeyframeTransform(123)).toEqual(IDENTITY_TRANSFORM);
      expect(normalizeKeyframeTransform({})).toEqual(IDENTITY_TRANSFORM);
      expect(normalizeKeyframeTransform(true)).toEqual(IDENTITY_TRANSFORM);
    });

    test('should handle arrays with some invalid objects', () => {
      const mixedArray = [{ translateX: 10 }, null, 'invalid'];
      const result = normalizeKeyframeTransform(mixedArray);
      expect(result).toEqual(IDENTITY_TRANSFORM);
    });

    test('should use fallback when normalization produces empty array and fallback provided', () => {
      const fallback = [{ scale: 1 }];
      const result = normalizeKeyframeTransform(null, fallback);
      // Since null normalizes to empty array, fallback should be used
      expect(result).toEqual(fallback);
    });

    test('should not use fallback when normalization produces valid result', () => {
      const fallback = [{ scale: 1 }];
      const result = normalizeKeyframeTransform([{ translateX: 10 }], fallback);
      expect(result).not.toEqual(fallback);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({ translateX: 10 });
    });

    test('should not use fallback when fallback is null or empty', () => {
      const result1 = normalizeKeyframeTransform(null, null);
      const result2 = normalizeKeyframeTransform(null, []);
      expect(result1).toEqual(IDENTITY_TRANSFORM);
      expect(result2).toEqual(IDENTITY_TRANSFORM);
    });

    test('should create mutable copy of fallback when used', () => {
      const fallback = [{ scale: 1 }];
      const result = normalizeKeyframeTransform(null, fallback);

      expect(result).not.toBe(fallback); // Different reference
      expect(result).toEqual(fallback); // Same content

      // Verify it's mutable
      result.push({ translateX: 10 });
      expect(fallback.length).toBe(1); // Original unchanged
      expect(result.length).toBe(2); // Copy modified
    });
  });
});
