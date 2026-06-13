/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import { getInterpolatedStyle } from '../animationInterpolation';

// Mock dependencies
jest.mock('../../react-native', () => ({
  Animated: {
    Value: jest.fn()
  }
}));

jest.mock('../keyframeRegistry', () => ({
  keyframeRegistry: {
    resolve: jest.fn()
  }
}));

jest.mock('../../modules/sharedAnimationUtils', () => ({
  collectAnimatedProperties: jest.fn(() => ({}))
}));

jest.mock('../animationProperties', () => ({
  applyFillModeStyles: jest.fn(() => null)
}));

jest.mock('../propertyInterpolation', () => ({
  interpolateTransformProperty: jest.fn(),
  interpolateRegularProperty: jest.fn()
}));

jest.mock('../../utils/stylePropertyUtils', () => ({
  toReactNativeStyle: jest.fn((style) => style)
}));

describe('animationInterpolation', () => {
  let mockAnimatedValue;
  let mockKeyframeRegistry;
  let mockCollectAnimatedProperties;
  let mockApplyFillModeStyles;
  let mockInterpolateTransformProperty;
  let mockInterpolateRegularProperty;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAnimatedValue = { value: 0.5 };
    mockKeyframeRegistry = require('../keyframeRegistry').keyframeRegistry;
    mockCollectAnimatedProperties =
      require('../../modules/sharedAnimationUtils').collectAnimatedProperties;
    mockApplyFillModeStyles =
      require('../animationProperties').applyFillModeStyles;
    mockInterpolateTransformProperty =
      require('../propertyInterpolation').interpolateTransformProperty;
    mockInterpolateRegularProperty =
      require('../propertyInterpolation').interpolateRegularProperty;
  });

  describe('getInterpolatedStyle', () => {
    test('should return base style when keyframe definition is not found', () => {
      mockKeyframeRegistry.resolve.mockReturnValue(null);

      const baseStyle = { opacity: 0.5 };
      const result = getInterpolatedStyle(
        mockAnimatedValue,
        'nonexistent',
        baseStyle
      );

      expect(result).toBe(baseStyle);
      expect(mockKeyframeRegistry.resolve).toHaveBeenCalledWith('nonexistent');
    });

    test('should return fillMode result when applyFillModeStyles returns non-null', () => {
      const keyframeDefinition = {
        id: 'test',
        keyframes: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      };
      const fillModeResult = { opacity: 1 };

      mockKeyframeRegistry.resolve.mockReturnValue(keyframeDefinition);
      mockApplyFillModeStyles.mockReturnValue(fillModeResult);

      const baseStyle = { opacity: 0.5 };
      const result = getInterpolatedStyle(
        mockAnimatedValue,
        'test',
        baseStyle,
        'reverse',
        'forwards',
        'finished'
      );

      expect(result).toBe(fillModeResult);
      expect(mockApplyFillModeStyles).toHaveBeenCalledWith(
        keyframeDefinition.keyframes,
        'reverse',
        'forwards',
        'finished',
        baseStyle
      );
    });

    test('should interpolate transform properties', () => {
      const keyframeDefinition = {
        id: 'test',
        keyframes: {
          '0%': { transform: 'translateX(0px)' },
          '100%': { transform: 'translateX(100px)' }
        }
      };

      mockKeyframeRegistry.resolve.mockReturnValue(keyframeDefinition);
      mockApplyFillModeStyles.mockReturnValue(null);
      mockCollectAnimatedProperties.mockReturnValue({ transform: true });

      const baseStyle = {};
      getInterpolatedStyle(mockAnimatedValue, 'test', baseStyle, 'alternate');

      expect(mockInterpolateTransformProperty).toHaveBeenCalledWith(
        expect.any(Object),
        'transform',
        keyframeDefinition.keyframes,
        mockAnimatedValue,
        'alternate'
      );
      expect(mockInterpolateRegularProperty).not.toHaveBeenCalled();
    });

    test('should interpolate regular properties', () => {
      const keyframeDefinition = {
        id: 'test',
        keyframes: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      };

      mockKeyframeRegistry.resolve.mockReturnValue(keyframeDefinition);
      mockApplyFillModeStyles.mockReturnValue(null);
      mockCollectAnimatedProperties.mockReturnValue({ opacity: true });

      const baseStyle = { opacity: 0.5 };
      getInterpolatedStyle(mockAnimatedValue, 'test', baseStyle);

      expect(mockInterpolateRegularProperty).toHaveBeenCalledWith(
        expect.any(Object),
        'opacity',
        keyframeDefinition.keyframes,
        baseStyle,
        mockAnimatedValue,
        'normal'
      );
      expect(mockInterpolateTransformProperty).not.toHaveBeenCalled();
    });

    test('should handle mixed transform and regular properties', () => {
      const keyframeDefinition = {
        id: 'test',
        keyframes: {
          '0%': { opacity: 0, transform: 'scale(1)' },
          '100%': { opacity: 1, transform: 'scale(2)' }
        }
      };

      mockKeyframeRegistry.resolve.mockReturnValue(keyframeDefinition);
      mockApplyFillModeStyles.mockReturnValue(null);
      mockCollectAnimatedProperties.mockReturnValue({
        opacity: true,
        transform: true
      });

      const baseStyle = { opacity: 0.5 };
      getInterpolatedStyle(mockAnimatedValue, 'test', baseStyle);

      expect(mockInterpolateTransformProperty).toHaveBeenCalledWith(
        expect.any(Object),
        'transform',
        keyframeDefinition.keyframes,
        mockAnimatedValue,
        'normal'
      );
      expect(mockInterpolateRegularProperty).toHaveBeenCalledWith(
        expect.any(Object),
        'opacity',
        keyframeDefinition.keyframes,
        baseStyle,
        mockAnimatedValue,
        'normal'
      );
    });

    test('should use default parameter values', () => {
      const keyframeDefinition = {
        id: 'test',
        keyframes: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      };

      mockKeyframeRegistry.resolve.mockReturnValue(keyframeDefinition);
      mockApplyFillModeStyles.mockReturnValue(null);
      mockCollectAnimatedProperties.mockReturnValue({});

      const baseStyle = {};
      getInterpolatedStyle(mockAnimatedValue, 'test', baseStyle);

      expect(mockApplyFillModeStyles).toHaveBeenCalledWith(
        keyframeDefinition.keyframes,
        'normal', // default direction
        'none', // default fillMode
        'not-started', // default animationState
        baseStyle
      );
    });
  });
});
