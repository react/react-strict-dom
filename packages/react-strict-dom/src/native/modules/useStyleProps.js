/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { CustomProperties, Style } from '../../types/styles';
import type {
  ReactNativeProps,
  ReactNativeStyle,
  ReactNativeStyleValue
} from '../../types/renderer.native';

import * as css from '../css';

import { useInheritedStyles } from './ContextInheritedStyles';
import { usePseudoStates } from './usePseudoStates';
import { useStyleEnvironment } from './useStyleEnvironment';
import { useStyleTransition } from './useStyleTransition';
import { useViewportScale } from './ContextViewportScale';

const inheritedProperties: ReadonlyArray<string> = [
  'color',
  'cursor',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'letterSpacing',
  'lineHeight',
  'textAlign',
  'textDecorationColor',
  'textDecorationLine',
  'textDecorationStyle',
  'textIndent',
  'textTransform',
  'whiteSpace',
  'writingDirection'
];

type EventHandlerName =
  | 'onBlur'
  | 'onFocus'
  | 'onMouseEnter'
  | 'onMouseLeave'
  | 'onPointerCancel'
  | 'onPointerDown'
  | 'onPointerEnter'
  | 'onPointerLeave'
  | 'onPointerUp';

const eventHandlerNames: ReadonlyArray<EventHandlerName> = [
  'onBlur',
  'onFocus',
  'onMouseEnter',
  'onMouseLeave',
  'onPointerCancel',
  'onPointerDown',
  'onPointerEnter',
  'onPointerLeave',
  'onPointerUp'
];

type StyleOptions = {
  customProperties: ?CustomProperties,
  provideInheritableStyle: boolean,
  withTextStyle: boolean,
  withInheritedStyle: boolean,
  writingDirection?: ?('auto' | 'ltr' | 'rtl')
};

const emptyObject = {};

/**
 * Unitless lineHeight acts as a fontSize multiplier. It is only fully resolved
 * at the point at which an element is being styled, so that inherited values
 * remain correct rather than being prematurely resolved to pixel values.
 * Note: this mutates the input.
 */
function resolveUnitlessLineHeight(style: ReactNativeStyle): ReactNativeStyle {
  if (typeof style?.lineHeight === 'string') {
    const fontSize = typeof style?.fontSize === 'number' ? style.fontSize : 16;
    style.lineHeight = parseFloat(style.lineHeight) * fontSize;
  }
  return style;
}

/**
 * Produces the relevant React Native props to implement the given styles, and any
 * inheritable text styles that may be required.
 */
export function useStyleProps(
  flatStyle: Style,
  options: StyleOptions
): {
  nativeProps: ReactNativeProps,
  inheritableStyle: ?Style
} {
  const {
    customProperties,
    provideInheritableStyle,
    withTextStyle,
    withInheritedStyle,
    writingDirection: dir
  } = options;

  const { fontScale, height, width, colorScheme, prefersReducedMotion } =
    useStyleEnvironment();
  const { scale: viewportScale } = useViewportScale();

  // These values are already computed
  const {
    color: inheritedColor,
    cursor: inheritedCursor,
    fontFamily: inheritedFontFamily,
    fontSize: inheritedFontSize,
    fontStyle: inheritedFontStyle,
    fontVariant: inheritedFontVariant,
    fontWeight: inheritedFontWeight,
    letterSpacing: inheritedLetterSpacing,
    lineHeight: inheritedLineHeight,
    textAlign: inheritedTextAlign,
    textDecorationColor: inheritedTextDecorationColor,
    textDecorationLine: inheritedTextDecorationLine,
    textDecorationStyle: inheritedTextDecorationStyle,
    textIndent: inheritedTextIndent,
    textTransform: inheritedTextTransform,
    whiteSpace: inheritedWhiteSpace,
    writingDirection: inheritedWritingDirection
  } = useInheritedStyles();

  const { active, focus, hover, handlers } = usePseudoStates(flatStyle);

  // Get the computed style props
  const styleProps = css.props.call(
    {
      active,
      colorScheme,
      customProperties: customProperties ?? emptyObject,
      focus,
      fontScale,
      hover,
      inheritedFontSize:
        typeof inheritedFontSize === 'number' ? inheritedFontSize : undefined,
      prefersReducedMotion,
      viewportHeight: height,
      viewportScale,
      viewportWidth: width
    },
    flatStyle
  );

  if (handlers != null) {
    for (const handler of eventHandlerNames) {
      const handlerValue = handlers[handler];
      if (handlerValue != null) {
        styleProps[handler] = handlerValue;
      }
    }
  }

  // Polyfill 'dir'
  if (dir != null) {
    if (dir !== 'auto' && styleProps.style.direction == null) {
      styleProps.style.direction = dir;
    }
    styleProps.style.writingDirection = dir;
  }

  // Polyfill CSS transitions
  const styleWithAnimations = useStyleTransition(styleProps.style);
  if (styleProps.style !== styleWithAnimations) {
    // This is an internal prop used to track components that need Animated renderers
    styleProps.animated = true;
    styleProps.style = styleWithAnimations;
  }

  // Create inherited values lookup for performance
  const inheritedValues: Readonly<{ [string]: ?ReactNativeStyleValue }> = {
    color: inheritedColor,
    cursor: inheritedCursor,
    fontFamily: inheritedFontFamily,
    fontSize: inheritedFontSize,
    fontStyle: inheritedFontStyle,
    fontVariant: inheritedFontVariant,
    fontWeight: inheritedFontWeight,
    letterSpacing: inheritedLetterSpacing,
    lineHeight: inheritedLineHeight,
    textAlign: inheritedTextAlign,
    textDecorationColor: inheritedTextDecorationColor,
    textDecorationLine: inheritedTextDecorationLine,
    textDecorationStyle: inheritedTextDecorationStyle,
    textIndent: inheritedTextIndent,
    textTransform: inheritedTextTransform,
    whiteSpace: inheritedWhiteSpace,
    writingDirection: inheritedWritingDirection
  };

  const inheritableStyle: ReactNativeStyle = {};
  const viewStyle: ReactNativeStyle = {};
  let hasInheritableStyle = false;

  for (const key of inheritedProperties) {
    const value = styleProps.style[key];
    const inheritedValue = inheritedValues[key];

    let val = value;
    if (
      (withInheritedStyle && value == null) ||
      value === 'inherit' ||
      value === 'unset'
    ) {
      val = inheritedValue;
    }
    if (val != null) {
      hasInheritableStyle = true;
      inheritableStyle[key] = val;
      styleProps.style[key] = val;
    }
  }

  // Copy non-inherited properties to viewStyle
  if (hasInheritableStyle) {
    for (const key in styleProps.style) {
      if (!Object.hasOwn(inheritedValues, key)) {
        viewStyle[key] = styleProps.style[key];
      }
    }
    if (withTextStyle === true) {
      const textStyle =
        provideInheritableStyle === true
          ? { ...inheritableStyle }
          : inheritableStyle;
      // $FlowExpectedError[unsafe-object-assign]
      Object.assign(viewStyle, resolveUnitlessLineHeight(textStyle));
    }
    styleProps.style = viewStyle;
  }

  return {
    nativeProps: styleProps,
    // Cast the owned, mutable RN-style object to StyleX's read-only `Style`
    // type expected by the inherited-style subsystem.
    inheritableStyle:
      hasInheritableStyle && provideInheritableStyle === true
        ? (inheritableStyle as $FlowFixMe)
        : null
  };
}
