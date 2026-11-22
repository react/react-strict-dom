/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import {
  handleAnimationError,
  parseAnimationIterationCount,
  parseAnimationDirection,
  parseAnimationFillMode,
  parseAnimationPlayState,
  parseAnimationComposition,
  createOptimizedAnimationConfig,
  cycleTo,
  extractAnimationArrays,
  extractAnimationProperties,
  normalizeAnimationArrays,
  accumulatePropertyValues,
  removeAnimationProperties,
  composeMultipleAnimatedStyles,
  composeWithCompositionModes
} from '../animationUtils';
import { keyframeRegistry } from '../../css/keyframeRegistry';
import { warnMsg } from '../../../shared/logUtils';
import * as sharedAnimationUtils from '../sharedAnimationUtils';

// Mock dependencies
jest.mock('../../../shared/logUtils', () => ({
  warnMsg: jest.fn()
}));

jest.mock('../AnimationController', () => ({
  AnimationController: jest.fn().mockImplementation(() => ({
    getAnimatedValue: jest.fn().mockReturnValue({ value: 0.5 }),
    getState: jest.fn().mockReturnValue('running')
  }))
}));

jest.mock('../../css/animationInterpolation', () => ({
  getInterpolatedStyle: jest.fn().mockReturnValue({ opacity: 0.5 })
}));

jest.mock('../../css/parseTransform', () => ({
  parseTransform: jest.fn().mockReturnValue({
    resolveTransformValue: jest.fn().mockReturnValue([{ translateX: 10 }])
  })
}));

