/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { EventSubscription } from 'react-native';

import * as ReactNative from '../react-native';

type Listener = () => void;

const listeners: Set<Listener> = new Set();

let prefersReducedMotion = false;
let isInitialized = false;
let reduceMotionChangedSubscription: ?EventSubscription = null;

function setPrefersReducedMotion(nextValue: boolean) {
  if (prefersReducedMotion !== nextValue) {
    prefersReducedMotion = nextValue;

    Array.from(listeners).forEach((listener) => {
      listener();
    });
  }
}

function ensureInitialized() {
  if (isInitialized) {
    return;
  }

  isInitialized = true;

  if (reduceMotionChangedSubscription == null) {
    reduceMotionChangedSubscription =
      ReactNative.AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (isReduceMotionEnabled) => {
          setPrefersReducedMotion(isReduceMotionEnabled);
        }
      );
  }

  ReactNative.AccessibilityInfo.isReduceMotionEnabled().then(
    (isReduceMotionEnabled) => {
      setPrefersReducedMotion(isReduceMotionEnabled);
    },
    () => {
      // Silently ignore if the native module is not available (e.g., on VR)
    }
  );
}

export function getPrefersReducedMotionSnapshot(): boolean {
  return prefersReducedMotion;
}

export function subscribeToPrefersReducedMotion(
  listener: Listener
): () => void {
  listeners.add(listener);
  ensureInitialized();

  return () => {
    listeners.delete(listener);
  };
}
