/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { CompositeAnimation } from '../../types/renderer.native';

import type {
  AnimationDirection,
  AnimationFillMode
} from '../../types/animation';
import type { NormalizedAnimationProperties } from '../css/animationProperties';

import * as ReactNative from '../react-native';

import { keyframeRegistry } from '../css/keyframeRegistry';
import {
  getEasingFunction,
  parseAnimationDirection,
  parseAnimationFillMode
} from './animationUtils';
import {
  canUseNativeDriver,
  canUseNativeDriverForProperties,
  collectAnimatedProperties
} from './sharedAnimationUtils';
import { parseTimeValue } from '../css/parseTimeValue';
import { warnMsg } from '../../shared/logUtils';

function handleAnimationError(error: Error | unknown, context: string): void {
  if (__DEV__) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    warnMsg(`${context}: ${errorMessage}`);
  }
}

type KeyframeDefinition = {
  +[string]: { +[string]: unknown }
};

type StyleController = {
  getCurrentValue?: (property: string) => number,
  registerAnimationController?: (
    property: string,
    controller: AnimationController
  ) => void
};

export type AnimationState = 'not-started' | 'running' | 'completed';

export type AnimationMetadata = Readonly<{
  animationName: string,
  delay: number,
  duration: number,
  timingFunction: string,
  iterationCount: number | 'infinite',
  direction: AnimationDirection,
  fillMode: AnimationFillMode,
  playState: 'running' | 'paused',
  shouldUseNativeDriver: boolean
}>;

export type MultiAnimationState = 'idle' | 'active' | 'paused';

export type ComposedStyle = { [string]: unknown, ... };

export type NormalizedAnimationProps = {
  animationName: Array<string>,
  animationDuration?: Array<string>,
  animationDelay?: Array<string>,
  animationTimingFunction?: Array<string>,
  animationIterationCount?: Array<number | string>,
  animationDirection?: Array<string>,
  animationFillMode?: Array<string>,
  animationPlayState?: Array<string>,
  ...
};

/**
 * Handles lifecycle and state management of CSS animations.
 * Supports multiple concurrent animations.
 */
export class AnimationController {
  _metadata: AnimationMetadata;
  _animatedValue: ReactNative.Animated.Value;
  _animation: CompositeAnimation | null = null;
  _state: AnimationState = 'not-started';
  _isPaused: boolean = false;
  _pausedValue: number = 0;
  _onStateChange: ?(state: AnimationState) => void;
  _isDisposed: boolean = false;
  _animatedValues: Map<string, ReactNative.Animated.Value> = new Map();

  _childAnimations: Map<string, AnimationController> = new Map();
  _multiAnimationState: MultiAnimationState = 'idle';
  _activeAnimationCount: number = 0;
  _isMultiAnimationManager: boolean = false;

  constructor(
    metadata: AnimationMetadata,
    onStateChange?: (state: AnimationState) => void
  ) {
    this._metadata = metadata;
    this._animatedValue = new ReactNative.Animated.Value(0);
    this._onStateChange = onStateChange;
    this._isPaused = metadata.playState === 'paused';
  }

  /**
   * Create a multi-animation manager.
   */
  static createMultiAnimationManager(): AnimationController {
    // Dummy metadata for the manager instance
    const dummyMetadata: AnimationMetadata = {
      animationName: '__multi_manager__',
      delay: 0,
      duration: 0,
      timingFunction: 'ease',
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'none',
      playState: 'running',
      shouldUseNativeDriver: false
    };

    const manager = new AnimationController(dummyMetadata);
    manager._isMultiAnimationManager = true;
    return manager;
  }

  start() {
    if (this._isDisposed) {
      return;
    }

    this._isPaused = false;
    this.stop();
    // $FlowFixMe[incompatible-use] - setValue exists on real Animated.Value
    this._animatedValue.setValue?.(0);

    const keyframeDefinition = keyframeRegistry.resolve(
      this._metadata.animationName
    );
    if (!keyframeDefinition) {
      return;
    }

    this._animation = this._createKeyframeAnimation();

    if (this._animation) {
      this._animation.start();
      this._setState('running');
    }
  }

  pause() {
    if (this._isDisposed || this._isPaused) {
      return;
    }

    if (this._animation) {
      this._animatedValue.stopAnimation((value) => {
        this._pausedValue = value || 0;
      });
      if (this._animation) {
        this._animation.stop();
      }
      this._isPaused = true;
    }
  }

