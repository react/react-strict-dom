/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { ReactNativeProps } from '../../types/renderer.native';
import type { ReactNativeStyle } from '../../types/renderer.native';
import type { CustomProperties } from '../../types/styles';
import type { MutableCustomProperties } from '../../types/styles';
import type { IStyleX } from '../../types/styles';

import { CSSCalcValue } from './CSSCalcValue';
import { CSSLengthUnitValue } from './CSSLengthUnitValue';
import { CSSTransformValue } from './CSSTransformValue';
import { CSSUnparsedValue } from './typed-om/CSSUnparsedValue';
import { errorMsg, warnMsg } from '../../shared/logUtils';
import { flattenStyle } from './flattenStyleXStyles';
import { lengthStyleKeySet } from './isLengthStyleKey';
import { mediaQueryMatches } from './mediaQueryMatches';
import { processStyle } from './processStyle';
import { resolveVariableReferences } from './customProperties';

export const __customProperties: MutableCustomProperties = {};

/**
 * The create method shim should do initial transforms like
 * renaming/expanding/validating properties, essentially all the steps
 * which can be done at initialization-time (could potentially be done at
 * compile-time in the future).
 */
function _create<S extends { +[string]: { +[string]: unknown } }>(styles: S): {
  [string]: unknown
} {
  const result: { [string]: unknown } = {};
  for (const styleName in styles) {
    const val = styles[styleName];
    if (typeof val === 'function') {
      result[styleName] = (...args: ?(string | number)) => {
        const style = val(...args);
        return processStyle(style);
      };
    } else {
      result[styleName] = processStyle(styles[styleName]);
    }
  }
  return result;
}
export const create: IStyleX['create'] = _create as $FlowFixMe;

const RE_CAPTURE_VAR_NAME = /^var\(--(.*)\)$/;
export const createTheme = (
  baseTokens: Tokens,
  overrides: CustomProperties
): CustomProperties => {
  const result: MutableCustomProperties = { $$theme: 'theme' };
  for (const key in baseTokens) {
    const varName: string = baseTokens[key];
    const normalizedKey = varName.replace(RE_CAPTURE_VAR_NAME, '$1');
    result[normalizedKey] = overrides[key];
  }
  return result;
};

export const defineConsts = (constants: {
  [string]: string
}): { [string]: string } => {
  return Object.freeze(constants);
};

type Tokens = { [string]: string };
let defineVarsCount = 1;
export const defineVars = (tokens: CustomProperties): Tokens => {
  const result: Tokens = {};
  for (const key in tokens) {
    const value = tokens[key];
    const customPropName = `${key}__id__${defineVarsCount++}`;
    result[key] = `var(--${customPropName})`;
    // NOTE: it's generally not a good idea to mutate the default context,
    // but defineVars is always called before any component body is evaluated,
    // and so it's safe to do so here.
    __customProperties[customPropName] = value;
  }
  return result;
};

export const firstThatWorks = <T extends string | number>(
  ...values: ReadonlyArray<T>
): T => {
  return values[0];
};

type Keyframes = {
  +[key: string]: { +[k: string]: string | number }
};
function _keyframes(k: Keyframes): Keyframes {
  if (__DEV__) {
    errorMsg('css.keyframes() is not supported.');
  }
  return k;
}
export const keyframes: (Keyframes) => string = _keyframes as $FlowFixMe;

type PositionTry = {
  +[k: string]: string | number
};
function _positionTry(p: PositionTry): PositionTry {
  if (__DEV__) {
    errorMsg('css.positionTry() is not supported.');
  }
  return p;
}
export const positionTry: (PositionTry) => string = _positionTry as $FlowFixMe;

type ResolveStyleOptions = Readonly<{
  active?: ?boolean,
  colorScheme: ?('light' | 'dark'),
  customProperties: CustomProperties,
  focus?: ?boolean,
  fontScale: number | void,
  fontSize?: ?number,
  hover?: ?boolean,
  inheritedFontSize: ?number,
  prefersReducedMotion: boolean,
  viewportHeight: number,
  viewportScale: number | void,
  viewportWidth: number,
  writingDirection?: ?'ltr' | 'rtl'
}>;

/**
 * Resolve 'props'
 */
const mqDark = '@media (prefers-color-scheme: dark)';

