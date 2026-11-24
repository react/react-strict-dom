/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { mediaQuery } from '../modules/mediaQuery';

const MEDIA = '@media';

export type MediaQueryContext = Readonly<{
  colorScheme: ?('light' | 'dark'),
  prefersReducedMotion: boolean,
  viewportHeight: number,
  viewportWidth: number,
  ...
}>;

export function mediaQueryMatches(
  query: string,
  context: MediaQueryContext
): boolean {
  const {
    colorScheme,
    prefersReducedMotion,
    viewportHeight: height,
    viewportWidth: width
  } = context;
  const q = query.split(MEDIA)[1];
  try {
    return mediaQuery.match(q, {
      width,
      height,
      orientation: width > height ? 'landscape' : 'portrait',
      'aspect-ratio': width / height,
      'prefers-color-scheme': colorScheme ?? 'light',
      'prefers-reduced-motion': prefersReducedMotion
        ? 'reduce'
        : 'no-preference'
    });
  } catch (error) {
    // A valid web query may use syntax the native parser does not support.
    if (error instanceof SyntaxError || error instanceof TypeError) {
      return false;
    }
    throw error;
  }
}
