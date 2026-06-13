/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { ReactNativeStyle } from '../../types/renderer.native';

import { parseTimeValue } from '../css/parseTimeValue';
import * as ReactNative from '../react-native';

/**
 * Type guards for animations and transitions.
 */
export function isNumber(num: unknown): num is number {
  return typeof num === 'number';
}

export function isString(str: unknown): str is string {
  return typeof str === 'string';
}

/**
 * Parse time values for duration/delay properties.
 */
export function parseAnimationTimeValue(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    return parseTimeValue(value);
  }
  return 0;
}

const NATIVE_DRIVER_PROPERTIES = new Set([
  'opacity',
  'transform',
  'translateX',
  'translateY',
  'scale',
  'scaleX',
  'scaleY',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ'
]);

const NATIVE_DRIVER_TRANSFORM_PROPERTIES = new Set([
  'translateX',
  'translateY',
  'translateZ',
  'scale',
  'scaleX',
  'scaleY',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ'
]);

/**
 * Determine if animation properties can use native driver.
 */
export function canUseNativeDriver(
  properties: { [string]: unknown } | ReactNativeStyle | void
): boolean {
  if (properties === undefined) {
    return false;
  }

  for (const property in properties) {
    const value = properties[property];

    if (NATIVE_DRIVER_PROPERTIES.has(property)) {
      if (property === 'transform' && Array.isArray(value)) {
        const hasUnsupportedTransform = value.some((transformObj) => {
          if (transformObj == null || typeof transformObj !== 'object') {
            return true;
          }
          return Object.keys(transformObj).some(
            (key) =>
              key === 'skewX' ||
              key === 'skewY' ||
              key === 'skew' ||
              key === 'perspective' ||
              key === 'matrix' ||
              !NATIVE_DRIVER_TRANSFORM_PROPERTIES.has(key)
          );
        });
        if (hasUnsupportedTransform) {
          return false;
        }
      }
      continue;
    }

    return false;
  }
  return true;
}

/**
 * Check if property names can use native driver.
 */
export function canUseNativeDriverForProperties(
  properties: Array<string>
): boolean {
  return properties.every((prop) => NATIVE_DRIVER_PROPERTIES.has(prop));
}

/**
 * Convert CSS timing function names to React Native Easing functions.
 */
export function getEasingFunction(input: ?string): (value: number) => number {
  if (input === 'ease') {
    return ReactNative.Easing.ease;
  } else if (input === 'ease-in') {
    return ReactNative.Easing.in(ReactNative.Easing.ease);
  } else if (input === 'ease-out') {
    return ReactNative.Easing.out(ReactNative.Easing.ease);
  } else if (input === 'ease-in-out') {
    return ReactNative.Easing.inOut(ReactNative.Easing.ease);
  } else if (input != null && input.includes('cubic-bezier')) {
    const chunk = input.split('cubic-bezier(')[1];
    const str = chunk.split(')')[0];
    const curve = str.split(',').map((point) => parseFloat(point.trim()));
    return ReactNative.Easing.bezier(...curve);
  }
  return ReactNative.Easing.linear;
}

/**
 * Collect animated properties from keyframes.
 */
export function collectAnimatedProperties(keyframes: {
  +[percentage: string]: { +[property: string]: unknown }
}): { [string]: unknown } {
  const animatedProperties: { [string]: unknown } = {};

  for (const percentage in keyframes) {
    const keyframeValues = keyframes[percentage];
    for (const property in keyframeValues) {
      animatedProperties[property] = keyframeValues[property];
    }
  }

  return animatedProperties;
}
