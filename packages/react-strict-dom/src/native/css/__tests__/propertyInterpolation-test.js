/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import {
  interpolateTransformProperty,
  interpolateRegularProperty
} from '../propertyInterpolation';
import { parseKeyframeStops } from '../keyframeRegistry';
import { parseTransform } from '../parseTransform';
import { interpolateTransformArrays } from '../transformInterpolation';
import { applyAnimationDirection } from '../animationProperties';
import { safeTransformArray } from '../../utils/stylePropertyUtils';

// Mock dependencies
jest.mock('../keyframeRegistry', () => ({
  parseKeyframeStops: jest.fn()
}));

jest.mock('../parseTransform', () => ({
  parseTransform: jest.fn()
}));

jest.mock('../transformInterpolation', () => ({
  interpolateTransformArrays: jest.fn()
}));

jest.mock('../animationProperties', () => ({
  applyAnimationDirection: jest.fn()
}));

jest.mock('../../utils/stylePropertyUtils', () => ({
  safeTransformArray: jest.fn()
}));

jest.mock('../../react-native', () => ({
  Animated: {
    Value: jest.fn()
  }
}));

const mockAnimatedValue = {
  interpolate: jest.fn().mockReturnValue('interpolated_value')
};

describe('propertyInterpolation', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    parseKeyframeStops.mockReturnValue([
      { percentage: '0%', value: 0 },
      { percentage: '100%', value: 1 }
    ]);

    parseTransform.mockReturnValue({
      resolveTransformValue: jest.fn().mockReturnValue([{ translateX: 10 }])
    });

    interpolateTransformArrays.mockReturnValue([
      { translateX: 'interpolated' }
    ]);

    applyAnimationDirection.mockImplementation((input, output) => ({
      finalInputRange: input,
      finalOutputRange: output
    }));

    safeTransformArray.mockImplementation((arr) => arr);
  });

  describe('interpolateTransformProperty', () => {
    test('skips when no string transforms found', () => {
      const result = {};
      const keyframes = {
        '0%': { transform: [{ translateX: 0 }] },
        '100%': { transform: [{ translateX: 100 }] }
      };

      interpolateTransformProperty(
        result,
        'transform',
        keyframes,
        mockAnimatedValue,
        'normal'
      );

      expect(result).toEqual({});
      expect(parseTransform).not.toHaveBeenCalled();
    });

    test('processes string transforms', () => {
      const result = {};
      const keyframes = {
        '0%': { transform: 'translateX(0px)' },
        '100%': { transform: 'translateX(100px)' }
      };

      interpolateTransformProperty(
        result,
        'transform',
        keyframes,
        mockAnimatedValue,
        'normal'
      );

      expect(parseTransform).toHaveBeenCalledWith('translateX(0px)');
      expect(parseTransform).toHaveBeenCalledWith('translateX(100px)');
      expect(parseKeyframeStops).toHaveBeenCalledWith(keyframes);
    });

    test('handles mixed string and array transforms', () => {
      const result = {};
      const keyframes = {
        '0%': { transform: 'translateX(0px)' },
        '50%': { transform: [{ translateY: 10 }] },
        '100%': { transform: 'translateX(100px)' }
      };

      safeTransformArray.mockReturnValue([{ translateY: 10 }]);

      interpolateTransformProperty(
        result,
        'transform',
        keyframes,
        mockAnimatedValue,
        'normal'
      );

      expect(parseTransform).toHaveBeenCalledTimes(2);
    });

    test('handles invalid transforms gracefully', () => {
      const result = {};
      const keyframes = {
        '0%': { transform: 'translateX(0px)' },
        '100%': { transform: 'invalid' }
      };

      parseTransform
        .mockReturnValueOnce({
          resolveTransformValue: jest.fn().mockReturnValue([{ translateX: 0 }])
        })
        .mockReturnValueOnce({
          resolveTransformValue: jest.fn().mockReturnValue(null) // Invalid transform
        });

      interpolateTransformProperty(
        result,
        'transform',
        keyframes,
        mockAnimatedValue,
        'normal'
      );

      expect(parseTransform).toHaveBeenCalledTimes(2);
    });

    test('applies animation direction', () => {
      const result = {};
      const keyframes = {
        '0%': { transform: 'translateX(0px)' },
        '100%': { transform: 'translateX(100px)' }
      };

      interpolateTransformProperty(
        result,
        'transform',
        keyframes,
        mockAnimatedValue,
        'reverse'
      );

      expect(applyAnimationDirection).toHaveBeenCalledWith(
        [0, 1],
        expect.any(Array),
        'reverse'
      );
    });

    test('creates interpolated transforms when successful', () => {
      const result = {};
      const keyframes = {
        '0%': { transform: 'translateX(0px)' },
        '100%': { transform: 'translateX(100px)' }
      };

      interpolateTransformProperty(
        result,
        'transform',
        keyframes,
        mockAnimatedValue,
        'normal'
      );

      expect(interpolateTransformArrays).toHaveBeenCalledWith(
        mockAnimatedValue,
        [0, 1],
        expect.any(Array)
      );
      expect(result.transform).toEqual([{ translateX: 'interpolated' }]);
    });

    test('handles interpolation errors gracefully', () => {
      const result = {};
      const keyframes = {
        '0%': { transform: 'translateX(0px)' },
        '100%': { transform: 'translateX(100px)' }
      };

      interpolateTransformArrays.mockImplementation(() => {
        throw new Error('Interpolation failed');
      });

      interpolateTransformProperty(
        result,
        'transform',
        keyframes,
        mockAnimatedValue,
        'normal'
      );

      expect(result).toEqual({}); // Should not add transform property on error
    });

    test('skips when insufficient keyframe data', () => {
      const result = {};
      const keyframes = {
        '0%': { transform: 'translateX(0px)' }
      };

      parseKeyframeStops.mockReturnValue([{ percentage: '0%', value: 0 }]);

      applyAnimationDirection.mockReturnValue({
        finalInputRange: [0],
        finalOutputRange: [[{ translateX: 0 }]]
      });

      interpolateTransformProperty(
        result,
        'transform',
        keyframes,
        mockAnimatedValue,
        'normal'
      );

      expect(interpolateTransformArrays).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    test('handles empty transform arrays', () => {
      const result = {};
      const keyframes = {
        '0%': { transform: 'translateX(0px)' },
        '100%': { transform: null }
      };

      interpolateTransformProperty(
        result,
        'transform',
        keyframes,
        mockAnimatedValue,
        'normal'
      );

      // Should process string transform but handle null gracefully
      expect(parseTransform).toHaveBeenCalledWith('translateX(0px)');
    });
  });

  describe('interpolateRegularProperty', () => {
    test('interpolates regular property with keyframe values', () => {
      const result = {};
      const keyframes = {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      };
      const baseStyle = { opacity: 0.5 };

      interpolateRegularProperty(
        result,
        'opacity',
        keyframes,
        baseStyle,
        mockAnimatedValue,
        'normal'
      );

      expect(parseKeyframeStops).toHaveBeenCalledWith(keyframes);
      expect(applyAnimationDirection).toHaveBeenCalledWith(
        [0, 1],
        [0, 1],
        'normal'
      );
      expect(mockAnimatedValue.interpolate).toHaveBeenCalledWith({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolate: 'clamp'
      });
      expect(result.opacity).toBe('interpolated_value');
    });

    test('uses fallback values when keyframe values are undefined', () => {
      const result = {};
      const keyframes = {
        '0%': { opacity: 0 },
        '100%': {} // Missing opacity
      };
      const baseStyle = { opacity: 0.5 };

      interpolateRegularProperty(
        result,
        'opacity',
        keyframes,
        baseStyle,
        mockAnimatedValue,
        'normal'
      );

      expect(mockAnimatedValue.interpolate).toHaveBeenCalledWith({
        inputRange: [0, 1],
        outputRange: [0, 0.5], // Uses fallback for missing value
        extrapolate: 'clamp'
      });
    });

    test('uses default value when both keyframe and fallback are unavailable', () => {
      const result = {};
      const keyframes = {
        '0%': { opacity: 0 },
        '100%': {} // Missing opacity
      };
      const baseStyle = {}; // No fallback

      interpolateRegularProperty(
        result,
        'opacity',
        keyframes,
        baseStyle,
        mockAnimatedValue,
        'normal'
      );

      expect(mockAnimatedValue.interpolate).toHaveBeenCalledWith({
        inputRange: [0, 1],
        outputRange: [0, 0], // Uses default value 0
        extrapolate: 'clamp'
      });
    });

    test('handles invalid keyframe values', () => {
      const result = {};
      const keyframes = {
        '0%': { opacity: 0 },
        '100%': { opacity: { invalid: 'object' } } // Invalid type
      };
      const baseStyle = { opacity: 0.5 };

      interpolateRegularProperty(
        result,
        'opacity',
        keyframes,
        baseStyle,
        mockAnimatedValue,
        'normal'
      );

      expect(mockAnimatedValue.interpolate).toHaveBeenCalledWith({
        inputRange: [0, 1],
        outputRange: [0, 0.5], // Uses fallback for invalid value
        extrapolate: 'clamp'
      });
    });

    test('applies animation direction', () => {
      const result = {};
      const keyframes = {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      };
      const baseStyle = {};

      interpolateRegularProperty(
        result,
        'opacity',
        keyframes,
        baseStyle,
        mockAnimatedValue,
        'reverse'
      );

      expect(applyAnimationDirection).toHaveBeenCalledWith(
        [0, 1],
        [0, 1],
        'reverse'
      );
    });

    test('skips interpolation with insufficient data', () => {
      const result = {};
      const keyframes = {
        '0%': { opacity: 0 }
      };
      const baseStyle = {};

      parseKeyframeStops.mockReturnValue([{ percentage: '0%', value: 0 }]);

      applyAnimationDirection.mockReturnValue({
        finalInputRange: [0],
        finalOutputRange: [0]
      });

      interpolateRegularProperty(
        result,
        'opacity',
        keyframes,
        baseStyle,
        mockAnimatedValue,
        'normal'
      );

      expect(mockAnimatedValue.interpolate).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    test('handles string values', () => {
      const result = {};
      const keyframes = {
        '0%': { color: 'red' },
        '100%': { color: 'blue' }
      };
      const baseStyle = {};

      interpolateRegularProperty(
        result,
        'color',
        keyframes,
        baseStyle,
        mockAnimatedValue,
        'normal'
      );

      expect(mockAnimatedValue.interpolate).toHaveBeenCalledWith({
        inputRange: [0, 1],
        outputRange: ['red', 'blue'],
        extrapolate: 'clamp'
      });
    });

    test('handles numeric values', () => {
      const result = {};
      const keyframes = {
        '0%': { width: 100 },
        '100%': { width: 200 }
      };
      const baseStyle = {};

      interpolateRegularProperty(
        result,
        'width',
        keyframes,
        baseStyle,
        mockAnimatedValue,
        'normal'
      );

      expect(mockAnimatedValue.interpolate).toHaveBeenCalledWith({
        inputRange: [0, 1],
        outputRange: [100, 200],
        extrapolate: 'clamp'
      });
    });

    test('handles mixed valid and invalid fallback values', () => {
      const result = {};
      const keyframes = {
        '0%': { opacity: 0 },
        '100%': {} // Missing opacity
      };
      const baseStyle = { opacity: { invalid: 'object' } }; // Invalid fallback

      interpolateRegularProperty(
        result,
        'opacity',
        keyframes,
        baseStyle,
        mockAnimatedValue,
        'normal'
      );

      expect(mockAnimatedValue.interpolate).toHaveBeenCalledWith({
        inputRange: [0, 1],
        outputRange: [0, 0], // Uses default when fallback is invalid
        extrapolate: 'clamp'
      });
    });

    test('handles complex keyframe stops', () => {
      const result = {};
      const keyframes = {
        '0%': { opacity: 0 },
        '25%': { opacity: 0.5 },
        '75%': { opacity: 0.8 },
        '100%': { opacity: 1 }
      };
      const baseStyle = {};

      parseKeyframeStops.mockReturnValue([
        { percentage: '0%', value: 0 },
        { percentage: '25%', value: 0.25 },
        { percentage: '75%', value: 0.75 },
        { percentage: '100%', value: 1 }
      ]);

      interpolateRegularProperty(
        result,
        'opacity',
        keyframes,
        baseStyle,
        mockAnimatedValue,
        'normal'
      );

      expect(mockAnimatedValue.interpolate).toHaveBeenCalledWith({
        inputRange: [0, 0.25, 0.75, 1],
        outputRange: [0, 0.5, 0.8, 1],
        extrapolate: 'clamp'
      });
    });
  });
});
