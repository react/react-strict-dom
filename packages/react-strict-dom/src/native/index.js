/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {
  StyleXStyles,
  StyleXStylesWithout,
  StaticStyles,
  Theme,
  VarGroup
} from '@stylexjs/stylex';

import typeof * as TStyleX from '@stylexjs/stylex';

import * as React from 'react';
import * as compat from './compat';
import * as html from './html';
import * as _css from './css';
import { ProvideCustomProperties } from './modules/ContextCustomProperties';
import {
  ProvideViewportScale,
  useViewportScale
} from './modules/ContextViewportScale';
import { useNativeProps } from './modules/useNativeProps';
import { useStrictDOMElement } from './modules/useStrictDOMElement';
import { isPropAllowed } from '../shared/isPropAllowed';

type StyleTheme<V, T> = Theme<V, T>;
type StyleVars<T> = VarGroup<T>;
type Styles<T> = StyleXStyles<T>;
type StylesWithout<T> = StyleXStylesWithout<T>;

type ProviderValue = Readonly<{ [string]: string | number }>;

type ProviderProps = Readonly<{
  children: React.Node,
  customProperties: ProviderValue
}>;

export type { StaticStyles, StyleTheme, StyleVars, Styles, StylesWithout };

function ThemeProvider(props: ProviderProps): React.Node {
  const { children, customProperties } = props;

  return customProperties ? (
    <ProvideCustomProperties children={children} value={customProperties} />
  ) : (
    children
  );
}

const contexts = {
  ThemeProvider: ThemeProvider as typeof ThemeProvider,
  ViewportProvider: ProvideViewportScale as typeof ProvideViewportScale
};

// Export using StyleX types as the shim has divergent types internally.
const css: TStyleX = _css as $FlowFixMe;

export {
  compat,
  contexts,
  css,
  html,
  useViewportScale as useViewportScale_DO_NOT_USE,
  useNativeProps as useNativeProps_DO_NOT_USE,
  useStrictDOMElement as useStrictDOMElement_DO_NOT_USE,
  isPropAllowed as isPropAllowed_DO_NOT_USE
};
