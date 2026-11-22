/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import { parseAnimationString } from '../parseAnimationStrings';
import { normalizeAnimationProperties } from '../animationProperties';
import { applyAnimationDirection } from '../animationProperties';
import { applyFillModeStyles } from '../animationProperties';

// Mock parseTransform for fill mode tests
jest.mock('../parseTransform', () => ({
  parseTransform: jest.fn(() => ({
    resolveTransformValue: jest.fn(() => [{ scale: 1.5 }])
  }))
}));

describe('Animation Parsing', () => {
  describe('parseAnimationString', () => {
    test('splits simple comma-separated values', () => {
      expect(parseAnimationString('fade, slide')).toEqual(['fade', 'slide']);
      expect(parseAnimationString('1s, 2s, 0.5s')).toEqual([
        '1s',
        '2s',
        '0.5s'
      ]);
      expect(parseAnimationString('ease, linear')).toEqual(['ease', 'linear']);
    });

    test('handles single values', () => {
      expect(parseAnimationString('fade')).toEqual(['fade']);
      expect(parseAnimationString('1s')).toEqual(['1s']);
    });

    test('ignores commas inside cubic-bezier functions', () => {
      const input =
        'cubic-bezier(0.25, 0.1, 0.25, 1), ease-out, cubic-bezier(0.4, 0.0, 0.2, 1)';
      const expected = [
        'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'ease-out',
        'cubic-bezier(0.4, 0.0, 0.2, 1)'
      ];
      expect(parseAnimationString(input)).toEqual(expected);
    });

    test('trims whitespace', () => {
      expect(parseAnimationString(' fade , slide ')).toEqual(['fade', 'slide']);
    });

    test('handles empty input', () => {
      expect(parseAnimationString('')).toEqual(['']);
      expect(parseAnimationString(null)).toEqual(['']);
      expect(parseAnimationString(undefined)).toEqual(['']);
    });

    test('handles non-string input types', () => {
      expect(parseAnimationString(123)).toEqual(['']);
      expect(parseAnimationString(true)).toEqual(['']);
      expect(parseAnimationString(false)).toEqual(['']);
      expect(parseAnimationString([])).toEqual(['']);
      expect(parseAnimationString({})).toEqual(['']);
    });

    test('handles complex nested parentheses', () => {
      const input =
        'cubic-bezier(0.25, 0.1, cubic-bezier(0.5, 0.1), 1), ease-out';
      // Should not split inside nested parentheses
      expect(parseAnimationString(input)).toEqual([
        'cubic-bezier(0.25, 0.1, cubic-bezier(0.5, 0.1), 1)',
        'ease-out'
      ]);
    });

    test('handles unbalanced parentheses gracefully', () => {
      const input = 'cubic-bezier(0.25, 0.1, ease-out';
      // Should not split even with unbalanced parentheses
      expect(parseAnimationString(input)).toEqual([
        'cubic-bezier(0.25, 0.1, ease-out'
      ]);
    });

    test('caches identical string inputs', () => {
      const input = 'fade, slide, bounce';
      const result1 = parseAnimationString(input);
      const result2 = parseAnimationString(input);

      // Should return the same array reference due to caching
      expect(result1).toBe(result2);
      expect(result1).toEqual(['fade', 'slide', 'bounce']);
    });

    test('handles strings with only commas and spaces', () => {
      expect(parseAnimationString(', , ,')).toEqual(['', '', '', '']);
      expect(parseAnimationString('   ,   ,   ')).toEqual(['', '', '']);
    });

    test('handles mixed whitespace characters', () => {
      expect(parseAnimationString(' \t fade \n , \r slide \t ')).toEqual([
        'fade',
        'slide'
      ]);
    });

    test('handles very long animation strings', () => {
      const longInput = Array(100).fill('animation-name').join(', ');
      const result = parseAnimationString(longInput);
      expect(result).toHaveLength(100);
      expect(result.every((item) => item === 'animation-name')).toBe(true);
    });
  });

  describe('normalizeAnimationProperties', () => {
    test('normalizes single values to arrays', () => {
      const input = {
        animationName: 'bounce',
        animationDuration: '1s',
        animationDelay: '0s'
      };

      const result = normalizeAnimationProperties(input);

      expect(result).toEqual({
        normalized: {
          animationName: ['bounce'],
          animationDuration: ['1s'],
          animationDelay: ['0s']
        },
        animationCount: 1
      });
    });

    test('cycles shorter arrays to match animationName length', () => {
      const input = {
        animationName: ['bounce', 'fade', 'slide'],
        animationDuration: ['1s', '2s'],
        animationDelay: ['0s']
      };

      const result = normalizeAnimationProperties(input);

      expect(result).toEqual({
        normalized: {
          animationName: ['bounce', 'fade', 'slide'],
          animationDuration: ['1s', '2s', '1s'],
          animationDelay: ['0s', '0s', '0s']
        },
        animationCount: 3
      });
    });

    test('ignores excess values in longer arrays', () => {
      const input = {
        animationName: ['bounce', 'fade'],
        animationDuration: ['1s', '2s', '3s', '4s'],
        animationIterationCount: [1, 2, 3]
      };

      const result = normalizeAnimationProperties(input);

      expect(result.normalized.animationDuration).toEqual(['1s', '2s']);
      expect(result.normalized.animationIterationCount).toEqual([1, 2]);
    });

    test('handles null and undefined properties', () => {
      const input = {
        animationName: ['bounce', 'fade'],
        animationDuration: null,
        animationDelay: undefined
      };

      const result = normalizeAnimationProperties(input);

      expect(result.normalized.animationName).toEqual(['bounce', 'fade']);
      expect(result.normalized.animationDuration).toBeUndefined();
      expect(result.normalized.animationDelay).toBeUndefined();
    });

    test('normalizes animationTimingFunction', () => {
      const input = {
        animationName: ['bounce', 'fade'],
        animationTimingFunction: 'ease-in-out'
      };

      const result = normalizeAnimationProperties(input);

      expect(result.normalized.animationTimingFunction).toEqual([
        'ease-in-out',
        'ease-in-out'
      ]);
    });

    test('normalizes animationDirection', () => {
      const input = {
        animationName: ['bounce', 'fade'],
        animationDirection: ['normal', 'reverse']
      };

      const result = normalizeAnimationProperties(input);

      expect(result.normalized.animationDirection).toEqual([
        'normal',
        'reverse'
      ]);
    });

    test('normalizes animationFillMode', () => {
      const input = {
        animationName: ['bounce'],
        animationFillMode: 'forwards'
      };

      const result = normalizeAnimationProperties(input);

      expect(result.normalized.animationFillMode).toEqual(['forwards']);
    });

    test('normalizes animationPlayState', () => {
      const input = {
        animationName: ['bounce', 'fade'],
        animationPlayState: 'paused'
      };

      const result = normalizeAnimationProperties(input);

      expect(result.normalized.animationPlayState).toEqual([
        'paused',
        'paused'
      ]);
    });

    test('normalizes animationIterationCount', () => {
      const input = {
        animationName: ['bounce'],
        animationIterationCount: 3
      };

      const result = normalizeAnimationProperties(input);

      expect(result.normalized.animationIterationCount).toEqual([3]);
    });
  });

  describe('applyAnimationDirection', () => {
    const inputRange = [0, 0.5, 1];
    const outputRange = ['start', 'middle', 'end'];

    test('should handle normal direction unchanged', () => {
      const result = applyAnimationDirection(inputRange, outputRange, 'normal');

      expect(result.finalInputRange).toEqual([0, 0.5, 1]);
      expect(result.finalOutputRange).toEqual(['start', 'middle', 'end']);
    });

    test('should reverse output range for reverse direction', () => {
      const result = applyAnimationDirection(
        inputRange,
        outputRange,
        'reverse'
      );

      expect(result.finalInputRange).toEqual([0, 0.5, 1]);
      expect(result.finalOutputRange).toEqual(['end', 'middle', 'start']);
    });

    test('should create double-length interpolation for alternate', () => {
      const result = applyAnimationDirection(
        inputRange,
        outputRange,
        'alternate'
      );

      expect(result.finalInputRange).toEqual([0, 0.25, 0.5, 0.5, 0.75, 1]);
      expect(result.finalOutputRange).toEqual([
        'start',
        'middle',
        'end',
        'end',
        'middle',
        'start'
      ]);
    });

    test('should create reverse-first double-length interpolation for alternate-reverse', () => {
      const result = applyAnimationDirection(
        inputRange,
        outputRange,
        'alternate-reverse'
      );

      expect(result.finalInputRange).toEqual([0, 0.25, 0.5, 0.5, 0.75, 1]);
      expect(result.finalOutputRange).toEqual([
        'end',
        'middle',
        'start',
        'start',
        'middle',
        'end'
      ]);
    });

    test('should handle numeric values', () => {
      const numericOutputRange = [0, 50, 100];
      const result = applyAnimationDirection(
        inputRange,
        numericOutputRange,
        'reverse'
      );

      expect(result.finalOutputRange).toEqual([100, 50, 0]);
    });
  });

  describe('applyFillModeStyles', () => {
    const keyframes = {
      '0%': { opacity: 0, transform: 'scale(0.8)' },
      '100%': { opacity: 1, transform: 'scale(1.2)' }
    };
    const baseStyle = { opacity: 0.5, color: 'blue' };

    test('should return null when no fill mode styles apply', () => {
      const result = applyFillModeStyles(
        keyframes,
        'normal',
        'none',
        'running',
        baseStyle
      );

      expect(result).toBeNull();
    });

    test('should return base style for "none" fill mode when completed', () => {
      const result = applyFillModeStyles(
        keyframes,
        'normal',
        'none',
        'completed',
        baseStyle
      );

      expect(result).toBe(baseStyle);
    });

    test('should apply backwards fill mode when not started', () => {
      const result = applyFillModeStyles(
        keyframes,
        'normal',
        'backwards',
        'not-started',
        baseStyle
      );

      expect(result).toMatchObject({
        opacity: 0,
        transform: [{ scale: 1.5 }],
        color: 'blue'
      });
    });

    test('should apply forwards fill mode when completed', () => {
      const result = applyFillModeStyles(
        keyframes,
        'normal',
        'forwards',
        'completed',
        baseStyle
      );

      expect(result).toMatchObject({
        opacity: 1,
        transform: [{ scale: 1.5 }],
        color: 'blue'
      });
    });

    test('should apply both fill mode - backwards when not started', () => {
      const result = applyFillModeStyles(
        keyframes,
        'normal',
        'both',
        'not-started',
        baseStyle
      );

      expect(result).toMatchObject({
        opacity: 0,
        transform: [{ scale: 1.5 }]
      });
    });

    test('should apply both fill mode - forwards when completed', () => {
      const result = applyFillModeStyles(
        keyframes,
        'normal',
        'both',
        'completed',
        baseStyle
      );

      expect(result).toMatchObject({
        opacity: 1,
        transform: [{ scale: 1.5 }]
      });
    });

    test('should handle reverse direction for backwards fill mode', () => {
      const result = applyFillModeStyles(
        keyframes,
        'reverse',
        'backwards',
        'not-started',
        baseStyle
      );

      // For reverse direction, backwards should apply 100% keyframe
      expect(result).toMatchObject({
        opacity: 1,
        transform: [{ scale: 1.5 }]
      });
    });

    test('should handle reverse direction for forwards fill mode', () => {
      const result = applyFillModeStyles(
        keyframes,
        'reverse',
        'forwards',
        'completed',
        baseStyle
      );

      // For reverse direction, forwards should apply 0% keyframe
      expect(result).toMatchObject({
        opacity: 0,
        transform: [{ scale: 1.5 }]
      });
    });

    test('should handle alternate direction', () => {
      const result = applyFillModeStyles(
        keyframes,
        'alternate',
        'backwards',
        'not-started',
        baseStyle
      );

      // Alternate starts like normal direction
      expect(result).toMatchObject({
        opacity: 0,
        transform: [{ scale: 1.5 }]
      });
    });

    test('should handle non-string, non-number values', () => {
      const keyframesWithComplexValues = {
        '0%': { opacity: 0, complexProp: { nested: true } },
        '100%': { opacity: 1 }
      };

      const result = applyFillModeStyles(
        keyframesWithComplexValues,
        'normal',
        'backwards',
        'not-started',
        baseStyle
      );

      expect(result).toMatchObject({
        opacity: 0,
        color: 'blue'
      });
      expect(result).not.toHaveProperty('complexProp');
    });
  });
});
