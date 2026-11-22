/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { warnMsg } from '../../shared/logUtils';

const VALUES_REG = /,(?![^(]*\))/;
const PARTS_REG = /\s(?![^(]*\))/;
const LENGTH_REG = /^-?(?:[0-9]*\.)?[0-9]+[a-zA-Z%]+$/;

function isLength(v: string): boolean {
  return v === '0' || LENGTH_REG.test(v);
}

function toMaybeNum(v: string): number | string {
  if (!/px$/.test(v) && v !== '0') return v;
  const n = parseFloat(v);
  return !isNaN(n) ? n : v;
}

function parseValue(str: string) {
  const parts = str.split(PARTS_REG);
  const inset = parts.includes('inset');
  const tokens = parts.filter((n) => n !== 'inset');
  // The color is the single token that is not a length value. CSS allows it to
  // be specified either before or after the offset values, so search all tokens
  // rather than assuming it is last.
  const color = tokens.find((n) => !isLength(n)) ?? null;

  const nums = tokens.filter((n) => n !== color).map(toMaybeNum);

  const [offsetX, offsetY, blurRadius, spreadRadius] = nums;

  return {
    inset,
    offsetX,
    offsetY,
    blurRadius,
    spreadRadius,
    color
  };
}

export type TextShadowStyle = Readonly<{
  textShadowColor: string | null,
  textShadowOffset: Readonly<{
    height: number | string,
    width: number | string
  }>,
  textShadowRadius: number | string
}>;

const memoizedValues = new Map<string, TextShadowStyle>();

export function parseTextShadow(str: string): TextShadowStyle {
  const memoizedValue = memoizedValues.get(str);
  if (memoizedValue != null) {
    return memoizedValue;
  }

  const parsedValue = str
    .split(VALUES_REG)
    .map((s) => s.trim())
    .map(parseValue);

  if (__DEV__) {
    if (parsedValue.length > 1) {
      warnMsg('unsupported multiple values for style property "textShadow".');
    }
  }
  const { offsetX, offsetY, blurRadius, color } = parsedValue[0];
  const textShadowStyle = {
    textShadowColor: color,
    textShadowOffset: {
      height: offsetY,
      width: offsetX
    },
    textShadowRadius: blurRadius
  };

  memoizedValues.set(str, textShadowStyle);

  return textShadowStyle;
}
