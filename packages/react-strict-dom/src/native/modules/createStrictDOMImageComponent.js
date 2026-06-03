/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { StrictReactDOMImageProps } from '../../types/StrictReactDOMImageProps';

import * as React from 'react';
import * as ReactNative from '../react-native';

import { useNativeProps } from './useNativeProps';
import { useStrictDOMElement } from './useStrictDOMElement';
import * as css from '../css';

export function createStrictDOMImageComponent<
  P extends StrictReactDOMImageProps,
  T
>(
  tagName: string,
  _defaultProps?: P
): component(ref?: React.RefSetter<T>, ...P) {
  component Component(ref: React.RefSetter<T>, ...props: P) {
    let NativeComponent:
      | typeof ReactNative.Image
      | typeof ReactNative.Animated.Image = ReactNative.Image;
    const elementRef = useStrictDOMElement<T>(ref, { tagName });

    const {
      alt,
      crossOrigin,
      height,
      onError,
      onLoad,
      referrerPolicy,
      src,
      srcSet,
      width
    } = props;

    /**
     * Resolve global HTML and style props
     */

    const defaultProps = {
      style: [
        _defaultProps?.style,
        height != null && width != null && styles.aspectRatio(width, height)
      ]
    };

    const { nativeProps } = useNativeProps(defaultProps, props, {
      provideInheritableStyle: false,
      withInheritedStyle: false,
      withTextStyle: false
    });

    // Tag-specific props

    if (alt != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.alt = alt;
    }
    if (crossOrigin != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.crossOrigin = crossOrigin;
    }
    if (height != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.height = height;
    }
    if (onError != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.onError = function () {
        onError({
          type: 'error'
        });
      };
    }
    if (onLoad != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.onLoad = function (e) {
        const { source } = e.nativeEvent;
        onLoad({
          target: {
            naturalHeight: source?.height,
            naturalWidth: source?.width
          },
          type: 'load'
        });
      };
    }
    if (referrerPolicy != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.referrerPolicy = referrerPolicy;
    }
    if (src != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.src = src;
    }
    if (srcSet != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.srcSet = srcSet;
    }
    if (width != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.width = width;
    }

    // Component-specific props

    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.ref = elementRef;

    // Use Animated components if necessary
    if (nativeProps.animated === true) {
      NativeComponent = ReactNative.Animated.Image;
    }

    const element: React.Node =
      typeof props.children === 'function' ? (
        props.children(nativeProps)
      ) : (
        // strict-dom's wide ReactNativeProps spreads onto RN 0.83's exact
        // ImageProps; harmless extras are ignored at runtime.
        // $FlowFixMe[incompatible-type]
        // $FlowFixMe[incompatible-use]
        <NativeComponent {...nativeProps} />
      );

    return element;
  }

  // eslint-disable-next-line no-unreachable
  Component.displayName = `html.${tagName}`;
  return Component;
}

const styles = css.create({
  aspectRatio: (width: number, height: number) => ({
    aspectRatio: width / height,
    width,
    height
  })
});