function resolveStyle(
  style: ReadonlyArray<?{ +[string]: unknown }> | { +[string]: unknown },
  options: ResolveStyleOptions
): { +[string]: unknown } {
  const {
    active,
    focus,
    fontScale,
    fontSize: _fontSize,
    hover,
    inheritedFontSize,
    prefersReducedMotion,
    viewportHeight,
    viewportScale = 1,
    viewportWidth
  } = options;
  const colorScheme = options.colorScheme || 'light';
  const customProperties = options.customProperties || __customProperties;

  const result: { [string]: unknown } = {};
  const stylesToReprocess: { [string]: unknown } = {};
  const flatStyle = flattenStyle(style);

  for (const propName in flatStyle) {
    const styleValue = flatStyle[propName];

    // Resolve custom property references
    if (styleValue instanceof CSSUnparsedValue) {
      const resolvedValue = resolveVariableReferences(
        propName,
        styleValue,
        customProperties,
        colorScheme
      );
      if (resolvedValue != null) {
        stylesToReprocess[propName] = resolvedValue;
      }
      continue;
    }

    // Resolve length units
    if (styleValue instanceof CSSLengthUnitValue) {
      const fontSize =
        flatStyle.fontSize != null ? flatStyle.fontSize : _fontSize;
      // If fontSize is being resolved, or there is no fontSize for this style,
      // we use the inherited fontSize.
      if (propName === 'fontSize' || fontSize == null) {
        result[propName] = styleValue.resolvePixelValue({
          fontScale,
          inheritedFontSize: inheritedFontSize,
          viewportHeight,
          viewportScale,
          viewportWidth
        });
        continue;
      }
      if (fontSize != null) {
        // If the style contains a fontSize, it must first be resolved and then
        // used as the "inherited" value to resolve other lengths correctly.
        if (typeof fontSize === 'number') {
          result[propName] = styleValue.resolvePixelValue({
            fontScale,
            inheritedFontSize: fontSize,
            viewportHeight,
            viewportScale,
            viewportWidth
          });
        } else {
          stylesToReprocess[propName] = styleValue;
        }
        continue;
      }
    }

    if (styleValue instanceof CSSCalcValue) {
      result[propName] = styleValue.resolvePixelValue(
        {
          fontScale,
          inheritedFontSize,
          viewportHeight,
          viewportScale,
          viewportWidth
        },
        propName
      );
      continue;
    }

    if (styleValue instanceof CSSTransformValue) {
      result[propName] = styleValue.resolveTransformValue(viewportScale);
      continue;
    }
    if (
      viewportScale !== 1 &&
      typeof styleValue === 'number' &&
      lengthStyleKeySet.has(propName)
    ) {
      result[propName] = styleValue * viewportScale;
      continue;
    }

    // Resolve the object-value syntax
    if (
      styleValue != null &&
      typeof styleValue === 'object' &&
      Object.hasOwn(styleValue, 'default')
    ) {
      let activeVariant = 'default';
      if (Object.hasOwn(styleValue, ':hover') && hover === true) {
        activeVariant = ':hover';
      }
      if (Object.hasOwn(styleValue, ':focus') && focus === true) {
        activeVariant = ':focus';
      }
      if (Object.hasOwn(styleValue, ':active') && active === true) {
        activeVariant = ':active';
      }
      if (Object.hasOwn(styleValue, mqDark) && colorScheme === 'dark') {
        activeVariant = mqDark;
      }
      // Just picks the last MQ in order that matches.
      // TODO: decide how StyleX should handle multiple MQs.
      for (const variant in styleValue) {
        if (variant.startsWith('@media') && variant !== mqDark) {
          const matches = mediaQueryMatches(
            variant,
            viewportWidth,
            viewportHeight,
            prefersReducedMotion
          );
          if (matches) {
            activeVariant = variant;
          }
        }
      }
      stylesToReprocess[propName] = styleValue[activeVariant];
      continue;
    }

    // Resolve textShadow
    if (propName === 'textShadow') {
      // $FlowExpectedError[unsafe-object-assign]
      Object.assign(result, styleValue);
      continue;
    }

    result[propName] = styleValue;
  }

  const propNamesToReprocess = Object.keys(stylesToReprocess);
  if (propNamesToReprocess.length > 0) {
    const processedStyles = processStyle(stylesToReprocess, true);
    // We can end up re-processing values without a fontSize (since it might already be resolved),
    // which generates incorrect 'em'-based values. Passing the fontSize back in avoids this.
    // However, if the fontSize is already a number it could be incorrectly scaled so it must be
    // passed in as an option instead of a style.
    const resolvedFontSize = result.fontSize;
    const fontSizeStyle =
      resolvedFontSize != null && typeof resolvedFontSize !== 'number'
        ? { fontSize: resolvedFontSize }
        : null;
    const nextStyles =
      fontSizeStyle != null
        ? [fontSizeStyle, processedStyles]
        : processedStyles;
    const nextOptions =
      resolvedFontSize != null && typeof resolvedFontSize === 'number'
        ? { ...options, fontSize: resolvedFontSize }
        : options;

    const resolvedStyles = resolveStyle(nextStyles, nextOptions);
    // $FlowExpectedError[unsafe-object-assign]
    Object.assign(result, resolvedStyles);
  }

  return result;
}

