/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const animatedNodeMarker = Symbol('AnimatedNode');

export function createAnimatedNode(config) {
  return Object.defineProperty({ ...config }, animatedNodeMarker, {
    value: true
  });
}

export default class AnimatedNode {
  static [Symbol.hasInstance](value) {
    return Boolean(value?.[animatedNodeMarker]);
  }
}
