/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export type AnimationDirection =
  | 'normal'
  | 'reverse'
  | 'alternate'
  | 'alternate-reverse';

export type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';

export type AnimationPlayState = 'running' | 'paused';

export type AnimationComposition = 'replace' | 'add' | 'accumulate';

export type AnimationTimingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'step-start'
  | 'step-end'
  | string; // for cubic-bezier() and steps() functions

export type AnimationIterationCount = number | 'infinite';

export type AnimationName = string;

export type AnimationDelay = string; // time value like '1s' or '200ms'
export type AnimationDuration = string; // time value like '1s' or '200ms'

export type AnimationProperties = {
  +animationName?: AnimationName,
  +animationDuration?: AnimationDuration,
  +animationDelay?: AnimationDelay,
  +animationTimingFunction?: AnimationTimingFunction,
  +animationIterationCount?: AnimationIterationCount,
  +animationDirection?: AnimationDirection,
  +animationFillMode?: AnimationFillMode,
  +animationPlayState?: AnimationPlayState,
  +animationComposition?: AnimationComposition
};

export type KeyframeValues = { +[property: string]: unknown };

export type KeyframesDefinition = {
  +[percentage: string]: KeyframeValues
};
