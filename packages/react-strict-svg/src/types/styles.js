/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {
  InlineStyles,
  StyleXArray,
  StyleXStyles,
  Theme,
  VarGroup
} from '@stylexjs/stylex';

export type Style = InlineStyles;

export type Styles = StyleXArray<
  StyleXStyles<> | Theme<VarGroup<{ +[string]: unknown }>>
>;