export function props(
  this: ResolveStyleOptions,
  ...style: ReadonlyArray<?{ [key: string]: unknown }>
): ReactNativeProps {
  const options = this;

  const nativeProps: ReactNativeProps = { style: {} };
  const nextStyle: ReactNativeStyle = nativeProps.style;

  const flatStyle = resolveStyle(style, options) as $FlowFixMe;

  for (const styleProp in flatStyle) {
    const styleValue = flatStyle[styleProp];

    // block/inlineSize
    if (styleProp === 'blockSize') {
      nextStyle.height ??= styleValue;
    } else if (styleProp === 'inlineSize') {
      nextStyle.width ??= styleValue;
    } else if (styleProp === 'maxBlockSize') {
      nextStyle.maxHeight ??= styleValue;
    } else if (styleProp === 'minBlockSize') {
      nextStyle.minHeight ??= styleValue;
    } else if (styleProp === 'maxInlineSize') {
      nextStyle.maxWidth ??= styleValue;
    } else if (styleProp === 'minInlineSize') {
      nextStyle.minWidth ??= styleValue;
    }
    // borderBlock
    else if (styleProp === 'borderBlockColor') {
      nextStyle.borderTopColor ??= styleValue;
      nextStyle.borderBottomColor ??= styleValue;
    } else if (styleProp === 'borderBlockStyle') {
      nextStyle.borderTopStyle ??= styleValue;
      nextStyle.borderBottomStyle ??= styleValue;
    } else if (styleProp === 'borderBlockWidth') {
      nextStyle.borderTopWidth ??= styleValue;
      nextStyle.borderBottomWidth ??= styleValue;
    } else if (styleProp === 'borderBlockEndColor') {
      nextStyle.borderBottomColor = flatStyle.borderBottomColor ?? styleValue;
    } else if (styleProp === 'borderBlockEndStyle') {
      nextStyle.borderBottomStyle = flatStyle.borderBottomStyle ?? styleValue;
    } else if (styleProp === 'borderBlockEndWidth') {
      nextStyle.borderBottomWidth = flatStyle.borderBottomWidth ?? styleValue;
    } else if (styleProp === 'borderBlockStartColor') {
      nextStyle.borderTopColor = flatStyle.borderTopColor ?? styleValue;
    } else if (styleProp === 'borderBlockStartStyle') {
      nextStyle.borderTopStyle = flatStyle.borderTopStyle ?? styleValue;
    } else if (styleProp === 'borderBlockStartWidth') {
      nextStyle.borderTopWidth = flatStyle.borderTopWidth ?? styleValue;
    }
    // borderInline
    else if (styleProp === 'borderInlineColor') {
      nextStyle.borderStartColor ??= styleValue;
      nextStyle.borderEndColor ??= styleValue;
    } else if (styleProp === 'borderInlineStyle') {
      nextStyle.borderStartStyle ??= styleValue;
      nextStyle.borderEndStyle ??= styleValue;
    } else if (styleProp === 'borderInlineWidth') {
      nextStyle.borderStartWidth ??= styleValue;
      nextStyle.borderEndWidth ??= styleValue;
    } else if (styleProp === 'borderInlineEndColor') {
      nextStyle.borderEndColor = styleValue;
    } else if (styleProp === 'borderInlineEndStyle') {
      nextStyle.borderEndStyle = styleValue;
    } else if (styleProp === 'borderInlineEndWidth') {
      nextStyle.borderEndWidth = styleValue;
    } else if (styleProp === 'borderInlineStartColor') {
      nextStyle.borderStartColor = styleValue;
    } else if (styleProp === 'borderInlineStartStyle') {
      nextStyle.borderStartStyle = styleValue;
    } else if (styleProp === 'borderInlineStartWidth') {
      nextStyle.borderStartWidth = styleValue;
    }
    // borderRadius
    else if (styleProp === 'borderStartStartRadius') {
      nextStyle.borderTopStartRadius = styleValue;
    } else if (styleProp === 'borderEndStartRadius') {
      nextStyle.borderBottomStartRadius = styleValue;
    } else if (styleProp === 'borderStartEndRadius') {
      nextStyle.borderTopEndRadius = styleValue;
    } else if (styleProp === 'borderEndEndRadius') {
      nextStyle.borderBottomEndRadius = styleValue;
    }
    // borderStyle:"none" polyfill
    else if (styleProp === 'borderStyle' && styleValue === 'none') {
      nextStyle.borderWidth = 0;
    } else if (styleProp === 'borderWidth') {
      nextStyle.borderWidth ??= styleValue;
    }
    // caretColor polyfill
    else if (styleProp === 'caretColor') {
      if (styleValue === 'transparent') {
        nativeProps.caretHidden = true;
      } else {
        nativeProps.cursorColor = styleValue;
      }
    }
    // inset
    else if (styleProp === 'inset') {
      nextStyle.top ??= styleValue;
      nextStyle.start ??= styleValue;
      nextStyle.end ??= styleValue;
      nextStyle.bottom ??= styleValue;
    } else if (styleProp === 'insetBlock') {
      nextStyle.top ??= styleValue;
      nextStyle.bottom ??= styleValue;
    } else if (styleProp === 'insetBlockEnd') {
      nextStyle.bottom = flatStyle.bottom ?? styleValue;
    } else if (styleProp === 'insetBlockStart') {
      nextStyle.top = flatStyle.top ?? styleValue;
    } else if (styleProp === 'insetInline') {
      nextStyle.end ??= styleValue;
      nextStyle.start ??= styleValue;
    } else if (styleProp === 'insetInlineEnd') {
      nextStyle.end = flatStyle.end ?? styleValue;
    } else if (styleProp === 'insetInlineStart') {
      nextStyle.start = flatStyle.start ?? styleValue;
    }
    // lineClamp polyfill
    else if (styleProp === 'lineClamp') {
      nativeProps.numberOfLines = styleValue;
    }
    // marginBlock
    else if (styleProp === 'marginBlock') {
      nextStyle.marginVertical = styleValue;
    } else if (styleProp === 'marginBlockStart') {
      nextStyle.marginTop ??= styleValue;
    } else if (styleProp === 'marginBlockEnd') {
      nextStyle.marginBottom ??= styleValue;
    }
    // marginInline
    else if (styleProp === 'marginInline') {
      nextStyle.marginHorizontal = styleValue;
    } else if (styleProp === 'marginInlineStart') {
      nextStyle.marginStart = styleValue;
    } else if (styleProp === 'marginInlineEnd') {
      nextStyle.marginEnd = styleValue;
    }
    // paddingBlock
    else if (styleProp === 'paddingBlock') {
      nextStyle.paddingVertical = styleValue;
    } else if (styleProp === 'paddingBlockStart') {
      nextStyle.paddingTop ??= styleValue;
    } else if (styleProp === 'paddingBlockEnd') {
      nextStyle.paddingBottom ??= styleValue;
    }
    // paddingInline
    else if (styleProp === 'paddingInline') {
      nextStyle.paddingHorizontal = styleValue;
    } else if (styleProp === 'paddingInlineStart') {
      nextStyle.paddingStart = styleValue;
    } else if (styleProp === 'paddingInlineEnd') {
      nextStyle.paddingEnd = styleValue;
    }
    // '::placeholder' polyfill
    else if (styleProp === 'placeholderTextColor') {
      nativeProps.placeholderTextColor = styleValue;
    }
    // visibility polyfill
    // Note: we can't polyfill nested visibility changes
    else if (styleProp === 'visibility') {
      if (styleValue === 'hidden' || styleValue === 'collapse') {
        nextStyle.opacity = 0;
        nativeProps.accessibilityElementsHidden = true;
        nativeProps.importantForAccessibility = 'no-hide-descendants';
        nativeProps.focusable = false;
        nativeProps.pointerEvents = 'none';
      }
    }
    // placeContent polyfill
    else if (styleProp === 'placeContent') {
      nextStyle.alignContent ??= styleValue;
      nextStyle.justifyContent ??= styleValue;
    }
    // willChange polyfill
    else if (styleProp === 'willChange') {
      if (typeof styleValue === 'string' && styleValue !== 'auto') {
        nativeProps.renderToHardwareTextureAndroid = true;
      }
    }
    // Everything else
    else {
      nextStyle[styleProp] = styleValue;
    }
  }

  if (__DEV__) {
    const displayValue = nextStyle.display;

    // Warning message if using unsupported display style
    if (
      displayValue != null &&
      displayValue !== 'flex' &&
      displayValue !== 'none' &&
      displayValue !== 'block'
    ) {
      warnMsg(`"display:${String(displayValue)}" is not a supported value`);
    }

    // Error message if using flex properties without "display:flex"
    // being set. React Native is always using "flex" layout but web
    // uses "flow" layout by default, which can lead to layout
    // divergence if building for native first.
    if (
      displayValue == null ||
      (displayValue !== 'flex' && displayValue !== 'none')
    ) {
      [
        'alignContent',
        'alignItems',
        'columnGap',
        'flexDirection',
        'flexWrap',
        'gap',
        'justifyContent',
        'rowGap'
      ].forEach((styleProp) => {
        const value = nextStyle[styleProp];
        if (value != null) {
          errorMsg(
            `"display:flex" is required for "${styleProp}" to have an effect.`
          );
        }
      });
    }
  }

  nativeProps.style = nextStyle;

  return nativeProps;
}
