/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type {
  ReactNativeStyle,
  ReactNativeTransform
} from '../../types/renderer.native';

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
 * Type-safe utility to convert an unknown property style object to ReactNativeStyle.
 */
export function toReactNativeStyle(mixedStyle: {
  [string]: unknown
}): ReactNativeStyle {
  const result: ReactNativeStyle = {};

  for (const property in mixedStyle) {
    const value = mixedStyle[property];

    // Only include values that are valid ReactNativeStyleValue types
    if (
      typeof value === 'number' ||
      typeof value === 'string' ||
      Array.isArray(value) ||
      (value != null && typeof value === 'object' && 'interpolate' in value) ||
      value == null
    ) {
      // $FlowFixMe[incompatible-type] - runtime guard restricts values to the ReactNativeStyle domain.
      result[property] = value;
    }
  }

  return result;
}

/**
 * Safely casts an unknown keyframe value to a transform array.
 */
export function safeTransformArray(
  value: unknown
): ReadonlyArray<ReactNativeTransform> {
  if (!Array.isArray(value)) {
    return [];
  }

  if (!isReactNativeTransformArray(value)) {
    return [];
  }

  return (
    // $FlowFixMe[unclear-type] - Flow docs recommend casting through any for hard-to-express conversions.
    value as any as ReadonlyArray<ReactNativeTransform>
  );
}
