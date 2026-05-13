/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const AccessibilityInfo = {
  addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  isReduceMotionEnabled: jest.fn().mockReturnValue(Promise.resolve(false))
};

export const Animated = {
  createAnimatedComponent(Component) {
    return `Animated.${Component}`;
  },
  Image: 'Animated.Image',
  View: 'Animated.View',
  Text: 'Animated.Text',
  Value: jest.fn(() => {
    return {
      interpolate: jest.fn().mockImplementation((value) => value)
    };
  }),
  timing: jest.fn(() => {
    return {
      start: jest.fn((callback) => {
        callback && callback();
      }),
      stop: jest.fn()
    };
  }),
  delay: jest.fn(),
  sequence: jest.fn(() => {
    return {
      start: jest.fn((callback) => {
        callback && callback();
      }),
      stop: jest.fn()
    };
  }),
  spring: jest.fn(() => {
    return {
      start: jest.fn((callback) => {
        callback && callback();
      }),
      stop: jest.fn()
    };
  })
};

export const Easing = {
  linear: jest.fn(),
  ease: jest.fn(),
  bezier: jest.fn(),
  in: jest.fn(),
  out: jest.fn(),
  inOut: jest.fn()
};

export const Image = 'Image';

export const Linking = {
  openURL: jest.fn()
};

export const Platform = {
  get constants() {
    return {
      reactNativeVersion: {
        major: 1000,
        minor: 0,
        patch: 0,
        prerelease: undefined
      }
    };
  },
  OS: 'android',
  select(obj) {
    return obj.android || obj.ios || obj.native || obj.default;
  }
};

export const PixelRatio = {
  getFontScale: jest.fn().mockReturnValue(1)
};

export const Pressable = 'Pressable';

export const StyleSheet = {
  create(styles) {
    return styles;
  },
  flatten(style) {
    if (!style) {
      return undefined;
    }
    if (!Array.isArray(style)) {
      return style;
    }
    const result = {};
    for (let i = 0, styleLength = style.length; i < styleLength; ++i) {
      const computedStyle = this.flatten(style[i]);
      if (computedStyle) {
        for (const key in computedStyle) {
          const value = computedStyle[key];
          result[key] = value;
        }
      }
    }
    return result;
  }
};

export const TextInput = 'TextInput';

export const Text = 'Text';

export const View = 'View';

export const experimental_LayoutConformance = 'LayoutConformance';

export const unstable_TextAncestorContext = 'TextAncestorContext';

export const useColorScheme = jest.fn().mockReturnValue('light');

export const useWindowDimensions = jest
  .fn()
  .mockReturnValue({ fontScale: 1, height: 1000, scale: 1, width: 2000 });
