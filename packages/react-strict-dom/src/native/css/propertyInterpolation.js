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

import type { AnimationDirection } from '../../types/animation';

import * as ReactNative from '../react-native';

import { parseKeyframeStops } from './keyframeRegistry';
import { parseTransform } from './parseTransform';
import { interpolateTransformArrays } from './transformInterpolation';
import { applyAnimationDirection } from './animationProperties';
import { safeTransformArray } from '../utils/stylePropertyUtils';

/**
 * Handles interpolation for transform properties.
 *
 * TODO: Consider pre-parsing transforms during keyframe registration.
 */
export function interpolateTransformProperty(
  result: { [string]: unknown },
  property: string,
  keyframes: { +[percentage: string]: { +[property: string]: unknown } },
  animatedValue: ReactNative.Animated.Value,
  direction: AnimationDirection
): void {
  // Check if we have string transforms that need parsing
  let hasStringTransforms = false;
  for (const percentage in keyframes) {
    const keyframeValue = keyframes[percentage]?.[property];
    if (typeof keyframeValue === 'string') {
      hasStringTransforms = true;
      break;
    }
  }

  if (!hasStringTransforms) {
    return;
  }

  const transformOutputRange: Array<ReadonlyArray<ReactNativeTransform>> = [];
  const transformInputRange: Array<number> = [];
  const stops = parseKeyframeStops(keyframes);

  for (const stop of stops) {
    transformInputRange.push(stop.value);
    const keyframeValue = keyframes[stop.percentage]?.[property];

    if (typeof keyframeValue === 'string') {
      const parsedTransform =
        parseTransform(keyframeValue).resolveTransformValue();
      if (Array.isArray(parsedTransform)) {
        transformOutputRange.push(parsedTransform);
      } else {
        transformOutputRange.push([]);
      }
    } else if (Array.isArray(keyframeValue)) {
      transformOutputRange.push(safeTransformArray(keyframeValue));
    } else {
      transformOutputRange.push([]);
    }
  }

  // Apply direction handling
  const { finalInputRange, finalOutputRange } = applyAnimationDirection(
    transformInputRange,
    transformOutputRange,
    direction
  );

  if (finalInputRange.length >= 2 && finalOutputRange.length >= 2) {
    try {
      const interpolatedTransforms = interpolateTransformArrays(
        animatedValue,
        finalInputRange,
        finalOutputRange
      );

      if (interpolatedTransforms.length > 0) {
        result[property] = interpolatedTransforms;
      }
    } catch (error) {
      // Transform interpolation failed, skip this property
    }
  }
}

/**
 * Handles interpolation for regular (non-transform) properties using standard
 * Animated.Value interpolation.
 */
export function interpolateRegularProperty(
  result: { [string]: unknown },
  property: string,
  keyframes: { +[percentage: string]: { +[property: string]: unknown } },
  baseStyle: ReactNativeStyle,
  animatedValue: ReactNative.Animated.Value,
  direction: AnimationDirection
): void {
  const outputRange: Array<string | number> = [];
  const inputRange: Array<number> = [];
  const stops = parseKeyframeStops(keyframes);

  for (const stop of stops) {
    inputRange.push(stop.value);
    const keyframeValue = keyframes[stop.percentage]?.[property];
    const fallbackValue = baseStyle[property];

    if (keyframeValue !== undefined) {
      // Ensure we only add string or number values to outputRange
      if (
        typeof keyframeValue === 'string' ||
        typeof keyframeValue === 'number'
      ) {
        outputRange.push(keyframeValue);
      } else if (
        typeof fallbackValue === 'string' ||
        typeof fallbackValue === 'number'
      ) {
        outputRange.push(fallbackValue);
      } else {
        outputRange.push(0);
      }
    } else {
      if (
        typeof fallbackValue === 'string' ||
        typeof fallbackValue === 'number'
      ) {
        outputRange.push(fallbackValue);
      } else {
        outputRange.push(0);
      }
    }
  }

  // Apply direction handling
  const { finalInputRange, finalOutputRange } = applyAnimationDirection(
    inputRange,
    outputRange,
    direction
  );

  if (finalInputRange.length >= 2 && finalOutputRange.length >= 2) {
    result[property] = animatedValue.interpolate({
      inputRange: finalInputRange,
      outputRange: finalOutputRange,
      extrapolate: 'clamp'
    });
  }
}
