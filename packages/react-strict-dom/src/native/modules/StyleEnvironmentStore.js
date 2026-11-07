/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import * as ReactNative from '../react-native';

type Listener = () => void;

export type StyleEnvironment = {
  +fontScale: number,
  +height: number,
  +width: number,
  +colorScheme: 'light' | 'dark',
  +prefersReducedMotion: boolean
};

const listeners: Set<Listener> = new Set();

let snapshot: ?StyleEnvironment = null;
let isInitialized = false;
let prefersReducedMotion = false;

function computeSnapshot(): StyleEnvironment {
  const { fontScale, height, width } = ReactNative.Dimensions.get('window');
  const colorScheme = ReactNative.Appearance.getColorScheme() ?? 'light';
  return {
    fontScale,
    height,
    width,
    colorScheme: colorScheme === 'dark' ? 'dark' : 'light',
    prefersReducedMotion
  };
}

function refreshSnapshot(): boolean {
  const next = computeSnapshot();
  const prev = snapshot;
  if (
    prev == null ||
    prev.fontScale !== next.fontScale ||
    prev.height !== next.height ||
    prev.width !== next.width ||
    prev.colorScheme !== next.colorScheme ||
    prev.prefersReducedMotion !== next.prefersReducedMotion
  ) {
    snapshot = next;
    return true;
  }
  return false;
}

function updateSnapshot() {
  if (refreshSnapshot()) {
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
  ReactNative.Dimensions.addEventListener('change', updateSnapshot);
  ReactNative.Appearance.addChangeListener(updateSnapshot);
  ReactNative.AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    (isReduceMotionEnabled) => {
      prefersReducedMotion = isReduceMotionEnabled;
      updateSnapshot();
    }
  );
  ReactNative.AccessibilityInfo.isReduceMotionEnabled().then(
    (isReduceMotionEnabled) => {
      prefersReducedMotion = isReduceMotionEnabled;
      updateSnapshot();
    },
    () => {
      // Silently ignore if the native module is not available (e.g., on VR)
    }
  );
}

export function getStyleEnvironmentSnapshot(): StyleEnvironment {
  if (snapshot == null) {
    snapshot = computeSnapshot();
  }
  return snapshot;
}

export function subscribeToStyleEnvironment(listener: Listener): () => void {
  listeners.add(listener);
  ensureInitialized();
  refreshSnapshot();
  return () => {
    listeners.delete(listener);
  };
}
