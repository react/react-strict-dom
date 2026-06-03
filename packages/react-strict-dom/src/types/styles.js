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

import typeof * as TStyleX from '@stylexjs/stylex';

export type Style = InlineStyles;

export type Styles = StyleXArray<
  StyleXStyles<> | Theme<VarGroup<{ readonly [string]: unknown }>>
>;

export type IStyleX = Readonly<{
  create: TStyleX['create'],
  createTheme: TStyleX['createTheme'],
  defineConsts: TStyleX['defineConsts'],
  defineVars: TStyleX['defineVars'],
  firstThatWorks: TStyleX['firstThatWorks'],
  keyframes: TStyleX['keyframes'],
  positionTry: TStyleX['positionTry'],
  props: TStyleX['props'],
  ...
}>;

export type MutableCustomProperties = { [string]: unknown };
export type CustomProperties = Readonly<MutableCustomProperties>;
