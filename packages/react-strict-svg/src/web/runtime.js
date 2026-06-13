/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { StrictReactDOMProps } from '../types/StrictReactDOMProps';

type StrictReactDOMPropsStyle = StrictReactDOMProps['style'];

import * as stylex from '@stylexjs/stylex';

// set this on the root, probably in the theme context
// const fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';

const styles = stylex.create({
  svg: {
    aspectRatio: 'attr(width) / attr(height)',
    height: 'auto',
    maxWidth: '100%'
  }
});

// $FlowFixMe[incompatible-type]
const svg: StrictReactDOMPropsStyle = styles.svg;

export const defaultStyles = {
  svg: svg as typeof svg
};
