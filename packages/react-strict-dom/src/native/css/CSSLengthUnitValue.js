/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { warnMsg } from '../../shared/logUtils';

const LENGTH_REGEX = /^(-?[0-9]*[.]?[0-9]+)(em|px|rem|vh|vmax|vmin|vw)$/;

type CSSLengthUnitType = 'em' | 'px' | 'rem' | 'vh' | 'vmax' | 'vmin' | 'vw';

type ResolvePixelValueOptions = $ReadOnly<{
  fontScale: number | void,
  inheritedFontSize: ?number,
  viewportHeight: number,
  viewportScale: number,
  viewportWidth: number
}>;

const memoizedValues = new Map<string, CSSLengthUnitValue | null>();

// TODO: this only works on simple values
export class CSSLengthUnitValue {
  static parse(input: string): CSSLengthUnitValue | null {
    const memoizedValue = memoizedValues.get(input);
    if (memoizedValue !== undefined) {
      return memoizedValue;
    }

    const match = input.match(LENGTH_REGEX);
    if (match == null) {
      memoizedValues.set(input, null);
      return null;
    }
    const value = match[1];
    const unit: $FlowFixMe = match[2];
    const parsedFloat: number = parseFloat(value);
    const cssLengthUnitValue = new CSSLengthUnitValue(parsedFloat, unit);
    memoizedValues.set(input, cssLengthUnitValue);
    return cssLengthUnitValue;
  }

  value: number;
  unit: CSSLengthUnitType;

  constructor(value: number, unit: CSSLengthUnitType) {
    this.value = value;
    this.unit = unit;
  }

  resolvePixelValue(options: ResolvePixelValueOptions): number {
    const {
      inheritedFontSize,
      viewportHeight,
      viewportScale = 1,
      viewportWidth
    } = options;
    const unit = this.unit;
    const value = this.value;
    const valuePercent = value / 100;
    switch (unit) {
      case 'em': {
        if (inheritedFontSize == null) {
          return 16 * value * viewportScale;
        } else {
          return inheritedFontSize * value;
        }
      }
      case 'px': {
        return value * viewportScale;
      }
      case 'rem': {
        return 16 * value * viewportScale;
      }
      case 'vh': {
        return viewportHeight * valuePercent;
      }
      case 'vmin': {
        return Math.min(viewportWidth, viewportHeight) * valuePercent;
      }
      case 'vmax': {
        return Math.max(viewportWidth, viewportHeight) * valuePercent;
      }
      case 'vw': {
        return viewportWidth * valuePercent;
      }
      default: {
        if (__DEV__) {
          warnMsg(`unsupported unit of "${unit}"`);
        }
        return 0;
      }
    }
  }
}
