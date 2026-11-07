/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

let mockAppearanceListener;
let mockColorScheme;
let mockDimensions;
let mockDimensionsListener;
let mockPrefersReducedMotion;
let mockReducedMotionListener;

jest.mock('../../react-native', () => ({
  AccessibilityInfo: {
    addEventListener: jest.fn((event, listener) => {
      mockReducedMotionListener = listener;
      return { remove: jest.fn() };
    }),
    isReduceMotionEnabled: jest.fn(() =>
      Promise.resolve(mockPrefersReducedMotion)
    )
  },
  Appearance: {
    addChangeListener: jest.fn((listener) => {
      mockAppearanceListener = listener;
      return { remove: jest.fn() };
    }),
    getColorScheme: jest.fn(() => mockColorScheme)
  },
  Dimensions: {
    addEventListener: jest.fn((event, listener) => {
      mockDimensionsListener = listener;
      return { remove: jest.fn() };
    }),
    get: jest.fn(() => mockDimensions)
  }
}));

describe('StyleEnvironmentStore', () => {
  let ReactNative;
  let store;

  beforeEach(() => {
    jest.resetModules();
    mockAppearanceListener = null;
    mockColorScheme = 'light';
    mockDimensions = { fontScale: 1, height: 1000, width: 2000 };
    mockDimensionsListener = null;
    mockPrefersReducedMotion = false;
    mockReducedMotionListener = null;
    ReactNative = require('../../react-native');
    store = require('../StyleEnvironmentStore');
  });

  test('returns a stable snapshot', () => {
    const first = store.getStyleEnvironmentSnapshot();
    const second = store.getStyleEnvironmentSnapshot();

    expect(second).toBe(first);
    expect(ReactNative.Dimensions.get).toHaveBeenCalledTimes(1);
    expect(ReactNative.Appearance.getColorScheme).toHaveBeenCalledTimes(1);
  });

  test('subscribes to each environment source once', () => {
    const unsubscribeFirst = store.subscribeToStyleEnvironment(jest.fn());
    const unsubscribeSecond = store.subscribeToStyleEnvironment(jest.fn());

    expect(ReactNative.Dimensions.addEventListener).toHaveBeenCalledTimes(1);
    expect(ReactNative.Appearance.addChangeListener).toHaveBeenCalledTimes(1);
    expect(ReactNative.AccessibilityInfo.addEventListener).toHaveBeenCalledTimes(
      1
    );
    expect(
      ReactNative.AccessibilityInfo.isReduceMotionEnabled
    ).toHaveBeenCalledTimes(1);

    unsubscribeFirst();
    unsubscribeSecond();
  });

  test('updates dimensions only when values change', () => {
    const listener = jest.fn();
    store.subscribeToStyleEnvironment(listener);
    const first = store.getStyleEnvironmentSnapshot();

    mockDimensionsListener();
    expect(listener).not.toHaveBeenCalled();
    expect(store.getStyleEnvironmentSnapshot()).toBe(first);

    mockDimensions = { fontScale: 2, height: 500, width: 800 };
    mockDimensionsListener();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getStyleEnvironmentSnapshot()).toEqual({
      colorScheme: 'light',
      fontScale: 2,
      height: 500,
      prefersReducedMotion: false,
      width: 800
    });
  });

  test('normalizes and updates the color scheme', () => {
    const listener = jest.fn();
    store.subscribeToStyleEnvironment(listener);

    mockColorScheme = 'dark';
    mockAppearanceListener();
    expect(store.getStyleEnvironmentSnapshot().colorScheme).toBe('dark');

    mockColorScheme = null;
    mockAppearanceListener();
    expect(store.getStyleEnvironmentSnapshot().colorScheme).toBe('light');
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('updates reduced motion', async () => {
    const listener = jest.fn();
    store.subscribeToStyleEnvironment(listener);
    await Promise.resolve();

    mockReducedMotionListener(true);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getStyleEnvironmentSnapshot().prefersReducedMotion).toBe(true);
  });

  test('refreshes after subscribing', () => {
    const first = store.getStyleEnvironmentSnapshot();
    mockDimensions = { fontScale: 1, height: 500, width: 800 };

    store.subscribeToStyleEnvironment(jest.fn());

    const second = store.getStyleEnvironmentSnapshot();
    expect(second).not.toBe(first);
    expect(second).toMatchObject({ height: 500, width: 800 });
  });
});
