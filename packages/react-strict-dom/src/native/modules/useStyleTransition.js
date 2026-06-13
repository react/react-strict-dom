/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type {
  CompositeAnimation,
  ReactNativeStyle,
  ReactNativeStyleValue
} from '../../types/renderer.native';

import * as React from 'react';
import * as ReactNative from '../react-native';

import { errorMsg, warnMsg } from '../../shared/logUtils';
import {
  isNumber,
  isString,
  canUseNativeDriver,
  getEasingFunction
} from './sharedAnimationUtils';
import {
  transformsHaveSameLengthTypesAndOrder,
  transformListsAreEqual,
  createBinaryAnimatedTransform
} from './sharedInterpolation';

type AnimatedStyle = {
  [string]: ?ReactNativeStyleValue | ReadonlyArray<unknown>
};

type TransitionMetadata = Readonly<{
  delay: number,
  duration: number,
  timingFunction: string | null,
  shouldUseNativeDriver: boolean
}>;

const INPUT_RANGE: ReadonlyArray<number> = [0, 1];

function getTransitionProperties(property: unknown): ?(string[]) {
  if (property === 'all') {
    return ['opacity', 'transform'];
  }
  if (typeof property === 'string') {
    return property.split(',').map((p) => p.trim());
  }
  return null;
}

// Transform utility functions are imported from sharedInterpolation.

function transitionStyleHasChanged(
  next: ReactNativeStyle | void,
  prev: ReactNativeStyle | void
): boolean {
  if (next === undefined) {
    return false;
  }

  if (typeof prev !== typeof next) {
    return true;
  }

  if (prev !== undefined && next !== undefined) {
    for (const propKey in next) {
      const prevValue = prev[propKey];
      const nextValue = next[propKey];

      // handle type differences
      if (typeof prevValue !== typeof nextValue) {
        return true;
      }

      // handle transform value differences
      else if (
        Array.isArray(prevValue) &&
        Array.isArray(nextValue) &&
        !transformListsAreEqual(prevValue, nextValue)
      ) {
        return true;
      }

      // handle literal value differences
      else if (prevValue !== nextValue) {
        return true;
      }
    }
  }
  return false;
}

function getAnimation(
  animatedValue: ReactNative.Animated.Value,
  delay: number,
  duration: number,
  timingFunction: string | null,
  shouldUseNativeDriver: boolean
): CompositeAnimation {
  // Based on https://lists.w3.org/Archives/Public/www-style/2016Jun/0181.html
  // spring(mass, stiffness, damping, initialVelocity)
  if (timingFunction != null && timingFunction.trim().startsWith('spring(')) {
    const chunk = timingFunction.split('spring(')[1];

    const closingParenIndex = chunk.indexOf(')');
    if (closingParenIndex === -1) {
      errorMsg(
        `spring() timing function of "${timingFunction}" is missing closing parenthesis.`
      );
      return ReactNative.Animated.timing(animatedValue, {
        delay,
        duration,
        easing: getEasingFunction(null),
        toValue: 1,
        useNativeDriver: shouldUseNativeDriver
      });
    }

    const str = chunk.split(')')[0];
    let [mass = 1, stiffness = 100, damping = 10, initialVelocity = 0] =
      str === '' ? [] : str.split(',').map((point) => parseFloat(point.trim()));

    if (mass <= 0) {
      errorMsg(
        `spring() timing function "mass" must be greater than 0. Received ${mass}. Defaulting to 1.`
      );
      mass = 1;
    }
    if (stiffness <= 0) {
      errorMsg(
        `spring() timing function "stiffness" must be greater than 0. Received ${stiffness}. Defaulting to 100.`
      );
      stiffness = 100;
    }
    if (damping < 0) {
      errorMsg(
        `spring() timing function "damping" must be greater than or equal to 0. Received ${damping}. Defaulting to 10.`
      );
      damping = 10;
    }
    if (initialVelocity == null) {
      initialVelocity = 0;
    }

    return ReactNative.Animated.spring(animatedValue, {
      delay,
      damping,
      mass,
      stiffness,
      toValue: 1,
      useNativeDriver: shouldUseNativeDriver,
      velocity: initialVelocity
    });
  }

  return ReactNative.Animated.timing(animatedValue, {
    delay,
    duration,
    easing: getEasingFunction(timingFunction),
    toValue: 1,
    useNativeDriver: shouldUseNativeDriver
  });
}