  resume() {
    if (this._isDisposed || !this._isPaused) {
      return;
    }

    const resumeAnimation = this._createResumeAnimation(this._pausedValue);
    if (resumeAnimation) {
      this._animation = resumeAnimation;
      resumeAnimation.start((result) => {
        if (this._isDisposed) {
          return;
        }

        if (result?.finished) {
          if (this._metadata.iterationCount === 'infinite') {
            this.start();
          } else {
            this._setState('completed');
          }
        }
      });
      this._setState('running');
    } else {
      this.start();
    }

    this._isPaused = false;
  }

  stop() {
    if (this._animation) {
      this._animation.stop();
      this._animation = null;
    }
    this._isPaused = false;
    this._setState('not-started');
  }

  dispose(): void {
    this.stop();
    this._isDisposed = true;
    this._onStateChange = null;

    this._animatedValues.clear();
    this._animatedValue.stopAnimation();

    try {
      this._animatedValue.setValue(0);
    } catch (error) {
      // Handle setValue errors in test environments
    }

    if (this._isMultiAnimationManager) {
      for (const controller of this._childAnimations.values()) {
        controller.dispose();
      }
      this._childAnimations.clear();
    }
    this._pausedValue = 0;
    this._activeAnimationCount = 0;
    this._multiAnimationState = 'idle';
  }

  getState(): AnimationState {
    return this._state;
  }

  isPaused(): boolean {
    return this._isPaused;
  }

  getAnimatedValue(): ReactNative.Animated.Value {
    return this._animatedValue;
  }

  getAnimationName(): string {
    return this._metadata.animationName;
  }

  getIterationCount(): number | 'infinite' {
    return this._metadata.iterationCount;
  }

  _createKeyframeAnimation(): CompositeAnimation | null {
    const {
      delay,
      duration,
      timingFunction,
      iterationCount,
      shouldUseNativeDriver
    } = this._metadata;

    try {
      this._animatedValue.setValue(0);
    } catch (error) {
      handleAnimationError(error, 'AnimationController setValue');
    }

    const baseAnimation = ReactNative.Animated.timing(this._animatedValue, {
      delay,
      duration,
      easing: getEasingFunction(timingFunction),
      toValue: 1,
      useNativeDriver: shouldUseNativeDriver
    });

    const wrappedAnimation = this._wrapAnimationWithCallbacks(baseAnimation);

    if (iterationCount === 'infinite') {
      if (typeof ReactNative.Animated.loop === 'function') {
        return ReactNative.Animated.loop(wrappedAnimation, { iterations: -1 });
      }
    } else if (iterationCount > 1) {
      if (typeof ReactNative.Animated.loop === 'function') {
        return ReactNative.Animated.loop(wrappedAnimation, {
          iterations: Math.floor(iterationCount)
        });
      }
    }

    return wrappedAnimation;
  }

  _createResumeAnimation(fromValue: number): CompositeAnimation | null {
    const { duration, timingFunction, shouldUseNativeDriver } = this._metadata;

    const remainingProgress = 1 - fromValue;

    if (remainingProgress <= 0.01) {
      return null;
    }

    const remainingDuration = Math.max(0, duration * remainingProgress);
    if (remainingDuration <= 0) {
      return null;
    }

    return ReactNative.Animated.timing(this._animatedValue, {
      delay: 0,
      duration: remainingDuration,
      easing: getEasingFunction(timingFunction),
      toValue: 1,
      useNativeDriver: shouldUseNativeDriver
    });
  }

  _wrapAnimationWithCallbacks(
    animation: CompositeAnimation
  ): CompositeAnimation {
    const originalStart = animation.start;
    const { iterationCount } = this._metadata;

    animation.start = (callback) => {
      this._setState('running');

      originalStart.call(animation, (result) => {
        if (!this._isDisposed) {
          if (result?.finished && iterationCount !== 'infinite') {
            this._setState('completed');
          }
        }
        if (callback) callback(result);
      });
    };

    return animation;
  }

  _setState(state: AnimationState) {
    if (this._state !== state) {
      this._state = state;
      if (this._onStateChange && !this._isDisposed) {
        this._onStateChange(state);
      }
    }
  }

