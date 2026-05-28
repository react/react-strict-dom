/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { ReactNativeProps } from '../../types/renderer.native';
import type { StrictProps as StrictPropsOriginal } from '../../types/StrictProps';

import * as React from 'react';
import * as ReactNative from '../react-native';

import { ProvideCustomProperties } from './ContextCustomProperties';
import { ProvideDisplayInside, useDisplayInside } from './ContextDisplayInside';
import { ProvideInheritedStyles } from './ContextInheritedStyles';
import { TextString } from './TextString';
import { errorMsg } from '../../shared/logUtils';
import { useNativeProps } from './useNativeProps';
import { useStrictDOMElement } from './useStrictDOMElement';

type StrictProps = Readonly<{
  ...StrictPropsOriginal,
  children?: React.Node | ((ReactNativeProps) => React.Node)
}>;

const AnimatedPressable = ReactNative.Animated.createAnimatedComponent(
  ReactNative.Pressable
);

export function createStrictDOMComponent<T, P extends StrictProps>(
  tagName: string,
  defaultProps?: P
): component(ref?: React.RefSetter<T>, ...P) {
  const provideInheritableStyle =
    // $FlowFixMe[invalid-compare]
    tagName !== 'br' || tagName !== 'hr' || tagName !== 'option';

  component Component(ref: React.RefSetter<T>, ...props: P) {
    let NativeComponent:
      | typeof ReactNative.Pressable
      | typeof ReactNative.ViewNativeComponent
      | typeof ReactNative.Animated.View
      | typeof AnimatedPressable =
      tagName === 'button'
        ? ReactNative.Pressable
        : ReactNative.ViewNativeComponent;
    const elementRef = useStrictDOMElement<T>(ref, { tagName });
    const hasTextAncestor = React.useContext(ReactNative.TextAncestorContext);

    /**
     * Resolve global HTML and style props
     */

    const { customProperties, nativeProps, inheritableStyle } = useNativeProps(
      defaultProps,
      props,
      {
        provideInheritableStyle,
        withInheritedStyle: false,
        withTextStyle: false
      }
    );

    if (
      nativeProps.onPress != null &&
      NativeComponent === ReactNative.ViewNativeComponent
    ) {
      NativeComponent = ReactNative.Pressable;
    }

    // Tag-specific props

    if (tagName === 'button') {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.role ??= 'button';
    } else if (tagName === 'header') {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.role ??= 'header';
    } else if (tagName === 'li') {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.role ??= 'listitem';
    } else if (tagName === 'ol' || tagName === 'ul') {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.role ??= 'list';
    }

    // Component-specific props

    if (NativeComponent === ReactNative.Pressable) {
      if (props.disabled === true) {
        // $FlowFixMe[react-rule-hook-mutation]
        nativeProps.disabled = true;
        // $FlowFixMe[react-rule-hook-mutation]
        nativeProps.focusable = false;
      }
    }

    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.ref = elementRef;

    // Workaround: React Native doesn't support raw text children of View
    // Sometimes we can auto-fix this
    if (typeof nativeProps.children === 'string') {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.children = <TextString children={nativeProps.children} />;
    }

    // Polyfill for default of "display:block"
    // which implies "displayInside:flow"
    let nextDisplayInsideValue: 'flow' | 'flex' = 'flow';
    const displayInsideValue = useDisplayInside();
    const displayValue = nativeProps.style.display;

    if (__DEV__) {
      const nativeStyle = nativeProps.style;
      if (displayInsideValue !== 'flex') {
        // Error message if the element is not a flex child but tries to use flex
        ['flex', 'flexBasis', 'flexGrow', 'flexShrink'].forEach((styleProp) => {
          const value = nativeStyle[styleProp];
          if (value != null) {
            errorMsg(
              `"display:flex" is required on the parent for "${styleProp}" to have an effect.`
            );
          }
        });
        // Error message if the element is not a flex child but tries to use
        // zIndex without non-static position
        if (nativeStyle.zIndex != null && nativeStyle.position === 'static') {
          errorMsg(
            '"position:static" prevents "zIndex" from having an effect. Try setting "position" to something other than "static".'
          );
        }
      }
    }

    if (displayValue === 'flex') {
      nextDisplayInsideValue = 'flex';
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.alignContent ??= 'stretch';
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.alignItems ??= 'stretch';
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.flexBasis ??= 'auto';
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.flexDirection ??= 'row';
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.flexShrink ??= 1;
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.flexWrap ??= 'nowrap';
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.justifyContent ??= 'flex-start';
    } else if (displayValue === 'block' && displayInsideValue === 'flow') {
      // Force the block emulation styles
      nextDisplayInsideValue = 'flow';
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.alignItems = 'stretch';
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.display = 'flex';
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.flexBasis = 'auto';
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.flexDirection = 'column';
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.flexShrink = 0;
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.flexWrap = 'nowrap';
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.justifyContent = 'flex-start';
    }

    if (displayInsideValue === 'flex') {
      // flex child should not shrink by default
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.style.flexShrink ??= 1;
    }

    // Use Animated components if necessary
    if (nativeProps.animated === true) {
      if (NativeComponent === ReactNative.ViewNativeComponent) {
        NativeComponent = ReactNative.Animated.View;
      }
      if (NativeComponent === ReactNative.Pressable) {
        NativeComponent = AnimatedPressable;
      }
    }

    /**
     * Construct tree
     */

    let element: React.Node =
      typeof props.children === 'function' ? (
        props.children(nativeProps)
      ) : (
        // $FlowFixMe[incompatible-type]
        <NativeComponent {...nativeProps} />
      );

    // Enable W3C layout support
    if (props['data-layoutconformance'] === 'strict') {
      element = (
        <ReactNative.LayoutConformance children={element} mode="strict" />
      );
    }

    if (
      (nativeProps.children != null &&
        typeof nativeProps.children !== 'string') ||
      typeof props.children === 'function'
    ) {
      if (inheritableStyle != null) {
        element = (
          <ProvideInheritedStyles children={element} value={inheritableStyle} />
        );
      }
      if (nextDisplayInsideValue !== displayInsideValue) {
        element = (
          <ProvideDisplayInside
            children={element}
            value={nextDisplayInsideValue}
          />
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

    if (hasTextAncestor) {
      return (
        <ReactNative.TextAncestorContext.Provider value={false}>
          {element}
        </ReactNative.TextAncestorContext.Provider>
      );
    }

    return element;
  }

  // eslint-disable-next-line no-unreachable
  Component.displayName = `html.${tagName}`;
  return Component;
}
