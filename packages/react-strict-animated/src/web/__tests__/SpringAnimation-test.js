/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import SpringAnimation from '../animations/SpringAnimation';

describe('SpringAnimation (web)', () => {
  test('rejects a non-positive stiffness value', () => {
    expect(
      () => new SpringAnimation({ toValue: 1, stiffness: 0, damping: 10, mass: 1 })
    ).toThrow('Stiffness value must be greater than 0');
  });

  test('rejects a non-positive damping value', () => {
    expect(
      () => new SpringAnimation({ toValue: 1, stiffness: 100, damping: 0, mass: 1 })
    ).toThrow('Damping value must be greater than 0');
  });

  test('rejects a non-positive mass value', () => {
    expect(
      () => new SpringAnimation({ toValue: 1, stiffness: 100, damping: 10, mass: 0 })
    ).toThrow('Mass value must be greater than 0');
  });
});