export function useStyleTransition(style: ReactNativeStyle): ReactNativeStyle {
  const {
    transitionDelay: _delay,
    transitionDuration: _duration,
    transitionProperty: _transitionProperty,
    transitionTimingFunction: _timingFunction
  } = style;

  const transitionDelay = isNumber(_delay) ? _delay : 0;
  const transitionDuration = isNumber(_duration) ? _duration : 16;
  const transitionTimingFunction = isString(_timingFunction)
    ? _timingFunction
    : null;

  const transitionStyle = getTransitionProperties(
    _transitionProperty
  )?.reduce<ReactNativeStyle>((output, property) => {
    const value = style[property];
    if (isString(value) || isNumber(value) || Array.isArray(value)) {
      output[property] = value;
    }
    return output;
  }, {});

  const [currentStyle, setCurrentStyle] =
    React.useState<ReactNativeStyle | void>(style);
  const [previousStyle, setPreviousStyle] =
    React.useState<ReactNativeStyle | void>(undefined);
  const [animatedValue, setAnimatedValue] =
    React.useState<ReactNative.Animated.Value | void>(undefined);

  // This ref is utilized as a performance optimization so that the effect that contains the
  // animation trigger only is called when the animated value's identity changes. As far as the effect
  // is concerned it just needs the most up to date version of these transition properties;
  const transitionMetadataRef = React.useRef<TransitionMetadata>({
    delay: transitionDelay,
    duration: transitionDuration,
    timingFunction: transitionTimingFunction,
    shouldUseNativeDriver: canUseNativeDriver(transitionStyle)
  });
  // effect to sync the transition metadata
  React.useEffect(() => {
    transitionMetadataRef.current = {
      delay: transitionDelay,
      duration: transitionDuration,
      timingFunction: transitionTimingFunction,
      shouldUseNativeDriver: canUseNativeDriver(transitionStyle)
    };
  }, [
    transitionDelay,
    transitionDuration,
    transitionStyle,
    transitionTimingFunction
  ]);

  // effect to trigger a transition
  // REMEMBER: it is super important that this effect's dependency array **only** contains the animated value
  React.useEffect(() => {
    if (animatedValue !== undefined) {
      const { delay, duration, timingFunction, shouldUseNativeDriver } =
        transitionMetadataRef.current;

      const animation = getAnimation(
        animatedValue,
        delay,
        duration,
        timingFunction,
        shouldUseNativeDriver
      );
      animation.start();

      return () => {
        animation.stop();
      };
    }
  }, [animatedValue]);

  if (
    _delay == null &&
    _duration == null &&
    _transitionProperty == null &&
    _timingFunction == null
  ) {
    // Avoid further calculations if we don't have anything to animate
    return style;
  }

  if (transitionStyleHasChanged(transitionStyle, currentStyle)) {
    setCurrentStyle(style);
    setPreviousStyle(currentStyle);
    setAnimatedValue(new ReactNative.Animated.Value(0));
    // This commit will be thrown away due to the above state setters so we can bail out early
    return style;
  }

  if (transitionStyle === undefined) {
    return style;
  }

  const outputAnimatedStyle: AnimatedStyle = Object.entries(
    transitionStyle
  ).reduce<AnimatedStyle>((animatedStyle, [property, value]) => {
    const prevValue = previousStyle?.[property] ?? value;

    if (animatedValue === undefined || prevValue === value) {
      animatedStyle[property] = value;
    } else if (typeof value === 'number') {
      animatedStyle[property] = animatedValue.interpolate({
        inputRange: INPUT_RANGE,
        outputRange: [+prevValue, value]
      });
      return animatedStyle;
    } else if (typeof value === 'string') {
      animatedStyle[property] = animatedValue.interpolate({
        inputRange: INPUT_RANGE,
        outputRange: [String(prevValue), value]
      });
      return animatedStyle;
    } else if (property === 'transform' && Array.isArray(value)) {
      const transforms = value;
      const prevTransforms = prevValue;

      // Check that there are the same number of transforms
      if (
        !Array.isArray(prevTransforms) ||
        transforms.length !== prevTransforms.length
      ) {
        if (__DEV__) {
          warnMsg(
            'The number or types of transforms must be the same before and after the transition. The transition will not animate.'
          );
        }
        animatedStyle[property] = transforms;
        return animatedStyle;
      }

      // TODO: Figure out how to animate matrix transforms
      for (const transform of transforms) {
        if (transform.matrix != null) {
          if (__DEV__) {
            warnMsg(
              'Matrix transforms cannot be animated. The transition will not animate.'
            );
          }
          animatedStyle[property] = transforms;
          return animatedStyle;
        }
      }

      // Check that the transforms have the same types in the same order
      if (!transformsHaveSameLengthTypesAndOrder(transforms, prevTransforms)) {
        if (__DEV__) {
          warnMsg(
            'The types of transforms must be the same before and after the transition. The transition will not animate.\n' +
              `Before: ${JSON.stringify(transforms)}\n` +
              `After: ${JSON.stringify(prevTransforms)}`
          );
        }
        animatedStyle[property] = transforms;
        return animatedStyle;
      }

      const animatedTransforms = createBinaryAnimatedTransform(
        animatedValue,
        prevTransforms,
        transforms
      );
      animatedStyle[property] = animatedTransforms;
      return animatedStyle;
    }

    return animatedStyle;
  }, {});

  // Only create styleWithAnimations if it's needed, after all the
  // cases where we don't create animated styles at all.
  const {
    /* eslint-disable no-unused-vars */
    transitionDelay: __delay,
    transitionDuration: __duration,
    transitionProperty: __transitionProperty,
    transitionTimingFunction: __timingFunction,
    /* eslint-enable no-unused-vars */
    ...styleWithAnimations
  } = style;

  // $FlowExpectedError[unsafe-object-assign]
  Object.assign(styleWithAnimations, outputAnimatedStyle);

  return styleWithAnimations;
}
