/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { CSSLengthUnitValue } from './CSSLengthUnitValue';
import { CSSUnparsedValue } from './typed-om/CSSUnparsedValue';

import { errorMsg, warnMsg } from '../../shared/logUtils';
import { isAllowedShortFormValue } from './isAllowedShortFormValue';
import { isAllowedStyleKey } from './isAllowedStyleKey';
import { parseTextShadow } from './parseTextShadow';
import { parseTimeValue } from './parseTimeValue';
import { parseTransform } from './parseTransform';
import { stringContainsVariables } from './customProperties';

// Keys that should be excluded from inherit/unset processing
const excludedFromInherit = new Set<string>([
  ':active',
  ':focus',
  ':hover',
  'default'
]);

const inheritedProperties = new Set<string>([
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
  'whiteSpace'
]);

const placeContentValidValues = new Set<string>([
  'center',
  'flex-end',
  'flex-start',
  // distributed alignment
  'space-around',
  'space-between',
  'space-evenly'
]);

const timeValuedProperties = new Set<string>([
  // Remove animation properties - they can have comma-separated values that need special handling
  // 'animationDelay',    // Can be '0s, 0.2s, 0.4s' - don't preprocess
  // 'animationDuration', // Can be '1s, 1s, 1s' - don't preprocess
  'transitionDelay',
  'transitionDuration'
]);

const unsupportedValues = new Set<string>(['currentcolor', 'initial']);

export function processStyle(
  style: { +[string]: unknown },
  skipValidation?: boolean
): { +[string]: unknown } {
  const result: { [string]: unknown } = {};

  for (const propName in style) {
    const styleValue = style[propName];

    if (skipValidation !== true && !isAllowedStyleKey(propName)) {
      if (__DEV__) {
        warnMsg(`unsupported style property "${propName}"`);
      }
      continue;
    }

    // Object values
    else if (typeof styleValue === 'object' && styleValue != null) {
      if (propName === '::placeholder') {
        const placeholderStyleProps = Object.keys(styleValue);
        for (let i = 0; i < placeholderStyleProps.length; i++) {
          const prop = placeholderStyleProps[i];
          if (prop === 'color') {
            result['placeholderTextColor'] = processStyle({
              color: styleValue.color
            }).color;
          } else {
            if (__DEV__) {
              warnMsg(`unsupported "::placeholder" style property "${prop}"`);
            }
          }
        }
        continue;
      } else if (Object.hasOwn(styleValue, 'default')) {
        result[propName] = processStyle(styleValue);
        continue;
      }
    }

    // String values
    else if (typeof styleValue === 'string') {
      // Polyfill support for string '0' on Android
      if (styleValue === '0') {
        result[propName] = 0;
        continue;
      }
      // Polyfill support for custom property references (do this first)
      if (stringContainsVariables(styleValue)) {
        result[propName] = CSSUnparsedValue.parse(propName, styleValue);
        continue;
      }
      // Polyfill support for backgroundImage using experimental API
      else if (propName === 'backgroundImage') {
        result.experimental_backgroundImage = styleValue;
        continue;
      }
      // Warn for unsupported caretColor values
      else if (
        propName === 'caretColor' &&
        (typeof styleValue === 'undefined' || styleValue === 'auto')
      ) {
        if (__DEV__) {
          warnMsg(
            `unsupported style value in "${propName}:${String(styleValue)}"`
          );
        }
        continue;
      }
      // Workaround unsupported objectFit values
      else if (propName === 'objectFit' && styleValue === 'none') {
        result[propName] = 'scale-down';
        continue;
      }
      // Polyfill support for string opacity on Android
      else if (propName === 'opacity') {
        result[propName] = parseFloat(styleValue);
        continue;
      }
      // Polyfill placeContent
      else if (propName === 'placeContent') {
        // None of these values are supported in RN for both properties.
        if (!placeContentValidValues.has(styleValue)) {
          if (__DEV__) {
            warnMsg(
              `unsupported style value in "${propName}:${String(styleValue)}"`
            );
          }
          continue;
        }
      }
      // Workaround unsupported position values
      else if (
        propName === 'position' &&
        (styleValue === 'fixed' || styleValue === 'sticky')
      ) {
        const fallback = styleValue === 'fixed' ? 'absolute' : 'relative';
        if (__DEV__) {
          warnMsg(
            `unsupported style value in "position:${styleValue}". Falling back to "position:${fallback}".`
          );
        }
        result[propName] = fallback;
        continue;
      }
      // Workaround unsupported textAlign values
      // https://github.com/facebook/react-native/issues/45255
      else if (propName === 'textAlign') {
        if (styleValue === 'start') {
          result[propName] = 'left';
        } else if (styleValue === 'end') {
          result[propName] = 'right';
        } else {
          result[propName] = styleValue;
        }
        continue;
      }
      // Polyfill textShadow
      else if (propName === 'textShadow') {
        result[propName] = parseTextShadow(styleValue);
        continue;
      }
      // Polyfill transform as string value
      else if (propName === 'transform') {
        result[propName] = parseTransform(styleValue);
        continue;
      }
      // Polyfill time-valued string values (e.g., '1000ms' => 1000)
      else if (timeValuedProperties.has(propName)) {
        result[propName] = parseTimeValue(styleValue);
        continue;
      }

      const maybeLengthUnitValue = CSSLengthUnitValue.parse(styleValue);
      if (maybeLengthUnitValue != null) {
        result[propName] = maybeLengthUnitValue;
        continue;
        // React Native doesn't support these keywords or functions
      } else if (styleValue === 'inherit' || styleValue === 'unset') {
        // direction has native support for 'inherit'
        if (propName === 'direction') {
          result[propName] = 'inherit';
          continue;
        }
        // inherited properties polyfill 'inherit' in useStyleProps
        else if (
          !excludedFromInherit.has(propName) &&
          !inheritedProperties.has(propName)
        ) {
          if (__DEV__) {
            warnMsg(
              `unsupported style value in "${propName}:${String(styleValue)}"`
            );
          }
          continue;
        }
      } else if (
        unsupportedValues.has(styleValue) ||
        styleValue.includes('calc(')
      ) {
        if (__DEV__) {
          warnMsg(
            `unsupported style value in "${propName}:${String(styleValue)}"`
          );
        }
        continue;
      } else if (!isAllowedShortFormValue(propName, styleValue)) {
        if (__DEV__) {
          errorMsg(
            `invalid style value in "${propName}:${String(styleValue)}". Shortform properties cannot contain multiple values. Please use longform properties.`
          );
        }
        continue;
      }
    }

    // Number values
    else if (typeof styleValue === 'number') {
      // Polyfill numeric fontWeight (for desktop)
      if (propName === 'fontWeight') {
        result[propName] = styleValue.toString();
        continue;
      }
      // Normalize unitless lineHeight to string
      if (propName === 'lineHeight') {
        result[propName] = styleValue.toString();
        continue;
      }
    }

    // Everything else
    result[propName] = styleValue;
  }

  return result;
}
