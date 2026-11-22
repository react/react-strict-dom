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

import * as ReactNative from '../react-native';

import { collectAnimatedProperties } from '../modules/sharedAnimationUtils';
import {
  applyFillModeStyles,
  type AnimationState
} from './animationProperties';
import {
  interpolateTransformProperty,
  interpolateRegularProperty
} from './propertyInterpolation';
import { toReactNativeStyle } from '../utils/stylePropertyUtils';
import { keyframeRegistry } from './keyframeRegistry';

export type { AnimationState };

/**
 * Create interpolated style object from keyframe animation data.
 */
export function getInterpolatedStyle(
  animatedValue: ReactNative.Animated.Value,
  keyframeName: string,
  baseStyle: ReactNativeStyle,
  direction: AnimationDirection = 'normal',
  fillMode: AnimationFillMode = 'none',
  animationState: AnimationState = 'not-started'
): ReactNativeStyle {
  const keyframeDefinition = keyframeRegistry.resolve(keyframeName);
  if (!keyframeDefinition) {
    return baseStyle;
  }

  const { keyframes } = keyframeDefinition;

  const fillModeResult = applyFillModeStyles(
    keyframes,
    direction,
    fillMode,
    animationState,
    baseStyle
  );

  if (fillModeResult !== null) {
    return fillModeResult;
  }

  const result: { [string]: unknown } = {};
  const animatedPropertiesObj = collectAnimatedProperties(keyframes);
  const animatedProperties = new Set(Object.keys(animatedPropertiesObj));
  for (const property of animatedProperties) {
    if (property === 'transform') {
      interpolateTransformProperty(
        result,
        property,
        keyframes,
        animatedValue,
        direction
      );
    } else {
      interpolateRegularProperty(
        result,
        property,
        keyframes,
        baseStyle,
        animatedValue,
        direction
      );
    }
  }

  return toReactNativeStyle(result);
}
