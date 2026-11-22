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
import {
  transformsHaveSameLengthTypesAndOrder,
  createTransformWithProperty,
  interpolateTransformProperty,
  TRANSFORM_PROPERTIES,
  type TransformProperty
} from '../modules/sharedInterpolation';

/**
 * Extract a specific property value from a transform object using property existence check
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

// Export shared functions from the shared interpolation module
export {
  interpolateTransformProperty,
  transformsHaveSameLengthTypesAndOrder,
  createTransformWithProperty,
  TRANSFORM_PROPERTIES
};

// Export types separately to avoid Flow issues
export type { TransformProperty };

/**
 * Create an animated transform object for a specific transform property
 */
export function createAnimatedTransform(
  property: string,
  animatedValue: ReactNative.Animated.Value,
  inputRange: ReadonlyArray<number>,
  outputRange: ReadonlyArray<number | string>
): { [string]: unknown } {
  return {
    [property]: interpolateTransformProperty(
      animatedValue,
      inputRange,
      outputRange
    )
  };
}

/**
 * Extract values for a specific transform property from an array of transform objects
 */
export function extractTransformPropertyValues(
  transforms: ReadonlyArray<ReactNativeTransform>,
  property: TransformProperty
): Array<unknown> {
  return transforms.map((transform) => {
    return getTransformPropertyValue(transform, property);
  });
}

/**
 * Check if all transform arrays have the same structure for a specific property
 */
export function validateTransformPropertyConsistency(
  transformArrays: ReadonlyArray<ReadonlyArray<ReactNativeTransform>>,
  property: TransformProperty
): boolean {
  if (transformArrays.length < 2) {
    return true;
  }

  const firstValues = extractTransformPropertyValues(
    transformArrays[0],
    property
  );

  for (let i = 1; i < transformArrays.length; i++) {
    const currentValues = extractTransformPropertyValues(
      transformArrays[i],
      property
    );

    // Check lengths match
    if (firstValues.length !== currentValues.length) {
      return false;
    }

    // Check that same positions have same property presence
    for (let j = 0; j < firstValues.length; j++) {
      const firstHasProperty = firstValues[j] !== null;
      const currentHasProperty = currentValues[j] !== null;

      if (firstHasProperty !== currentHasProperty) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Create interpolated transform array from multiple keyframe transform arrays
 */
export function interpolateTransformArrays(
  animatedValue: ReactNative.Animated.Value,
  inputRange: ReadonlyArray<number>,
  transformArrays: ReadonlyArray<ReadonlyArray<ReactNativeTransform>>
): ReadonlyArray<{ [string]: unknown }> {
  if (transformArrays.length === 0) {
    return [];
  }

  const firstTransforms = transformArrays[0];
  const resultTransforms: Array<{ [string]: unknown }> = [];

  // Process each transform position in the array
  for (let i = 0; i < firstTransforms.length; i++) {
    let transformObject: { [string]: unknown } = {};
    let hasAnimatedProperties = false;

    // Handle each transform property explicitly to avoid dynamic property access
    for (const property of TRANSFORM_PROPERTIES) {
      // Extract values for this property from all keyframes
      const propertyValues = transformArrays.map((transforms) => {
        const transform = transforms[i];
        if (!transform) return null;
        return getTransformPropertyValue(transform, property);
      });

      // Check if this property exists in any keyframe
      const hasProperty = propertyValues.some((value) => value !== null);
      if (!hasProperty) {
        continue;
      }

      // Check if all keyframes that have transforms at this position also have this property
      const validValues = [];
      const validInputRange = [];

      for (let j = 0; j < propertyValues.length; j++) {
        if (propertyValues[j] !== null) {
          // $FlowFixMe[incompatible-call] - null-check above guarantees the value is present.
          validValues.push(propertyValues[j]);
          validInputRange.push(inputRange[j]);
        }
      }

      let propertyValue;
      if (validValues.length >= 2) {
        // Create interpolated value
        propertyValue = interpolateTransformProperty(
          animatedValue,
          validInputRange,
          validValues
        );
        hasAnimatedProperties = true;
      } else if (validValues.length === 1) {
        // Static value
        propertyValue = validValues[0];
      } else {
        continue;
      }

      // Create new transform object with the specific property using type-safe assignment
      const propertyTransform = createTransformWithProperty(
        property,
        propertyValue
      );
      transformObject = { ...transformObject, ...propertyTransform };
    }

    if (hasAnimatedProperties || Object.keys(transformObject).length > 0) {
      resultTransforms.push(transformObject);
    }
  }

  return resultTransforms;
}
