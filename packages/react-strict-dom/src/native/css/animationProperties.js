/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { ReactNativeStyle } from '../../types/renderer.native';
import type {
  AnimationDirection,
  AnimationFillMode
} from '../../types/animation';

import { parseTransform } from './parseTransform';
import { toReactNativeStyle } from '../utils/stylePropertyUtils';

/**
 * Apply animation direction handling to input and output ranges.
 */
export function applyAnimationDirection<T>(
  inputRange: Array<number>,
  outputRange: Array<T>,
  direction: AnimationDirection
): { finalInputRange: Array<number>, finalOutputRange: Array<T> } {
  let finalInputRange = [...inputRange];
  let finalOutputRange = [...outputRange];

  if (direction === 'reverse') {
    finalOutputRange.reverse();
  } else if (direction === 'alternate' || direction === 'alternate-reverse') {
    const forwardInputRange = inputRange.map((val) => val * 0.5);
    const backwardInputRange = inputRange.map((val) => 0.5 + val * 0.5);

    if (direction === 'alternate') {
      finalInputRange = [...forwardInputRange, ...backwardInputRange];
      finalOutputRange = [...outputRange, ...outputRange.slice().reverse()];
    } else {
      finalInputRange = [...forwardInputRange, ...backwardInputRange];
      finalOutputRange = [...outputRange.slice().reverse(), ...outputRange];
    }
  }

  return { finalInputRange, finalOutputRange };
}

export type AnimationState = 'not-started' | 'running' | 'completed';

/**
 * Apply fill mode behavior for keyframe styles when animation is not running.
 */
export function applyFillModeStyles(
  keyframes: { +[percentage: string]: { +[property: string]: unknown } },
  direction: AnimationDirection,
  fillMode: AnimationFillMode,
  animationState: AnimationState,
  baseStyle: ReactNativeStyle
): ReactNativeStyle | null {
  const shouldApplyBackwards =
    (fillMode === 'backwards' || fillMode === 'both') &&
    animationState === 'not-started';
  const shouldApplyForwards =
    (fillMode === 'forwards' || fillMode === 'both') &&
    animationState === 'completed';
  const shouldReturnToOriginal =
    (fillMode === 'none' || fillMode === 'backwards') &&
    animationState === 'completed';

  if (shouldReturnToOriginal) {
    return baseStyle;
  }

  if (!shouldApplyBackwards && !shouldApplyForwards) {
    return null;
  }

  const result: { [string]: unknown } = { ...baseStyle };
  let targetKeyframe = '0%';

  if (shouldApplyForwards) {
    if (direction === 'normal' || direction === 'alternate') {
      targetKeyframe = '100%';
    } else if (direction === 'reverse' || direction === 'alternate-reverse') {
      targetKeyframe = '0%';
    }
  } else if (shouldApplyBackwards) {
    if (direction === 'normal' || direction === 'alternate') {
      targetKeyframe = '0%';
    } else if (direction === 'reverse' || direction === 'alternate-reverse') {
      targetKeyframe = '100%';
    }
  }
  if (keyframes[targetKeyframe]) {
    const fillModeValues = keyframes[targetKeyframe];
    for (const property in fillModeValues) {
      const value = fillModeValues[property];

      if (property === 'transform' && typeof value === 'string') {
        const parsedTransform = parseTransform(value).resolveTransformValue();
        if (Array.isArray(parsedTransform)) {
          result[property] = parsedTransform;
        }
      } else if (typeof value === 'string' || typeof value === 'number') {
        result[property] = value;
      }
    }
  }

  return toReactNativeStyle(result);
}

export type AnimationProperties = {
  animationName?: string | Array<string>,
  animationDuration?: string | Array<string>,
  animationDelay?: string | Array<string>,
  animationTimingFunction?: string | Array<string>,
  animationIterationCount?: number | string | Array<number | string>,
  animationDirection?: string | Array<string>,
  animationFillMode?: string | Array<string>,
  animationPlayState?: string | Array<string>,
  ...
};

export type NormalizedAnimationProperties = {
  normalized: {
    animationName: Array<string>,
    animationDuration?: Array<string>,
    animationDelay?: Array<string>,
    animationTimingFunction?: Array<string>,
    animationIterationCount?: Array<number | string>,
    animationDirection?: Array<string>,
    animationFillMode?: Array<string>,
    animationPlayState?: Array<string>
  },
  animationCount: number
};

/**
 * Normalize animation property arrays per CSS specification.
 * animationName determines count, other properties cycle to match.
 */
export function normalizeAnimationProperties(
  animationProperties: AnimationProperties
): NormalizedAnimationProperties {
  const { animationName, ...otherProps } = animationProperties;

  const animationNameArray = Array.isArray(animationName)
    ? animationName
    : animationName != null
      ? [animationName]
      : [];

  const animationCount = animationNameArray.length;
  const result: NormalizedAnimationProperties = {
    normalized: {
      animationName: animationNameArray
    },
    animationCount
  };

  if (otherProps.animationDuration != null) {
    const valueArray = Array.isArray(otherProps.animationDuration)
      ? otherProps.animationDuration
      : [otherProps.animationDuration];
    result.normalized.animationDuration = normalizeToCount(
      valueArray,
      animationCount
    );
  }

  if (otherProps.animationDelay != null) {
    const valueArray = Array.isArray(otherProps.animationDelay)
      ? otherProps.animationDelay
      : [otherProps.animationDelay];
    result.normalized.animationDelay = normalizeToCount(
      valueArray,
      animationCount
    );
  }

  if (otherProps.animationTimingFunction != null) {
    const valueArray = Array.isArray(otherProps.animationTimingFunction)
      ? otherProps.animationTimingFunction
      : [otherProps.animationTimingFunction];
    result.normalized.animationTimingFunction = normalizeToCount(
      valueArray,
      animationCount
    );
  }

  if (otherProps.animationIterationCount != null) {
    const valueArray = Array.isArray(otherProps.animationIterationCount)
      ? otherProps.animationIterationCount
      : [otherProps.animationIterationCount];
    result.normalized.animationIterationCount = normalizeToCount(
      valueArray,
      animationCount
    );
  }

  if (otherProps.animationDirection != null) {
    const valueArray = Array.isArray(otherProps.animationDirection)
      ? otherProps.animationDirection
      : [otherProps.animationDirection];
    result.normalized.animationDirection = normalizeToCount(
      valueArray,
      animationCount
    );
  }

  if (otherProps.animationFillMode != null) {
    const valueArray = Array.isArray(otherProps.animationFillMode)
      ? otherProps.animationFillMode
      : [otherProps.animationFillMode];
    result.normalized.animationFillMode = normalizeToCount(
      valueArray,
      animationCount
    );
  }

  if (otherProps.animationPlayState != null) {
    const valueArray = Array.isArray(otherProps.animationPlayState)
      ? otherProps.animationPlayState
      : [otherProps.animationPlayState];
    result.normalized.animationPlayState = normalizeToCount(
      valueArray,
      animationCount
    );
  }

  return result;
}

function normalizeToCount<T>(
  valueArray: Array<T>,
  targetCount: number
): Array<T> {
  const result = [];
  for (let i = 0; i < targetCount; i++) {
    result.push(valueArray[i % valueArray.length]);
  }
  return result;
}
