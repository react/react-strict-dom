/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type {
  InterpolationConfig,
  ParallelConfig,
  SpringAnimationConfig,
  TimingAnimationConfig
} from '../shared/SharedAnimatedTypes';
import { Animated, useAnimatedValue } from 'react-native';

type CompositeAnimation = Animated.CompositeAnimation;

export function useValue(initialValue: number): Animated.Value {
  return useAnimatedValue(initialValue, { useNativeDriver: true });
}

export function parallel(
  animations: Array<CompositeAnimation>,
  config?: ParallelConfig
): CompositeAnimation {
  return Animated.parallel(animations, config);
}

export function sequence(
  animations: Array<CompositeAnimation>
): CompositeAnimation {
  return Animated.sequence(animations);
}

export function delay(time: number): CompositeAnimation {
  return Animated.delay(time);
}

export function timing(
  value: Animated.Value,
  config: TimingAnimationConfig
): CompositeAnimation {
  return Animated.timing(value, { ...config, useNativeDriver: true });
}

export function spring(
  value: Animated.Value,
  config: SpringAnimationConfig
): CompositeAnimation {
  return Animated.spring(value, { ...config, useNativeDriver: true });
}

export function interpolate<TOutput extends string | number>(
  value: Animated.Node,
  config: InterpolationConfig<TOutput>
): Animated.Node {
  return new Animated.Interpolation(value, config);
}