  /**
   * Optimize animation configuration with native driver detection.
   */
  _createOptimizedAnimationConfig(
    config: AnimationMetadata
  ): AnimationMetadata {
    const keyframes = keyframeRegistry.resolve(config.animationName);
    if (!keyframes) {
      return config;
    }

    const animatedProperties = collectAnimatedProperties(keyframes.keyframes);
    const propertyNames = Object.keys(animatedProperties);
    const canUseNative =
      canUseNativeDriverForProperties(propertyNames) &&
      canUseNativeDriver(animatedProperties);

    return {
      ...config,
      shouldUseNativeDriver: canUseNative
    };
  }

  _buildAnimationConfig(
    normalized: NormalizedAnimationProps,
    index: number
  ): AnimationMetadata {
    const baseConfig = {
      animationName: normalized.animationName[index],
      delay: parseTimeValue(
        normalized.animationDelay?.[index] != null
          ? normalized.animationDelay[index]
          : '0s'
      ),
      duration: parseTimeValue(
        normalized.animationDuration?.[index] != null
          ? normalized.animationDuration[index]
          : '0s'
      ),
      timingFunction:
        normalized.animationTimingFunction?.[index] != null
          ? normalized.animationTimingFunction[index]
          : 'ease',
      iterationCount: this._parseIterationCount(
        normalized.animationIterationCount?.[index] != null
          ? normalized.animationIterationCount[index]
          : 1
      ),
      direction: parseAnimationDirection(
        normalized.animationDirection?.[index] != null
          ? normalized.animationDirection[index]
          : 'normal'
      ),
      fillMode: parseAnimationFillMode(
        normalized.animationFillMode?.[index] != null
          ? normalized.animationFillMode[index]
          : 'none'
      ),
      playState: this._parsePlayState(
        normalized.animationPlayState?.[index] != null
          ? normalized.animationPlayState[index]
          : 'running'
      ),
      shouldUseNativeDriver: false
    };
    return this._createOptimizedAnimationConfig(baseConfig);
  }

  _parseIterationCount(value: number | string): number | 'infinite' {
    if (value === 'infinite' || value === Infinity) {
      return 'infinite';
    }
    return typeof value === 'number' ? value : parseFloat(String(value)) || 1;
  }

  _parsePlayState(value: string): 'running' | 'paused' {
    return value === 'paused' ? 'paused' : 'running';
  }

  _handleAnimationComplete(animationName: string) {
    const controller = this._childAnimations.get(animationName);
    if (controller && controller.getIterationCount() !== 'infinite') {
      this._activeAnimationCount = Math.max(0, this._activeAnimationCount - 1);
    }
    this._updateMultiAnimationState();
  }

  _updateMultiAnimationState() {
    let activeAnimations = 0;
    let allPaused = true;

    for (const controller of this._childAnimations.values()) {
      const state = controller.getState();
      if (state === 'running' || state === 'not-started') {
        activeAnimations++;
        allPaused = false;
      }

      if (!controller.isPaused()) {
        allPaused = false;
      }
    }

    this._activeAnimationCount = activeAnimations;
    if (activeAnimations === 0) {
      this._multiAnimationState = 'idle';
    } else if (allPaused) {
      this._multiAnimationState = 'paused';
    } else {
      this._multiAnimationState = 'active';
    }
  }

  _cleanupUnusedAnimations(activeNames: Set<string>) {
    const toRemove = [];
    for (const [name, controller] of this._childAnimations.entries()) {
      if (!activeNames.has(name)) {
        controller.stop();
        controller.dispose();
        toRemove.push(name);
      }
    }

    for (const name of toRemove) {
      this._childAnimations.delete(name);
    }
  }

  /**
   * Initialize animated values and register with style controller.
   */
  initializeAnimatedValues(
    keyframes: KeyframeDefinition,
    styleController: StyleController
  ) {
    const animatedProperties = this.collectAnimatedProperties(keyframes);

    for (const property of animatedProperties) {
      if (!this._animatedValues.has(property)) {
        const currentValue = styleController.getCurrentValue
          ? styleController.getCurrentValue(property)
          : 0;
        this._animatedValues.set(
          property,
          new ReactNative.Animated.Value(currentValue)
        );
      }

      if (styleController.registerAnimationController) {
        styleController.registerAnimationController(property, this);
      }
    }
  }

  /**
   * Get current interpolated values.
   */
  getInterpolatedValues(): { [string]: ReactNative.Animated.Value } {
    const values: { [string]: ReactNative.Animated.Value } = {};
    for (const [property, animatedValue] of this._animatedValues) {
      values[property] = animatedValue;
    }
    return values;
  }

