/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import {
  isNumber,
  isString,
  parseAnimationTimeValue,
  canUseNativeDriver,
  canUseNativeDriverForProperties,
  getEasingFunction
} from '../sharedAnimationUtils';

// Mock parseTimeValue
jest.mock('../../css/parseTimeValue', () => ({
  parseTimeValue: jest.fn((val) => {
    if (val === '1s') return 1000;
    if (val === '500ms') return 500;
    return 0;
  })
}));

// Mock react-native easing
jest.mock('../../react-native', () => ({
  Easing: {
    ease: 'ease',
    linear: 'linear',
    in: jest.fn((fn) => `in(${fn})`),
    out: jest.fn((fn) => `out(${fn})`),
    inOut: jest.fn((fn) => `inOut(${fn})`),
    bezier: jest.fn((...args) => `bezier(${args.join(',')})`)
  }
}));

describe('sharedAnimationUtils', () => {
  describe('isNumber', () => {
    test('should return true for numbers', () => {
      expect(isNumber(42)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-1.5)).toBe(true);
    });

    test('should return false for non-numbers', () => {
      expect(isNumber('42')).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber({})).toBe(false);
    });
  });

  describe('isString', () => {
    test('should return true for strings', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
      expect(isString('42')).toBe(true);
    });

    test('should return false for non-strings', () => {
      expect(isString(42)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({})).toBe(false);
    });
  });

  describe('parseAnimationTimeValue', () => {
    test('should return numbers directly', () => {
      expect(parseAnimationTimeValue(1000)).toBe(1000);
      expect(parseAnimationTimeValue(0)).toBe(0);
    });

    test('should parse string time values', () => {
      expect(parseAnimationTimeValue('1s')).toBe(1000);
      expect(parseAnimationTimeValue('500ms')).toBe(500);
    });

    test('should return 0 for invalid values', () => {
      expect(parseAnimationTimeValue(null)).toBe(0);
      expect(parseAnimationTimeValue(undefined)).toBe(0);
      expect(parseAnimationTimeValue({})).toBe(0);
    });
  });

  describe('canUseNativeDriver', () => {
    test('should return false for undefined properties', () => {
      expect(canUseNativeDriver(undefined)).toBe(false);
    });

    test('should return true for opacity-only properties', () => {
      expect(canUseNativeDriver({ opacity: 0.5 })).toBe(true);
    });

    test('should return true for transform without skew', () => {
      expect(
        canUseNativeDriver({
          transform: [{ scale: 1.2 }, { translateX: 10 }]
        })
      ).toBe(true);
    });

    test('should return false for transform with skew', () => {
      expect(
        canUseNativeDriver({
          transform: [{ scale: 1.2 }, 'skew']
        })
      ).toBe(false);
    });

    test('should return false for non-native-driver properties', () => {
      expect(canUseNativeDriver({ backgroundColor: 'red' })).toBe(false);
      expect(canUseNativeDriver({ width: 100 })).toBe(false);
    });

    test('should return true for mixed native-driver properties', () => {
      expect(
        canUseNativeDriver({
          opacity: 0.5,
          transform: [{ scale: 1.2 }]
        })
      ).toBe(true);
    });
  });

  describe('canUseNativeDriverForProperties', () => {
    test('should return true for all supported properties', () => {
      expect(canUseNativeDriverForProperties(['opacity'])).toBe(true);
      expect(canUseNativeDriverForProperties(['transform'])).toBe(true);
      expect(canUseNativeDriverForProperties(['opacity', 'transform'])).toBe(
        true
      );
      expect(
        canUseNativeDriverForProperties(['translateX', 'scale', 'rotate'])
      ).toBe(true);
    });

    test('should return false for unsupported properties', () => {
      expect(canUseNativeDriverForProperties(['width'])).toBe(false);
      expect(canUseNativeDriverForProperties(['backgroundColor'])).toBe(false);
      expect(canUseNativeDriverForProperties(['height', 'left'])).toBe(false);
    });

    test('should return false for mixed supported and unsupported properties', () => {
      expect(canUseNativeDriverForProperties(['opacity', 'width'])).toBe(false);
      expect(
        canUseNativeDriverForProperties(['transform', 'backgroundColor'])
      ).toBe(false);
    });

    test('should return true for empty array', () => {
      expect(canUseNativeDriverForProperties([])).toBe(true);
    });
  });

  describe('getEasingFunction', () => {
    test('should return correct easing for named functions', () => {
      expect(getEasingFunction('ease')).toBe('ease');
      expect(getEasingFunction('linear')).toBe('linear');
    });

    test('should return modified easing for directional functions', () => {
      expect(getEasingFunction('ease-in')).toBe('in(ease)');
      expect(getEasingFunction('ease-out')).toBe('out(ease)');
      expect(getEasingFunction('ease-in-out')).toBe('inOut(ease)');
    });

    test('should parse cubic-bezier functions', () => {
      expect(getEasingFunction('cubic-bezier(0.1, 0.2, 0.3, 0.4)')).toBe(
        'bezier(0.1,0.2,0.3,0.4)'
      );
    });

    test('should return linear for unknown functions', () => {
      expect(getEasingFunction('unknown')).toBe('linear');
      expect(getEasingFunction(null)).toBe('linear');
      expect(getEasingFunction(undefined)).toBe('linear');
    });
  });
});
