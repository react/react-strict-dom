/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { ReactNativeProps } from '../../types/renderer.native';
import type { StrictReactNativeMetaProps } from '../../types/renderer.native';
import type { StrictProps as StrictPropsOriginal } from '../../types/StrictProps';

import * as React from 'react';
import * as ReactNative from '../react-native';

import { ProvideCustomProperties } from './ContextCustomProperties';
import {
  ProvideInheritedStyles,
  useInheritedStyles
} from './ContextInheritedStyles';
import { flattenStyle } from './flattenStyle';
import { errorMsg } from '../../shared/logUtils';
import { useNativeProps } from './useNativeProps';
import { useStrictDOMElement } from './useStrictDOMElement';

type StrictProps = Readonly<{
  ...StrictPropsOriginal,
  children?:
    | React.Node
    | ((ReactNativeProps, StrictReactNativeMetaProps) => React.Node)
}>;

function hasElementChildren(children: unknown): boolean {
  return children != null && typeof children !== 'string';
}

export function createStrictDOMTextComponent<T, P extends StrictProps>(
  tagName: string,
  defaultProps?: P
): component(ref?: React.RefSetter<T>, ...P) {
  component Component(ref?: React.RefSetter<T>, ...props: P) {
    let NativeComponent:
      | typeof ReactNative.Text
      | typeof ReactNative.Animated.Text = ReactNative.Text;
    const elementRef = useStrictDOMElement<T>(ref, { tagName });

    const { href, label } = props;

    /**
     * Resolve global HTML and style props
     */

    const {
      customProperties,
      resolveStyleValue,
      nativeProps,
      inheritableStyle
    } = useNativeProps(defaultProps, props, {
      provideInheritableStyle:
        tagName !== 'br' ||
        // $FlowFixMe[invalid-compare]
        tagName !== 'option' ||
        hasElementChildren(props.children),
      withInheritedStyle: true,
      withTextStyle: true
    });

    const ancestorInheritedStyle = useInheritedStyles();
    const inheritedTextStyle = flattenStyle([
      ancestorInheritedStyle,
      inheritableStyle
    ]);

    // Tag-specific props

    if (tagName === 'a') {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.role ??= 'link';
      if (href != null) {
        // $FlowFixMe[react-rule-hook-mutation]
        nativeProps.onPress = function (e) {
          if (__DEV__) {
            errorMsg('<a> "href" handling is not implemented in React Native.');
          }
        };
      }
    } else if (tagName === 'br') {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.children = '\n';
    } else if (
      tagName === 'h1' ||
      tagName === 'h2' ||
      tagName === 'h3' ||
      tagName === 'h4' ||
      tagName === 'h5' ||
      tagName === 'h6'
    ) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.role ??= 'heading';
    } else if (tagName === 'option') {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.children = label;
    }

    // Component-specific props

    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.ref = elementRef;

    // Workaround: Android doesn't support ellipsis truncation if Text is selectable
    // See #136
    const disableUserSelect =
      ReactNative.Platform.OS === 'android' &&
      nativeProps.numberOfLines != null &&
      nativeProps.style.userSelect !== 'none';

    // $FlowExpectedError[unsafe-object-assign]
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.style = Object.assign(
      nativeProps.style,
      disableUserSelect ? { userSelect: 'none' } : null
    );

    // Native components historically clip text. Opt into web-style default of
    // visible overflow by default
    if (nativeProps.style?.overflow == null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style = nativeProps.style ?? {};
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.overflow = 'visible';
    }

    // Use Animated components if necessary
    if (nativeProps.animated === true) {
      NativeComponent = ReactNative.Animated.Text;
    }

    /**
     * Construct tree
     */

    let element: React.Node =
      typeof props.children === 'function' ? (
        props.children(nativeProps, { inheritedTextStyle, resolveStyleValue })
      ) : (
        // $FlowFixMe[incompatible-type]
        <NativeComponent {...nativeProps} />
      );

    if (
      hasElementChildren(nativeProps.children) ||
      typeof props.children === 'function'
    ) {
      if (inheritableStyle != null) {
        element = (
          <ProvideInheritedStyles children={element} value={inheritableStyle} />
        );
      }
      if (customProperties != null) {
        element = (
          <ProvideCustomProperties
            children={element}
            value={customProperties}
          />
        );
      }
    }

    return element;
  }

  // eslint-disable-next-line no-unreachable
  Component.displayName = `html.${tagName}`;
  return Component;
}
