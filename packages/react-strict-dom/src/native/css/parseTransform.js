/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { ReactNativeTransform } from '../../types/renderer.native';

import { CSSTransformValue } from './CSSTransformValue';

const transformRegex1 =
  /(perspective|scale|scaleX|scaleY|scaleZ|translateX|translateY)\(([0-9.+\-eE]+)(px|%)?\)/;
const transformRegex2 = /(rotate|rotateX|rotateY|rotateZ|skewX|skewY)\((.*)\)/;
const transformRegex3 = /matrix\((.*)\)/;

const memoizedValues = new Map<string, CSSTransformValue>();

export function parseTransform(transform: string): CSSTransformValue {
  const memoizedValue = memoizedValues.get(transform);
  if (memoizedValue != null) {
    return memoizedValue;
  }

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
          0,
          0,
          1,
          0,
          matrix[4],
          matrix[5],
          0,
          1
        ]
      });
    }
  }

  const cssTransformValue = new CSSTransformValue(parsedTransforms);
  memoizedValues.set(transform, cssTransformValue);
  return cssTransformValue;
}
