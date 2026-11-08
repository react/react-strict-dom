/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

/* eslint-disable no-unreachable */

import type {
  InterpolationConfig,
  SpringAnimationConfig,
  TimingAnimationConfig
} from '../shared/SharedAnimatedTypes';

import { Animated } from 'react-native';

export type AnimatedValue = Animated.Value;
export type CompositeAnimation = Animated.CompositeAnimation;
export type {
  SpringAnimationConfig,
  TimingAnimationConfig,
  InterpolationConfig
};

export * as animated from './animated';
export * as Animation from './Animation';
