/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export type ReactDOMStyleProps = Readonly<{
  className?: string,
  'data-style-src'?: string,
  style?: Readonly<{ [key: string]: string | number }>
}>;
