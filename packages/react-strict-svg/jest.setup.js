/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

if (
  typeof HTMLElement !== 'undefined' &&
  typeof HTMLElement.prototype.animate !== 'function'
) {
  HTMLElement.prototype.animate = function () {
    return {
      finished: Promise.resolve(),
      cancel() {}
    };
  };
}
