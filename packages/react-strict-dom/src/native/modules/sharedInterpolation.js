/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { ReactNativeTransform } from '../../types/renderer.native';

import * as ReactNative from '../react-native';

/**
 * Shared transform interpolation utilities for transitions and animations
 * This module provides common transform handling to eliminate code duplication
 */

/**
 * Transform property metadata for maintaining type safety and reducing repetition
 * Shared by both animations and transitions
 */
export type TransformProperty =
  | 'perspective'
  | 'rotate'
  | 'rotateX'
  | 'rotateY'
  | 'rotateZ'
  | 'scale'
  | 'scaleX'
  | 'scaleY'
  | 'scaleZ'
  | 'skewX'
  | 'skewY'
  | 'translateX'
  | 'translateY';

export const TRANSFORM_PROPERTIES: ReadonlyArray<TransformProperty> = [
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
];

/**
 * Extract a specific property value from a transform object using property existence check
 * Shared utility for both animations and transitions
 */
function getTransformPropertyValue(
  transform: ReactNativeTransform,
  property: TransformProperty
): number | string | null {
  if (property === 'perspective') {
    return transform.perspective ?? null;
  }
  if (property === 'rotate') {
    return transform.rotate ?? null;
  }
  if (property === 'rotateX') {
    return transform.rotateX ?? null;
  }
  if (property === 'rotateY') {
    return transform.rotateY ?? null;
  }
  if (property === 'rotateZ') {
    return transform.rotateZ ?? null;
  }
  if (property === 'scale') {
    return transform.scale ?? null;
  }
  if (property === 'scaleX') {
    return transform.scaleX ?? null;
  }
  if (property === 'scaleY') {
    return transform.scaleY ?? null;
  }
  if (property === 'scaleZ') {
    return transform.scaleZ ?? null;
  }
  if (property === 'skewX') {
    return transform.skewX ?? null;
  }
  if (property === 'skewY') {
    return transform.skewY ?? null;
  }
  if (property === 'translateX') {
    return transform.translateX ?? null;
  }
  return transform.translateY ?? null;
}

/**
 * Check if transform arrays have the same length, types and order.
 * Shared by both animations and transitions to ensure consistency.
 */
export function transformsHaveSameLengthTypesAndOrder(
  transformsA: ReadonlyArray<ReactNativeTransform>,
  transformsB: ReadonlyArray<ReactNativeTransform>
): boolean {
  if (transformsA.length !== transformsB.length) {
    return false;
  }

  for (let i = 0; i < transformsA.length; i++) {
    const transformA = transformsA[i];
    const transformB = transformsB[i];

    // Check that both transforms have the same properties present/absent
    for (const property of TRANSFORM_PROPERTIES) {
      const hasPropertyA =
        getTransformPropertyValue(transformA, property) != null;
      const hasPropertyB =
        getTransformPropertyValue(transformB, property) != null;

      if (hasPropertyA !== hasPropertyB) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Create a transform object with a single property set using computed property names
 * Shared utility for creating type-safe transform objects
 */
export function createTransformWithProperty(
  property: TransformProperty,
  value: unknown
): { [string]: unknown } {
  return { [property]: value };
}

/**
 * Interpolate a single transform property between two values
 * Shared by both animations and transitions
 */
export function interpolateTransformProperty(
  animatedValue: ReactNative.Animated.Value,
  inputRange: ReadonlyArray<number>,
  outputRange: ReadonlyArray<number | string>
): unknown {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp'
  });
}

/**
 * Normalize transform values for consistent handling
 * Used to ensure transform values are in the expected format
 */
export function normalizeTransformValue(value: unknown): number | string {
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  // Default fallback for invalid values
  return 0;
}

/**
 * Create an animated transform object for transitions (binary interpolation)
 * This handles the simple case of interpolating between two transform states
 */
export function createBinaryAnimatedTransform(
  animatedValue: ReactNative.Animated.Value,
  fromTransforms: ReadonlyArray<ReactNativeTransform>,
  toTransforms: ReadonlyArray<ReactNativeTransform>
): ReadonlyArray<{ [string]: unknown }> {
  const inputRange = [0, 1];
  const resultTransforms = [];

  // Process each transform position in the arrays
  for (let i = 0; i < toTransforms.length; i++) {
    const fromTransform = fromTransforms[i];
    const toTransform = toTransforms[i];
    let transformObject: { [string]: unknown } = {};

    // Handle each transform property
    for (const property of TRANSFORM_PROPERTIES) {
      const fromValue = getTransformPropertyValue(fromTransform, property);
      const toValue = getTransformPropertyValue(toTransform, property);

      // Only interpolate if both transforms have this property
      if (fromValue != null && toValue != null) {
        const outputRange = [
          normalizeTransformValue(fromValue),
          normalizeTransformValue(toValue)
        ];

        const propertyTransform = createTransformWithProperty(
          property,
          interpolateTransformProperty(animatedValue, inputRange, outputRange)
        );
        transformObject = { ...transformObject, ...propertyTransform };
      }
    }

    if (Object.keys(transformObject).length > 0) {
      resultTransforms.push(transformObject);
    }
  }

  return resultTransforms;
}

/**
 * Check if two transform arrays are equal in both structure and values
 * Shared utility for detecting changes in transform state
 */
export function transformListsAreEqual(
  transformsA: ReadonlyArray<ReactNativeTransform>,
  transformsB: ReadonlyArray<ReactNativeTransform>
): boolean {
  if (!transformsHaveSameLengthTypesAndOrder(transformsA, transformsB)) {
    return false;
  }

  for (let i = 0; i < transformsA.length; i++) {
    const tA = transformsA[i];
    const tB = transformsB[i];

    // Check all properties for value equality
    for (const property of TRANSFORM_PROPERTIES) {
      const valueA = getTransformPropertyValue(tA, property);
      const valueB = getTransformPropertyValue(tB, property);

      if (valueA !== valueB) {
        return false;
      }
    }
  }

  return true;
}
