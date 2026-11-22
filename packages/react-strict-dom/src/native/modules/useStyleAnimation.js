/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { ReactNativeStyle } from '../../types/renderer.native';

import * as React from 'react';

import { keyframeRegistry } from '../css/keyframeRegistry';
import {
  parseAnimationTimeValue,
  parseAnimationIterationCount,
  parseAnimationDirection,
  parseAnimationFillMode,
  parseAnimationPlayState,
  canUseNativeDriver,
  collectAnimatedProperties,
  extractAnimationProperties,
  normalizeAnimationArrays,
  composeMultipleAnimatedStyles,
  type NormalizedAnimationArrays
} from './animationUtils';
import {
  AnimationController,
  type AnimationMetadata
} from './AnimationController';

/**
 * Build AnimationMetadata for a specific animation index.
 */
function buildMetadataForIndex(
  normalizedAnimations: NormalizedAnimationArrays,
  index: number
): AnimationMetadata | null {
  const animationName = normalizedAnimations.animationName[index];
  const duration = parseAnimationTimeValue(
    normalizedAnimations.animationDuration[index]
  );
  const delay = parseAnimationTimeValue(
    normalizedAnimations.animationDelay[index]
  );

  if (duration <= 0) {
    return null;
  }

  const keyframeDefinition = keyframeRegistry.resolve(animationName);
  if (!keyframeDefinition) {
    return null;
  }

  const { keyframes } = keyframeDefinition;
  const animatedProperties = collectAnimatedProperties(keyframes);
  const shouldUseNativeDriver = canUseNativeDriver(animatedProperties);
  return {
    animationName,
    delay,
    duration,
    timingFunction: normalizedAnimations.animationTimingFunction[index],
    iterationCount: parseAnimationIterationCount(
      normalizedAnimations.animationIterationCount[index]
    ),
    direction: parseAnimationDirection(
      normalizedAnimations.animationDirection[index]
    ),
    fillMode: parseAnimationFillMode(
      normalizedAnimations.animationFillMode[index]
    ),
    playState: parseAnimationPlayState(
      normalizedAnimations.animationPlayState[index]
    ),
    shouldUseNativeDriver
  };
}

export function useStyleAnimation(style: ReactNativeStyle): ReactNativeStyle {
  const animationProps = extractAnimationProperties(style);
  const [hasBeenAnimated, setHasBeenAnimated] = React.useState(false);

  const hasAnimation =
    animationProps != null && animationProps.animationName != null;

  const normalizedAnimations = React.useMemo(() => {
    if (!hasAnimation || !animationProps) {
      return null;
    }

    return normalizeAnimationArrays(animationProps);
  }, [hasAnimation, animationProps]);

  // Keep a ref to normalizedAnimations for use in controllers useMemo
  // without triggering re-creation when only playState changes
  const normalizedAnimationsRef = React.useRef(normalizedAnimations);
  normalizedAnimationsRef.current = normalizedAnimations;

  // Create a stable hash of restart properties
  const restartHash = React.useMemo(() => {
    if (!normalizedAnimations) return '';

    return [
      normalizedAnimations.animationName?.join(',') || '',
      normalizedAnimations.animationDuration?.join(',') || '',
      normalizedAnimations.animationDelay?.join(',') || '',
      normalizedAnimations.animationTimingFunction?.join(',') || '',
      normalizedAnimations.animationIterationCount?.join(',') || ''
    ].join('|');
  }, [normalizedAnimations]);

  const controllers = React.useMemo(() => {
    const currentNormalized = normalizedAnimationsRef.current;
    if (!hasAnimation || !currentNormalized || restartHash === '') {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      return new Map();
    }

    // $FlowFixMe[underconstrained-implicit-instantiation]
    const newControllers = new Map();

    for (let i = 0; i < currentNormalized.animationCount; i++) {
      const animationKey = `${currentNormalized.animationName[i]}_${i}`;
      const metadata = buildMetadataForIndex(currentNormalized, i);

      if (metadata) {
        const controller = new AnimationController(metadata);
        newControllers.set(animationKey, controller);

        if (metadata.playState !== 'paused') {
          controller.start();
        }
      }
    }

    return newControllers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnimation, restartHash]);

  // Sync hasBeenAnimated state (must be in useEffect, not useMemo)
  React.useEffect(() => {
    if (controllers.size > 0) {
      setHasBeenAnimated(true);
    }
  }, [controllers]);

  React.useEffect(() => {
    if (!normalizedAnimations || controllers.size === 0) {
      return;
    }

    for (const [animationKey, controller] of controllers.entries()) {
      const keyParts = animationKey.split('_');
      const animationIndex = parseInt(keyParts[keyParts.length - 1], 10) || 0;
      const playState = normalizedAnimations.animationPlayState[animationIndex];
      const shouldBePaused = parseAnimationPlayState(playState) === 'paused';

      if (shouldBePaused && !controller.isPaused()) {
        controller.pause();
      } else if (!shouldBePaused && controller.isPaused()) {
        controller.resume();
      }
    }
  }, [animationProps?.animationPlayState, controllers, normalizedAnimations]);

  // Cleanup on unmount or controller change
  React.useEffect(() => {
    return () => {
      controllers.forEach((controller) => controller.dispose());
    };
  }, [controllers]);

  if (!hasAnimation || !normalizedAnimations) {
    return style;
  }
  if (hasBeenAnimated && controllers.size > 0) {
    const composedStyle = composeMultipleAnimatedStyles(
      style,
      controllers,
      normalizedAnimations
    );

    return composedStyle;
  }

  return style;
}
