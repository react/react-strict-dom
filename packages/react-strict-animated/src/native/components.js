/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

/* eslint-disable no-unreachable */

import type { AnimatedStyleValue } from '../shared/SharedAnimatedTypes';
import type { ImageProps, Text, View } from 'react-native';
import type { html } from 'react-strict-dom';

import * as React from 'react';
import { Animated } from 'react-native';

import { compat, css, useViewportScale_DO_NOT_USE } from 'react-strict-dom';

const styles = css.create({
  defaults: {
    boxSizing: 'content-box',
    position: 'static'
  }
});

function useViewportScaledAnimatedStyle(
  animatedStyle: ?AnimatedStyleValue<Animated.Node>
): ?AnimatedStyleValue<Animated.Node> {
  const { scale: viewportScale } = useViewportScale_DO_NOT_USE();

  return React.useMemo(() => {
    if (animatedStyle == null || viewportScale === 1) {
      return animatedStyle;
    }

    const transforms = animatedStyle.transform;
    if (transforms == null) {
      return animatedStyle;
    }

    let didScaleTransforms = false;
    const scaledTransforms = transforms.map((transform) => {
      if (transform?.translateX != null) {
        const translateX = transform.translateX;
        didScaleTransforms = true;
        if (typeof translateX === 'string') {
          return transform;
        }
        return {
          translateX:
            typeof translateX === 'number'
              ? translateX * viewportScale
              : Animated.multiply(translateX, viewportScale)
        };
      }
      if (transform?.translateY != null) {
        const translateY = transform.translateY;
        didScaleTransforms = true;
        if (typeof translateY === 'string') {
          return transform;
        }
        return {
          translateY:
            typeof translateY === 'number'
              ? translateY * viewportScale
              : Animated.multiply(translateY, viewportScale)
        };
      }
      return transform;
    });

    return didScaleTransforms === true
      ? { ...animatedStyle, transform: scaledTransforms }
      : animatedStyle;
  }, [animatedStyle, viewportScale]);
}

export component AnimatedDiv(
  animatedStyle?: AnimatedStyleValue<Animated.Node>,
  children?: React.Node,
  ref?: React.RefSetter<React.RefOf<html.div>>,
  ...htmlProps: Omit<React.PropsOf<html.div>, 'children' | 'ref'>
) {
  const scaledAnimatedStyle = useViewportScaledAnimatedStyle(animatedStyle);

  return (
    // $FlowFixMe[incompatible-type]
    <compat.native
      {...htmlProps}
      as="div"
      ref={ref}
      // $FlowFixMe[incompatible-type]
      style={[styles.defaults, htmlProps.style]}
    >
      {(nativeProps: React.PropsOf<View>) => {
        return (
          // $FlowFixMe[invalid-component-prop]
          <Animated.View
            {...nativeProps}
            style={[nativeProps.style, scaledAnimatedStyle]}
          >
            {nativeProps.children}
          </Animated.View>
        );
      }}
    </compat.native>
  );
}

export component AnimatedSpan(
  animatedStyle: AnimatedStyleValue<Animated.Node>,
  children?: React.Node,
  ref?: React.RefSetter<React.RefOf<html.span>>,
  ...htmlProps: Omit<React.PropsOf<html.span>, 'children' | 'ref'>
) {
  const scaledAnimatedStyle = useViewportScaledAnimatedStyle(animatedStyle);

  return (
    // $FlowFixMe[incompatible-type]
    <compat.native
      {...htmlProps}
      as="span"
      ref={ref}
      // $FlowFixMe[incompatible-type]
      style={[styles.defaults, htmlProps.style]}
    >
      {(nativeProps: React.PropsOf<Text>) => {
        return (
          // $FlowFixMe[incompatible-type]
          // $FlowFixMe[invalid-component-prop]
          <Animated.Text
            {...nativeProps}
            style={[nativeProps.style, scaledAnimatedStyle]}
          >
            {children}
          </Animated.Text>
        );
      }}
    </compat.native>
  );
}

export component AnimatedImg(
  animatedStyle: AnimatedStyleValue<Animated.Node>,
  ref?: React.RefSetter<React.RefOf<html.img>>,
  ...htmlProps: Omit<React.PropsOf<html.img>, 'ref'>
) {
  const scaledAnimatedStyle = useViewportScaledAnimatedStyle(animatedStyle);

  return (
    // $FlowFixMe[incompatible-type]
    <compat.native
      {...htmlProps}
      as="img"
      ref={ref}
      // $FlowFixMe[incompatible-type]
      style={[styles.defaults, htmlProps.style]}
    >
      {(nativeProps: ImageProps) => {
        return (
          <Animated.Image
            {...nativeProps}
            style={[nativeProps.style, scaledAnimatedStyle]}
          />
        );
      }}
    </compat.native>
  );
}