describe('animationUtils', () => {
  beforeEach(() => {
    keyframeRegistry.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    keyframeRegistry.clear();
  });

  describe('handleAnimationError', () => {
    const originalDev = global.__DEV__;

    beforeEach(() => {
      global.__DEV__ = true;
    });

    afterEach(() => {
      global.__DEV__ = originalDev;
    });

    test('logs error message in development', () => {
      const error = new Error('Test error');
      const context = 'Test context';

      handleAnimationError(error, context);

      expect(warnMsg).toHaveBeenCalledWith('Test context: Test error');
    });

    test('handles non-Error objects', () => {
      const error = 'String error';
      const context = 'Test context';

      handleAnimationError(error, context);

      expect(warnMsg).toHaveBeenCalledWith('Test context: String error');
    });

    test('does not log in production', () => {
      global.__DEV__ = false;

      const error = new Error('Test error');
      const context = 'Test context';

      handleAnimationError(error, context);

      expect(warnMsg).not.toHaveBeenCalled();
    });
  });

  describe('parseAnimationIterationCount', () => {
    test('handles infinite value', () => {
      expect(parseAnimationIterationCount('infinite')).toBe('infinite');
    });

    test('handles numeric values', () => {
      expect(parseAnimationIterationCount(3)).toBe(3);
      expect(parseAnimationIterationCount(2.5)).toBe(2.5);
      expect(parseAnimationIterationCount(-1)).toBe(0); // Clamps to 0
    });

    test('handles string numeric values', () => {
      expect(parseAnimationIterationCount('3')).toBe(3);
      expect(parseAnimationIterationCount('2.5')).toBe(2.5);
      expect(parseAnimationIterationCount('-1')).toBe(0);
    });

    test('handles invalid values', () => {
      expect(parseAnimationIterationCount('invalid')).toBe(1);
      expect(parseAnimationIterationCount(null)).toBe(1);
      expect(parseAnimationIterationCount(undefined)).toBe(1);
    });
  });

  describe('parseAnimationDirection', () => {
    test('handles valid directions', () => {
      expect(parseAnimationDirection('normal')).toBe('normal');
      expect(parseAnimationDirection('reverse')).toBe('reverse');
      expect(parseAnimationDirection('alternate')).toBe('alternate');
      expect(parseAnimationDirection('alternate-reverse')).toBe(
        'alternate-reverse'
      );
    });

    test('defaults invalid values to normal', () => {
      expect(parseAnimationDirection('invalid')).toBe('normal');
      expect(parseAnimationDirection(null)).toBe('normal');
      expect(parseAnimationDirection(undefined)).toBe('normal');
    });
  });

  describe('parseAnimationFillMode', () => {
    test('handles valid fill modes', () => {
      expect(parseAnimationFillMode('none')).toBe('none');
      expect(parseAnimationFillMode('forwards')).toBe('forwards');
      expect(parseAnimationFillMode('backwards')).toBe('backwards');
      expect(parseAnimationFillMode('both')).toBe('both');
    });

    test('defaults invalid values to none', () => {
      expect(parseAnimationFillMode('invalid')).toBe('none');
      expect(parseAnimationFillMode(null)).toBe('none');
      expect(parseAnimationFillMode(undefined)).toBe('none');
    });
  });

  describe('parseAnimationPlayState', () => {
    test('handles valid play states', () => {
      expect(parseAnimationPlayState('running')).toBe('running');
      expect(parseAnimationPlayState('paused')).toBe('paused');
    });

    test('defaults invalid values to running', () => {
      expect(parseAnimationPlayState('invalid')).toBe('running');
      expect(parseAnimationPlayState(null)).toBe('running');
      expect(parseAnimationPlayState(undefined)).toBe('running');
    });
  });

  describe('parseAnimationComposition', () => {
    test('handles valid composition modes', () => {
      expect(parseAnimationComposition('replace')).toBe('replace');
      expect(parseAnimationComposition('add')).toBe('add');
      expect(parseAnimationComposition('accumulate')).toBe('accumulate');
    });

    test('defaults invalid values to replace', () => {
      expect(parseAnimationComposition('invalid')).toBe('replace');
      expect(parseAnimationComposition(null)).toBe('replace');
      expect(parseAnimationComposition(undefined)).toBe('replace');
    });
  });

  describe('createOptimizedAnimationConfig', () => {
    test('creates config with native driver when possible', () => {
      jest
        .spyOn(sharedAnimationUtils, 'canUseNativeDriverForProperties')
        .mockReturnValue(true);
      jest
        .spyOn(sharedAnimationUtils, 'canUseNativeDriver')
        .mockReturnValue(true);

      const config = {
        properties: ['opacity', 'transform'],
        keyframes: { '0%': { opacity: 0 }, '100%': { opacity: 1 } }
      };

      const result = createOptimizedAnimationConfig(config);

      expect(result.useNativeDriver).toBe(true);
      expect(result.properties).toEqual(['opacity', 'transform']);
    });

    test('disables native driver when properties are not compatible', () => {
      jest
        .spyOn(sharedAnimationUtils, 'canUseNativeDriverForProperties')
        .mockReturnValue(false);

      const config = {
        properties: ['backgroundColor'],
        keyframes: {
          '0%': { backgroundColor: 'red' },
          '100%': { backgroundColor: 'blue' }
        }
      };

      const result = createOptimizedAnimationConfig(config);

      expect(result.useNativeDriver).toBe(false);
    });

    test('disables native driver when keyframes are not compatible', () => {
      jest
        .spyOn(sharedAnimationUtils, 'canUseNativeDriverForProperties')
        .mockReturnValue(true);
      jest
        .spyOn(sharedAnimationUtils, 'canUseNativeDriver')
        .mockReturnValue(false);

      const config = {
        properties: ['opacity'],
        keyframes: { '0%': { opacity: 0 }, '100%': { opacity: 1 } }
      };

      const result = createOptimizedAnimationConfig(config);

      expect(result.useNativeDriver).toBe(false);
    });
  });

  describe('cycleTo', () => {
    test('cycles array to target length', () => {
      expect(cycleTo(['a', 'b'], 5)).toEqual(['a', 'b', 'a', 'b', 'a']);
    });

    test('handles empty source array', () => {
      expect(cycleTo([], 3)).toEqual([]);
    });

    test('handles zero target length', () => {
      expect(cycleTo(['a', 'b'], 0)).toEqual([]);
    });

    test('handles negative target length', () => {
      expect(cycleTo(['a', 'b'], -1)).toEqual([]);
    });

    test('handles single element array', () => {
      expect(cycleTo(['a'], 3)).toEqual(['a', 'a', 'a']);
    });
  });

  describe('extractAnimationArrays', () => {
    test('extracts and parses animation properties', () => {
      const props = {
        animationName: 'bounce, fade',
        animationDuration: '1s, 2s',
        animationDelay: '0s',
        animationTimingFunction: 'ease',
        animationIterationCount: '1',
        animationDirection: 'normal',
        animationFillMode: 'none',
        animationPlayState: 'running',
        animationComposition: 'replace'
      };

      const result = extractAnimationArrays(props);

      expect(result.animationName).toEqual(['bounce', 'fade']);
      expect(result.animationDuration).toEqual(['1s', '2s']);
    });

    test('handles undefined properties with defaults', () => {
      const props = {};

      const result = extractAnimationArrays(props);

      expect(result.animationName).toEqual([]);
      expect(result.animationDuration).toEqual(['0s']);
    });

    test('filters empty animation names', () => {
      const props = {
        animationName: 'bounce, , fade'
      };

      const result = extractAnimationArrays(props);

      expect(result.animationName).toEqual(['bounce', 'fade']);
    });
  });

  describe('extractAnimationProperties', () => {
    test('extracts animation properties from style', () => {
      const style = {
        animationName: 'bounce',
        animationDuration: '1s',
        backgroundColor: 'red',
        color: 'blue'
      };

      const result = extractAnimationProperties(style);

      expect(result).toEqual({
        animationName: 'bounce',
        animationDuration: '1s'
      });
    });

    test('returns null when no animation properties', () => {
      const style = {
        backgroundColor: 'red',
        color: 'blue'
      };

      const result = extractAnimationProperties(style);

      expect(result).toBe(null);
    });

    test('handles animationIterationCount as mixed type', () => {
      const style = {
        animationName: 'bounce',
        animationIterationCount: 'infinite'
      };

      const result = extractAnimationProperties(style);

      expect(result?.animationIterationCount).toBe('infinite');
    });

    test('uses cache for repeated calls', () => {
      const style = {
        animationName: 'bounce',
        animationDuration: '1s'
      };

      const result1 = extractAnimationProperties(style);
      const result2 = extractAnimationProperties(style);

      expect(result1).toBe(result2); // Same reference due to caching
    });
  });

  describe('normalizeAnimationArrays', () => {
    test('normalizes animation arrays', () => {
      const keyframes = {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      };
      const animationName = keyframeRegistry.register(keyframes);

      const props = {
        animationName,
        animationDuration: '1s',
        animationDelay: '0.5s'
      };

      const result = normalizeAnimationArrays(props);

      expect(result?.animationName).toEqual([animationName]);
      expect(result?.animationCount).toBe(1);
    });

    test('returns null for empty animation names', () => {
      const props = {
        animationName: ''
      };

      const result = normalizeAnimationArrays(props);

      expect(result).toBe(null);
    });

    test('filters out invalid animation names', () => {
      const keyframes = {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      };
      const validAnimationName = keyframeRegistry.register(keyframes);

      const props = {
        animationName: `${validAnimationName}, invalid`,
        animationDuration: '1s, 2s'
      };

      const result = normalizeAnimationArrays(props);

      expect(result?.animationName).toEqual([validAnimationName]);
      expect(result?.animationCount).toBe(1);
    });

    test('returns null when no valid animations', () => {
      const props = {
        animationName: 'invalid1, invalid2'
      };

      const result = normalizeAnimationArrays(props);

      expect(result).toBe(null);
    });

    test('handles normalization errors', () => {
      const props = null; // This will cause an error

      const result = normalizeAnimationArrays(props);

      expect(result).toBe(null);
    });
  });

  describe('accumulatePropertyValues', () => {
    test('handles transform property', () => {
      const baseValue = [{ translateX: 10 }];
      const values = [[{ translateY: 20 }]];

      const result = accumulatePropertyValues('transform', values, baseValue);

      expect(result).toEqual([{ translateX: 10 }, { translateY: 20 }]);
    });

    test('handles opacity property', () => {
      const baseValue = 0.8;
      const values = [0.5, 0.9];

      const result = accumulatePropertyValues('opacity', values, baseValue);

      expect(result).toBeCloseTo(0.36, 10); // 0.8 * 0.5 * 0.9, clamped to 0-1
    });

    test('clamps opacity to valid range', () => {
      const baseValue = 0.5;
      const values = [3]; // Would result in 1.5

      const result = accumulatePropertyValues('opacity', values, baseValue);

      expect(result).toBe(1); // Clamped to 1
    });

    test('handles numeric properties with addition', () => {
      const result = accumulatePropertyValues('translateX', ['10px'], '5px');
      expect(result).toBe('15px');
    });

    test('handles scale properties with multiplication', () => {
      const result = accumulatePropertyValues('scaleX', [2], 1.5);
      expect(result).toBe(3);
    });

    test('handles default case (last value wins)', () => {
      const result = accumulatePropertyValues(
        'color',
        ['blue', 'green'],
        'red'
      );
      expect(result).toBe('green');
    });

    test('returns base value when no values', () => {
      const result = accumulatePropertyValues('opacity', [], 0.5);
      expect(result).toBe(0.5);
    });
  });

  describe('removeAnimationProperties', () => {
    test('removes animation properties from style', () => {
      const style = {
        animationName: 'bounce',
        animationDuration: '1s',
        backgroundColor: 'red',
        color: 'blue'
      };

      const result = removeAnimationProperties(style);

      expect(result).toEqual({
        backgroundColor: 'red',
        color: 'blue'
      });
    });

    test('removes keyframe properties', () => {
      const style = {
        backgroundColor: 'red',
        keyframe_0: { opacity: 0 },
        keyframe_1: { opacity: 1 },
        color: 'blue'
      };

      const result = removeAnimationProperties(style);

      expect(result).toEqual({
        backgroundColor: 'red',
        color: 'blue'
      });
    });

    test('preserves non-animation properties', () => {
      const style = {
        backgroundColor: 'red',
        color: 'blue',
        fontSize: 16,
        margin: 10
      };

      const result = removeAnimationProperties(style);

      expect(result).toEqual(style);
    });
  });

  describe('composeMultipleAnimatedStyles', () => {
    test('returns base style when no controllers', () => {
      const baseStyle = { backgroundColor: 'red' };
      const controllers = new Map();
      const normalizedAnimations = {
        animationName: [],
        animationComposition: [],
        animationDirection: [],
        animationFillMode: [],
        animationCount: 0
      };

      const result = composeMultipleAnimatedStyles(
        baseStyle,
        controllers,
        normalizedAnimations
      );

      expect(result).toEqual({ backgroundColor: 'red' });
    });

    test('composes styles from multiple controllers', () => {
      const baseStyle = { backgroundColor: 'red' };
      const controllers = new Map();

      const mockController1 = {
        getAnimatedValue: jest.fn().mockReturnValue({ value: 0.5 }),
        getState: jest.fn().mockReturnValue('running')
      };
      const mockController2 = {
        getAnimatedValue: jest.fn().mockReturnValue({ value: 0.8 }),
        getState: jest.fn().mockReturnValue('running')
      };

      controllers.set('bounce_0', mockController1);
      controllers.set('fade_1', mockController2);

      const normalizedAnimations = {
        animationName: ['bounce', 'fade'],
        animationComposition: ['replace', 'add'],
        animationDirection: ['normal', 'normal'],
        animationFillMode: ['none', 'none'],
        animationCount: 2
      };

      const result = composeMultipleAnimatedStyles(
        baseStyle,
        controllers,
        normalizedAnimations
      );

      expect(result).toBeDefined();
    });

    test('handles animation interpolation errors gracefully', () => {
      const {
        getInterpolatedStyle
      } = require('../../css/animationInterpolation');
      getInterpolatedStyle.mockImplementation(() => {
        throw new Error('Interpolation failed');
      });

      const baseStyle = { backgroundColor: 'red' };
      const controllers = new Map();
      const mockController = {
        getAnimatedValue: jest.fn().mockReturnValue({ value: 0.5 }),
        getState: jest.fn().mockReturnValue('running')
      };
      controllers.set('bounce_0', mockController);

      const normalizedAnimations = {
        animationName: ['bounce'],
        animationComposition: ['replace'],
        animationDirection: ['normal'],
        animationFillMode: ['none'],
        animationCount: 1
      };

      const result = composeMultipleAnimatedStyles(
        baseStyle,
        controllers,
        normalizedAnimations
      );

      expect(result).toEqual({ backgroundColor: 'red' });
      expect(warnMsg).toHaveBeenCalled();
    });
  });

  describe('composeWithCompositionModes', () => {
    test('handles replace composition mode', () => {
      const cleanStyle = { opacity: 0.5 };
      const replaceAnimations = [
        {
          controller: {
            getAnimatedValue: () => ({ value: 0.8 }),
            getState: () => 'running'
          },
          animationIndex: 0,
          animationName: 'fade',
          direction: 'normal',
          fillMode: 'none',
          compositionMode: 'replace'
        }
      ];

      const result = composeWithCompositionModes(
        cleanStyle,
        replaceAnimations,
        [],
        []
      );

      expect(result).toBeDefined();
    });

    test('handles add composition mode', () => {
      const cleanStyle = { opacity: 0.5 };
      const additiveAnimations = [
        {
          controller: {
            getAnimatedValue: () => ({ value: 0.3 }),
            getState: () => 'running'
          },
          animationIndex: 0,
          animationName: 'fade',
          direction: 'normal',
          fillMode: 'none',
          compositionMode: 'add'
        }
      ];

      const result = composeWithCompositionModes(
        cleanStyle,
        [],
        additiveAnimations,
        []
      );

      expect(result).toBeDefined();
    });

    test('handles accumulate composition mode', () => {
      const cleanStyle = { opacity: 0.5 };
      const accumulateAnimations = [
        {
          controller: {
            getAnimatedValue: () => ({ value: 0.3 }),
            getState: () => 'running'
          },
          animationIndex: 0,
          animationName: 'fade',
          direction: 'normal',
          fillMode: 'none',
          compositionMode: 'accumulate'
        }
      ];

      const result = composeWithCompositionModes(
        cleanStyle,
        [],
        [],
        accumulateAnimations
      );

      expect(result).toBeDefined();
    });

    test('handles transform property with replace mode', () => {
      const {
        getInterpolatedStyle
      } = require('../../css/animationInterpolation');
      getInterpolatedStyle.mockReturnValue({ transform: [{ scale: 2 }] });

      const cleanStyle = { transform: [{ translateX: 10 }] };
      const replaceAnimations = [
        {
          controller: {
            getAnimatedValue: () => ({ value: 0.5 }),
            getState: () => 'running'
          },
          animationIndex: 0,
          animationName: 'scale',
          direction: 'normal',
          fillMode: 'none',
          compositionMode: 'replace'
        }
      ];

      const result = composeWithCompositionModes(
        cleanStyle,
        replaceAnimations,
        [],
        []
      );

      expect(result.transform).toEqual([{ translateX: 10 }, { scale: 2 }]);
    });
  });

  describe('parseTransformString edge cases', () => {
    test('handles transform string parsing error', () => {
      const { parseTransform } = require('../../css/parseTransform');
      const originalParseTransform = parseTransform;

      jest.doMock('../../css/parseTransform', () => ({
        parseTransform: jest.fn(() => {
          throw new Error('Parse error');
        })
      }));

      jest.resetModules();
      const { parseAnimationIterationCount } = require('../animationUtils');

      expect(() => parseAnimationIterationCount('1')).not.toThrow();

      jest.doMock('../../css/parseTransform', () => ({
        parseTransform: originalParseTransform
      }));
      jest.resetModules();
    });

    test('handles non-string transform values', () => {
      const { extractAnimationProperties } = require('../animationUtils');

      const style = { transform: 123 };
      const result = extractAnimationProperties(style);

      expect(result).toBeDefined();
    });
  });

  describe('addNumericValues edge cases', () => {
    test('handles invalid string values', () => {
      const { composeMultipleAnimatedStyles } = require('../animationUtils');

      const cleanStyle = { width: 'invalid-string' };
      const controllers = new Map();
      const mockController = {
        getAnimatedValue: () => ({ value: 0.5 }),
        getState: () => 'running'
      };
      controllers.set('test_0', mockController);

      const normalizedAnimations = {
        animationName: ['test'],
        animationDirection: ['normal'],
        animationFillMode: ['none'],
        animationComposition: ['add'],
        animationCount: 1
      };

      const result = composeMultipleAnimatedStyles(
        cleanStyle,
        controllers,
        normalizedAnimations
      );

      expect(result).toBeDefined();
    });
  });

  describe('multiplyNumericValues edge cases', () => {
    test('handles NaN values in parsing', () => {
      const { composeMultipleAnimatedStyles } = require('../animationUtils');

      const cleanStyle = { scale: 'not-a-number' };
      const controllers = new Map();

      const mockController = {
        getAnimatedValue: () => ({ value: 0.5 }),
        getState: () => 'running'
      };
      controllers.set('test_0', mockController);

      const normalizedAnimations = {
        animationName: ['test'],
        animationDirection: ['normal'],
        animationFillMode: ['none'],
        animationComposition: ['multiply'],
        animationCount: 1
      };

      const result = composeMultipleAnimatedStyles(
        cleanStyle,
        controllers,
        normalizedAnimations
      );

      expect(result).toBeDefined();
    });
  });

  describe('composition mode handling', () => {
    test('handles accumulate composition mode', () => {
      const { composeMultipleAnimatedStyles } = require('../animationUtils');

      const cleanStyle = { opacity: 0.5 };
      const controllers = new Map();

      const mockController = {
        getAnimatedValue: () => ({ value: 0.3 }),
        getState: () => 'running'
      };
      controllers.set('test_0', mockController);

      const normalizedAnimations = {
        animationName: ['test'],
        animationDirection: ['normal'],
        animationFillMode: ['none'],
        animationComposition: ['accumulate'],
        animationCount: 1
      };

      const {
        getInterpolatedStyle
      } = require('../../css/animationInterpolation');
      getInterpolatedStyle.mockReturnValue({ opacity: 0.3 });

      const result = composeMultipleAnimatedStyles(
        cleanStyle,
        controllers,
        normalizedAnimations
      );

      expect(result).toBeDefined();
      expect(getInterpolatedStyle).toHaveBeenCalled();
    });
  });

  describe('composeWithCompositionModes default case', () => {
    test('handles default composition mode', () => {
      const { composeWithCompositionModes } = require('../animationUtils');

      const cleanStyle = { backgroundColor: 'red' };
      const replaceAnimations = [
        {
          controller: {
            getAnimatedValue: () => ({ value: 0.5 }),
            getState: () => 'running'
          },
          animationIndex: 0,
          animationName: 'bg',
          direction: 'normal',
          fillMode: 'none',
          compositionMode: 'unknown-mode'
        }
      ];

      const {
        getInterpolatedStyle
      } = require('../../css/animationInterpolation');
      getInterpolatedStyle.mockReturnValue({ backgroundColor: 'blue' });

      const result = composeWithCompositionModes(
        cleanStyle,
        replaceAnimations,
        [],
        []
      );

      expect(result).toBeDefined();
      expect(result.backgroundColor).toBe('blue');
    });
  });
});
