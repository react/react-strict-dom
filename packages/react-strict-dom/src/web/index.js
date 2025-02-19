/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {
  StyleXStyles,
  StyleXStylesWithout,
  StaticStyles,
  Theme,
  VarGroup
} from '@stylexjs/stylex';

import * as html from './html';
import * as svg from './svg';
import * as css from '@stylexjs/stylex';

type StyleTheme<V, T> = Theme<V, T>;
type StyleVars<T> = VarGroup<T>;
type Styles<T> = StyleXStyles<T>;
type StylesWithout<T> = StyleXStylesWithout<T>;

export type { StaticStyles, StyleTheme, StyleVars, Styles, StylesWithout };

export { css, html, svg };
