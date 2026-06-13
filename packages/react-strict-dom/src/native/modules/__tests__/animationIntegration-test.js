/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import { keyframeRegistry } from '../../css/keyframeRegistry';
import { parseAnimationString } from '../../css/parseAnimationStrings';
import { parseTimeValue } from '../../css/parseTimeValue';
import {
  extractAnimationArrays,
  extractAnimationProperties,
  normalizeAnimationArrays,
  parseAnimationDirection,
  parseAnimationFillMode,
  parseAnimationIterationCount,
  parseAnimationPlayState
} from '../animationUtils';

describe('Animation Integration', () => {
  beforeEach(() => {
    keyframeRegistry.clear();
  });

  afterEach(() => {
    keyframeRegistry.clear();
  });

  describe('parseAnimationString', () => {
    test('parses single animation name', () => {
      expect(parseAnimationString('fadeIn')).toEqual(['fadeIn']);
    });

    test('parses multiple animation names', () => {
      expect(parseAnimationString('fadeIn, slideUp, bounce')).toEqual([
        'fadeIn',
        'slideUp',
        'bounce'
      ]);
    });

    test('handles cubic-bezier with commas', () => {
      expect(parseAnimationString('cubic-bezier(0.25, 0.1, 0.25, 1)')).toEqual([
        'cubic-bezier(0.25, 0.1, 0.25, 1)'
      ]);
    });

    test('handles multiple values with cubic-bezier', () => {
      expect(
        parseAnimationString('ease, cubic-bezier(0.4, 0, 0.2, 1), linear')
      ).toEqual(['ease', 'cubic-bezier(0.4, 0, 0.2, 1)', 'linear']);
    });

    test('handles null/undefined input', () => {
      expect(parseAnimationString(null)).toEqual(['']);
      expect(parseAnimationString(undefined)).toEqual(['']);
    });
  });

  describe('parseTimeValue', () => {
    test('parses seconds', () => {
      expect(parseTimeValue('1s')).toBe(1000);
      expect(parseTimeValue('0.5s')).toBe(500);
      expect(parseTimeValue('2.5s')).toBe(2500);
    });

    test('parses milliseconds', () => {
      expect(parseTimeValue('100ms')).toBe(100);
      expect(parseTimeValue('1500ms')).toBe(1500);
    });

    test('handles invalid values', () => {
      expect(parseTimeValue('invalid')).toBe(0);
    });
  });

  describe('extractAnimationProperties', () => {
    test('extracts animation properties from style', () => {
      const style = {
        animationName: 'bounce',
        animationDuration: '1s',
        animationDelay: '0.5s',
        backgroundColor: 'red'
      };

      const result = extractAnimationProperties(style);

      expect(result).toEqual({
        animationName: 'bounce',
        animationDuration: '1s',
        animationDelay: '0.5s'
      });
    });

    test('returns null when no animation properties', () => {
      const style = { backgroundColor: 'red', opacity: 1 };
      expect(extractAnimationProperties(style)).toBeNull();
    });
  });

  describe('extractAnimationArrays', () => {
    test('extracts and splits comma-separated values', () => {
      const style = {
        animationName: 'bounce, fade',
        animationDuration: '1s, 2s',
        animationDelay: '0s'
      };

      const result = extractAnimationArrays(style);

      expect(result.animationName).toEqual(['bounce', 'fade']);
      expect(result.animationDuration).toEqual(['1s', '2s']);
      expect(result.animationDelay).toEqual(['0s']);
    });
  });

  describe('normalizeAnimationArrays', () => {
    test('cycles shorter arrays to match animationName length', () => {
      // Register keyframes first
      const a = keyframeRegistry.register({
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      });
      const b = keyframeRegistry.register({
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      });
      const c = keyframeRegistry.register({
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      });

      const props = {
        animationName: `${a}, ${b}, ${c}`,
        animationDuration: '1s',
        animationDelay: '0s, 0.5s'
      };

      const result = normalizeAnimationArrays(props);

      expect(result?.animationName).toEqual([a, b, c]);
      expect(result?.animationDuration).toEqual(['1s', '1s', '1s']);
      expect(result?.animationDelay).toEqual(['0s', '0.5s', '0s']);
    });

    test('returns null when no animation name', () => {
      const props = { animationDuration: '1s' };
      expect(normalizeAnimationArrays(props)).toBeNull();
    });
  });

  describe('parseAnimationDirection', () => {
    test('parses valid directions', () => {
      expect(parseAnimationDirection('normal')).toBe('normal');
      expect(parseAnimationDirection('reverse')).toBe('reverse');
      expect(parseAnimationDirection('alternate')).toBe('alternate');
      expect(parseAnimationDirection('alternate-reverse')).toBe(
        'alternate-reverse'
      );
    });

    test('defaults invalid to normal', () => {
      expect(parseAnimationDirection('invalid')).toBe('normal');
      expect(parseAnimationDirection(undefined)).toBe('normal');
    });
  });

  describe('parseAnimationFillMode', () => {
    test('parses valid fill modes', () => {
      expect(parseAnimationFillMode('none')).toBe('none');
      expect(parseAnimationFillMode('forwards')).toBe('forwards');
      expect(parseAnimationFillMode('backwards')).toBe('backwards');
      expect(parseAnimationFillMode('both')).toBe('both');
    });

    test('defaults invalid to none', () => {
      expect(parseAnimationFillMode('invalid')).toBe('none');
      expect(parseAnimationFillMode(undefined)).toBe('none');
    });
  });

  describe('parseAnimationPlayState', () => {
    test('parses valid play states', () => {
      expect(parseAnimationPlayState('running')).toBe('running');
      expect(parseAnimationPlayState('paused')).toBe('paused');
    });

    test('defaults invalid to running', () => {
      expect(parseAnimationPlayState('invalid')).toBe('running');
      expect(parseAnimationPlayState(undefined)).toBe('running');
    });
  });

  describe('parseAnimationIterationCount', () => {
    test('parses numeric values', () => {
      expect(parseAnimationIterationCount('3')).toBe(3);
      expect(parseAnimationIterationCount('2.5')).toBe(2.5);
      expect(parseAnimationIterationCount(5)).toBe(5);
    });

    test('parses infinite', () => {
      expect(parseAnimationIterationCount('infinite')).toBe('infinite');
    });

    test('defaults invalid to 1', () => {
      expect(parseAnimationIterationCount('invalid')).toBe(1);
      expect(parseAnimationIterationCount(undefined)).toBe(1);
    });
  });

  describe('keyframeRegistry integration', () => {
    test('registers and resolves keyframes', () => {
      const keyframes = {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      };

      const id = keyframeRegistry.register(keyframes);
      const resolved = keyframeRegistry.resolve(id);

      expect(resolved).not.toBeNull();
      expect(resolved?.keyframes).toEqual(keyframes);
    });

    test('returns null for unregistered animation', () => {
      expect(keyframeRegistry.resolve('nonexistent')).toBeNull();
    });

    test('handles multi-step keyframes', () => {
      const keyframes = {
        '0%': { transform: 'translateY(0px)' },
        '25%': { transform: 'translateY(-20px)' },
        '50%': { transform: 'translateY(0px)' },
        '75%': { transform: 'translateY(-10px)' },
        '100%': { transform: 'translateY(0px)' }
      };

      const id = keyframeRegistry.register(keyframes);
      const resolved = keyframeRegistry.resolve(id);

      expect(Object.keys(resolved?.keyframes || {})).toHaveLength(5);
    });
  });

  describe('full pipeline integration', () => {
    test('extracts, normalizes, and resolves animation', () => {
      const keyframes = {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      };
      const animationName = keyframeRegistry.register(keyframes);

      const style = {
        animationName,
        animationDuration: '1s',
        animationDelay: '0.5s',
        animationDirection: 'alternate',
        animationIterationCount: 3
      };

      const props = extractAnimationProperties(style);
      expect(props).not.toBeNull();

      const normalized = normalizeAnimationArrays(props);
      expect(normalized?.animationName[0]).toBe(animationName);

      const resolved = keyframeRegistry.resolve(normalized?.animationName[0]);
      expect(resolved?.keyframes).toEqual(keyframes);
    });

    test('handles multiple animations in pipeline', () => {
      const fade = keyframeRegistry.register({
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      });
      const slide = keyframeRegistry.register({
        '0%': { transform: 'translateX(0)' },
        '100%': { transform: 'translateX(100px)' }
      });

      const style = {
        animationName: `${fade}, ${slide}`,
        animationDuration: '1s, 2s',
        animationDelay: '0s'
      };

      const props = extractAnimationProperties(style);
      const normalized = normalizeAnimationArrays(props);

      expect(normalized?.animationName).toHaveLength(2);
      expect(normalized?.animationDuration).toEqual(['1s', '2s']);
      expect(normalized?.animationDelay).toEqual(['0s', '0s']);
    });

    test('parses timing values in pipeline', () => {
      const style = {
        animationName: 'test',
        animationDuration: '2s',
        animationDelay: '500ms'
      };

      const props = extractAnimationProperties(style);
      const duration = parseTimeValue(props?.animationDuration || '0s');
      const delay = parseTimeValue(props?.animationDelay || '0s');

      expect(duration).toBe(2000);
      expect(delay).toBe(500);
    });

    test('parses animation properties in pipeline', () => {
      const style = {
        animationName: 'test',
        animationDirection: 'alternate-reverse',
        animationFillMode: 'both',
        animationPlayState: 'paused',
        animationIterationCount: 'infinite'
      };

      const props = extractAnimationProperties(style);

      expect(parseAnimationDirection(props?.animationDirection)).toBe(
        'alternate-reverse'
      );
      expect(parseAnimationFillMode(props?.animationFillMode)).toBe('both');
      expect(parseAnimationPlayState(props?.animationPlayState)).toBe('paused');
      expect(parseAnimationIterationCount(props?.animationIterationCount)).toBe(
        'infinite'
      );
    });
  });
});
