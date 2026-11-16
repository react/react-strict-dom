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
const LENGTH_REG = /^-?([0-9]*\.)?[0-9]+[a-zA-Z%]+$/;

function isLength(v: string): boolean {
  return v === '0' || LENGTH_REG.test(v);
}

function toMaybeNum(v: string): number | string {
  if (!/px$/.test(v) && v !== '0') return v;
  const n = parseFloat(v);
  return !isNaN(n) ? n : v;
}

function parseValue(str: string) {
  const parts = str.split(PARTS_REG).filter((p) => p !== '');
  const inset = parts.includes('inset');
  // The color may appear before or after the lengths
  const color = parts.find((p) => p !== 'inset' && !isLength(p)) ?? null;

  const nums = parts
    .filter((n) => n !== 'inset')
    .filter((n) => n !== color)
    .map(toMaybeNum);

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
