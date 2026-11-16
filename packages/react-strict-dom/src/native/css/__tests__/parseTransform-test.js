/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { parseTransform as parseTransformImpl } from '../parseTransform';

function parseTransform(transform) {
  return parseTransformImpl(transform).resolveTransformValue();
}

describe('parseTransform', () => {
  test('perspective', () => {
    expect(parseTransform('perspective(10px)')).toEqual([{ perspective: 10 }]);
  });

  test('rotate', () => {
    expect(parseTransform('rotate(10deg)')).toEqual([{ rotate: '10deg' }]);
  });

  test('rotateX', () => {
    expect(parseTransform('rotateX(10deg)')).toEqual([{ rotateX: '10deg' }]);
  });

  test('rotateY', () => {
    expect(parseTransform('rotateY(10deg)')).toEqual([{ rotateY: '10deg' }]);
  });

  test('rotateZ', () => {
    expect(parseTransform('rotateZ(10deg)')).toEqual([{ rotateZ: '10deg' }]);
  });

  test('scale', () => {
    expect(parseTransform('scale(3.14)')).toEqual([{ scale: 3.14 }]);
  });

  test('scaleX', () => {
    expect(parseTransform('scaleX(3.14)')).toEqual([{ scaleX: 3.14 }]);
  });

  test('scaleY', () => {
    expect(parseTransform('scaleY(3.14)')).toEqual([{ scaleY: 3.14 }]);
  });

  test('scaleZ', () => {
    expect(parseTransform('scaleZ(3.14)')).toEqual([{ scaleZ: 3.14 }]);
  });

  test('translateX', () => {
    expect(parseTransform('translateX(10px)')).toEqual([{ translateX: 10 }]);
  });

  test('translateY', () => {
    expect(parseTransform('translateY(10px)')).toEqual([{ translateY: 10 }]);
  });

  test('skewX', () => {
    expect(parseTransform('skewX(10deg)')).toEqual([{ skewX: '10deg' }]);
  });

  test('skewY', () => {
    expect(parseTransform('skewY(10deg)')).toEqual([{ skewY: '10deg' }]);
  });

  test('matrix', () => {
    expect(parseTransform('matrix(1, 2, 3, 4, 5, 6)')).toEqual([
      { matrix: [1, 2, 0, 0, 3, 4, 0, 0, 0, 0, 1, 0, 5, 6, 0, 1] }
    ]);
  });

  test('matrix translation', () => {
    expect(parseTransform('matrix(1, 0, 0, 1, 12, -34)')).toEqual([
      { matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 12, -34, 0, 1] }
    ]);
  });

  test('multiple transforms', () => {
    expect(parseTransform('translateX(10px) scaleX(1.3)')).toEqual([
      { translateX: 10 },
      { scaleX: 1.3 }
    ]);
  });

  test('scientific notation', () => {
    expect(parseTransform('translateX(-1e3px)')).toEqual([
      { translateX: -1000 }
    ]);
    expect(parseTransform('translateX(1e-2px)')).toEqual([
      { translateX: 0.01 }
    ]);
  });

  test('invalid transform', () => {
    const invalidTransforms = [
      '',
      'foo',
      'translateX(E2)',
      'translateZ(10px)',
      'matrix(1, 2, foo, 4, 5, 6)',
      'matrix(1, 2)'
    ];
    for (const invalidTransform of invalidTransforms) {
      expect(parseTransform(invalidTransform)).toEqual([]);
    }
  });
});
