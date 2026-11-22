/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { ReactNativeTransform } from '../../types/renderer.native';
import { parseTransform } from './parseTransform';

function isReactNativeTransformArray(value: ReadonlyArray<unknown>): boolean {
  return value.every(isReactNativeTransform);
}

function isReactNativeTransform(value: unknown): boolean {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return (
    value.matrix != null ||
    value.perspective != null ||
    value.rotate != null ||
    value.rotateX != null ||
    value.rotateY != null ||
    value.rotateZ != null ||
    value.scale != null ||
    value.scaleX != null ||
    value.scaleY != null ||
    value.scaleZ != null ||
    value.translateX != null ||
    value.translateY != null ||
    value.skewX != null ||
    value.skewY != null
  );
}

/**
 * Identity transform array used as a safe fallback.
 * This represents "no transformation" and is always safe to interpolate.
 */
export const IDENTITY_TRANSFORM: Array<ReactNativeTransform> = [];

/**
 * Normalizes any transform value to a consistent ReactNativeTransform[] format.
 * This is the single source of truth for transform value conversion.
 */
export function normalizeTransformValue(
  value: string | Array<ReactNativeTransform> | null | void
): Array<ReactNativeTransform> {
  // Handle null/undefined - return identity transform
  if (value == null) {
    return [...IDENTITY_TRANSFORM];
  }

  // Handle CSS string transforms
  if (typeof value === 'string') {
    try {
      const parsedTransform = parseTransform(value).resolveTransformValue();
      if (Array.isArray(parsedTransform)) {
        // Create a mutable copy to ensure type safety
        return [...parsedTransform];
      }
    } catch (error) {
      // Parse failed, use identity transform
    }
    return [...IDENTITY_TRANSFORM];
  }

  // Handle array transforms
  if (Array.isArray(value)) {
    // Validate that each element is a proper transform object
    const validatedTransforms = value.filter((transform): boolean => {
      if (transform == null || typeof transform !== 'object') {
        return false;
      }

      // Check that it has at least one valid transform property
      const validProperties = [
        'matrix',
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

      return validProperties.some((prop) => prop in transform);
    });

    if (validatedTransforms.length > 0) {
      // Return a mutable copy of validated transforms
      return [...validatedTransforms];
    }
  }

  // Fallback to identity transform for any invalid input
  return [...IDENTITY_TRANSFORM];
}

/**
 * Validates that a value represents a proper transform array.
 * Used for runtime validation where needed.
 */
export function isValidTransformArray(value: unknown): boolean {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((transform): boolean => {
    if (transform == null || typeof transform !== 'object') {
      return false;
    }

    // Check for at least one valid transform property
    const validProperties = [
      'matrix',
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

    return validProperties.some((prop) => prop in transform);
  });
}

/**
 * Creates a normalized transform array from keyframe data.
 * This function handles the specific case of extracting transform values
 * from keyframe objects where the property might be missing or invalid.
 */
export function normalizeKeyframeTransform(
  keyframeValue: unknown,
  fallbackValue?: Array<ReactNativeTransform>
): Array<ReactNativeTransform> {
  // Type guard for mixed value - handle each case explicitly
  let typedValue: string | Array<ReactNativeTransform> | null | void = null;

  if (typeof keyframeValue === 'string') {
    typedValue = keyframeValue;
  } else if (Array.isArray(keyframeValue)) {
    // Validate it's an array of transform objects before using it
    const isValidTransformArray = keyframeValue.every((item) => {
      return item != null && typeof item === 'object';
    });
    if (isValidTransformArray) {
      if (isReactNativeTransformArray(keyframeValue)) {
        typedValue =
          // $FlowFixMe[unclear-type] - Flow docs recommend casting through any for hard-to-express conversions.
          keyframeValue as any as Array<ReactNativeTransform>;
      }
    }
  }

  const normalized = normalizeTransformValue(typedValue);

  // If normalization resulted in identity transform and we have a fallback, use it
  if (
    normalized.length === 0 &&
    fallbackValue != null &&
    fallbackValue.length > 0
  ) {
    return [...fallbackValue];
  }

  return normalized;
}
