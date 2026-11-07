/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { ReactNativeTransform } from '../../types/renderer.native';

import { CSSCalcValue } from './CSSCalcValue';
import { CSSTransformValue } from './CSSTransformValue';

const transformRegex1 =
  /(perspective|scale|scaleX|scaleY|scaleZ|translateX|translateY)\(([0-9.+\-eE]+)(px|%)?\)/;
const transformRegex2 = /(rotate|rotateX|rotateY|rotateZ|skewX|skewY)\((.*)\)/;
const transformRegex3 = /matrix\((.*)\)/;

const memoizedValues = new Map<string, CSSTransformValue>();

// Pre-evaluate calc() expressions inside a transform string, replacing each
// calc(...) with its computed numeric value so the regex parser can handle it.
function resolveCalcInTransform(input: string): string {
  if (!input.includes('calc(')) {
    return input;
  }
  let result = '';
  let i = 0;
  while (i < input.length) {
    const calcIdx = input.indexOf('calc(', i);
    if (calcIdx === -1) {
      result += input.slice(i);
      break;
    }
    result += input.slice(i, calcIdx);
    // Find the matching closing paren for calc(
    let depth = 0;
    let j = calcIdx + 4; // position of '('
    for (; j < input.length; j++) {
      if (input[j] === '(') {
        depth++;
      } else if (input[j] === ')') {
        depth--;
        if (depth === 0) {
          break;
        }
      }
    }
    const calcStr = input.slice(calcIdx, j + 1);
    const calcValue = CSSCalcValue.parse(calcStr);
    if (calcValue != null) {
      const evaluated = calcValue.resolvePixelValue({ fontScale: 1 }, 'width');
      result += typeof evaluated === 'number' ? String(evaluated) : '0';
    } else {
      result += '0';
    }
    i = j + 1;
  }
  return result;
}

export function parseTransform(transform: string): CSSTransformValue {
  const memoizedValue = memoizedValues.get(transform);
  if (memoizedValue != null) {
    return memoizedValue;
  }

  const originalTransform = transform;
  transform = resolveCalcInTransform(transform);
  const transforms = transform
    .split(')')
    .flatMap((s) => (s === '' ? ([] as string[]) : [s + ')']));
  const parsedTransforms: ReactNativeTransform[] = [];

  for (const txf of transforms) {
    let match = txf.match(transformRegex1);
    if (match != null) {
      const t = match[1];
      const value = parseFloat(match[2]);
      const unit = match[3];

      if (isNaN(value)) {
        continue;
      }
      if (t === 'perspective') {
        parsedTransforms.push({ perspective: value });
      } else if (t === 'scale') {
        parsedTransforms.push({ scale: value });
      } else if (t === 'scaleX') {
        parsedTransforms.push({ scaleX: value });
      } else if (t === 'scaleY') {
        parsedTransforms.push({ scaleY: value });
      } else if (t === 'scaleZ') {
        parsedTransforms.push({ scaleZ: value });
      } else if (t === 'translateX') {
        parsedTransforms.push({
          translateX: unit === '%' ? value + unit : value
        });
      } else if (t === 'translateY') {
        parsedTransforms.push({
          translateY: unit === '%' ? value + unit : value
        });
      }
      continue;
    }

    match = txf.match(transformRegex2);
    if (match != null) {
      const t = match[1];
      const value = match[2];
      if (t === 'rotate') {
        parsedTransforms.push({ rotate: value });
      } else if (t === 'rotateX') {
        parsedTransforms.push({ rotateX: value });
      } else if (t === 'rotateY') {
        parsedTransforms.push({ rotateY: value });
      } else if (t === 'rotateZ') {
        parsedTransforms.push({ rotateZ: value });
      } else if (t === 'skewX') {
        parsedTransforms.push({ skewX: value });
      } else if (t === 'skewY') {
        parsedTransforms.push({ skewY: value });
      }
      continue;
    }

    match = txf.match(transformRegex3);
    if (match != null) {
      const matrixValues = match[1].trim().split(/\s*,\s*/);
      if (matrixValues.length !== 6) {
        continue;
      }
      const matrix = matrixValues.map(parseFloat);
      if (matrix.some(isNaN)) {
        continue;
      }
      parsedTransforms.push({
        matrix: [
          matrix[0],
          matrix[1],
          0,
          0,
          matrix[2],
          matrix[3],
          0,
          0,
          matrix[4],
          matrix[5],
          1,
          0,
          0,
          0,
          0,
          1
        ]
      });
    }
  }

  const cssTransformValue = new CSSTransformValue(parsedTransforms);
  memoizedValues.set(originalTransform, cssTransformValue);
  return cssTransformValue;
}