  /**
   * Check if animation is active.
   */
  isActive(): boolean {
    return this._state === 'running';
  }

  /**
   * Collect animated properties from keyframes.
   */
  collectAnimatedProperties(keyframes: KeyframeDefinition): Array<string> {
    const properties = new Set<string>();

    for (const keyframe of Object.values(keyframes)) {
      if (typeof keyframe === 'object' && keyframe != null) {
        for (const [property] of Object.entries(keyframe)) {
          if (typeof property === 'string') {
            properties.add(property);
          }
        }
      }
    }

    return Array.from(properties);
  }

  /**
   * Start multiple animations from normalized properties.
   */
  startAnimations(
    normalizedProps: NormalizedAnimationProperties,
    styleController: StyleController
  ) {
    if (!this._isMultiAnimationManager) {
      handleAnimationError(
        new Error(
          'startAnimations can only be called on multi-animation manager instances'
        ),
        'Animation controller usage validation'
      );
      return;
    }

    try {
      if (!normalizedProps?.normalized?.animationName) {
        handleAnimationError(
          new Error(
            'Invalid animation properties provided to AnimationController'
          ),
          'Animation properties validation'
        );
        return;
      }

      const { normalized, animationCount } = normalizedProps;

      if (animationCount <= 0) {
        return;
      }

      const activeAnimationNames = new Set<string>();
      for (let i = 0; i < animationCount; i++) {
        const animationName = normalized.animationName[i];
        if (!animationName) {
          continue;
        }

        activeAnimationNames.add(animationName);

        const animationConfig = this._buildAnimationConfig(normalized, i);

        let controller = this._childAnimations.get(animationName);
        if (!controller) {
          controller = new AnimationController(animationConfig, (state) => {
            if (state === 'completed') {
              this._handleAnimationComplete(animationName);
            }
          });
          this._childAnimations.set(animationName, controller);

          if (styleController && styleController.registerAnimationController) {
            const keyframeDefinition = keyframeRegistry.resolve(animationName);
            if (keyframeDefinition) {
              const animatedProperties = controller.collectAnimatedProperties(
                keyframeDefinition.keyframes
              );
              for (const property of animatedProperties) {
                const registerFn = styleController.registerAnimationController;
                if (registerFn) {
                  registerFn(property, controller);
                }
              }
            }
          }
        }
        controller.start();
      }

      this._cleanupUnusedAnimations(activeAnimationNames);
      this._updateMultiAnimationState();
    } catch (error) {
      handleAnimationError(error, 'Animation controller start');
      this.cleanup();
    }
  }

  /**
   * Get multi-animation state.
   */
  getMultiAnimationState(): MultiAnimationState {
    return this._multiAnimationState;
  }

  /**
   * Get count of active animations.
   */
  getActiveAnimationCount(): number {
    return this._activeAnimationCount;
  }

  /**
   * Pause all child animations.
   */
  pauseAll() {
    if (!this._isMultiAnimationManager) {
      this.pause();
      return;
    }

    for (const controller of this._childAnimations.values()) {
      controller.pause();
    }
    this._updateMultiAnimationState();
  }

  /**
   * Resume all child animations.
   */
  resumeAll() {
    if (!this._isMultiAnimationManager) {
      this.resume();
      return;
    }

    for (const controller of this._childAnimations.values()) {
      controller.resume();
    }
    this._updateMultiAnimationState();
  }

  /**
   * Cleanup all animations and reset state.
   */
  cleanup(): void {
    if (this._animation) {
      this._animation.stop();
      this._animation = null;
    }

    for (const controller of this._childAnimations.values()) {
      controller.stop();
      controller.dispose();
    }
    this._childAnimations.clear();

    this._multiAnimationState = 'idle';
    this._activeAnimationCount = 0;
    this._animatedValues.clear();
    this._pausedValue = 0;
    this._isPaused = false;

    if (!this._isMultiAnimationManager) {
      this.stop();
      this.dispose();
    }
  }

  /**
   * Get composed style from all active child animations.
   */
  getComposedStyle(): ComposedStyle {
    const composedStyle: ComposedStyle = {};

    for (const controller of this._childAnimations.values()) {
      const animatedValue = controller.getAnimatedValue();
      if (animatedValue) {
        composedStyle[controller.getAnimationName()] = animatedValue;
      }
    }

    return composedStyle;
  }
}
