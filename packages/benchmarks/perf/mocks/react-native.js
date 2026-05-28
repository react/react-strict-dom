/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * React Native mock for Node.js benchmarks
 */

export const AccessibilityInfo = {
  addEventListener: () => ({
    remove: () => {}
  }),
  isReduceMotionEnabled: () => Promise.resolve(false)
};

export const Animated = {
  createAnimatedComponent(c) {
    return c;
  },
  Image: 'Animated.Image',
  View: 'Animated.View',
  Text: 'Animated.Text',
  Value: () => {
    return {
      interpolate: (value) => value
    };
  },
  timing: () => {
    return {
      start: () => {}
    };
  },
  delay: () => {},
  sequence: () => {
    return {
      start: (callback) => {
        callback();
      },
      stop: () => {}
    };
  }
};

export const Easing = {
  linear: () => {},
  ease: () => {},
  bezier: () => {},
  in: () => {},
  out: () => {},
  inOut: () => {}
};

export const Image = 'Image';

export const Linking = {
  openURL: () => {}
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
  getFontScale: () => 1
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

export const unstable_TextAncestorContext = 'TextAncestorContext';

export const View = 'View';

export const experimental_LayoutConformance = 'LayoutConformance';

export const useColorScheme = () => 'light';

export const useWindowDimensions = () => ({
  fontScale: 1,
  height: 1000,
  scale: 1,
  width: 2000
});
