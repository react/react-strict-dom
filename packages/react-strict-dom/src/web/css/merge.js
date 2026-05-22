/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import { styleq } from 'styleq';

type CompiledStyle = Readonly<{
  $$css: true,
  [key: string]: string
}>;

type InlineStyle = Readonly<{
  $$css?: void,
  [key: string]: string
}>;

type StylesArray<out T> = T | ReadonlyArray<StylesArray<T>>;

type Props = Readonly<{
  className?: string,
  'data-style-src'?: string,
  style?: Readonly<{ [string]: string | number }>
}>;

const optimizedStyleq = styleq.factory({
  // ~25% faster than disableMix:false
  // Class and Style are merged independently; more cache hits.
  // 1. Inline styles can't be merged with compiled styles that have minified keys.
  // 2. Inline CSS Custom Properties drive the values of static styles
  disableMix: true
});

export function merge(
  ...styles: ReadonlyArray<
    StylesArray<
      ?boolean | ?CompiledStyle | ?Readonly<[CompiledStyle, InlineStyle]>
    >
  >
): Props {
  const [className, style, dataStyleSrc] = optimizedStyleq(styles);
  const result: {
    className?: string,
    'data-style-src'?: string,
    style?: Readonly<{ [string]: string | number }>
  } = {};
  if (className != null && className !== '') {
    result.className = className;
  }
  if (style != null) {
    result.style = style;
  }
  if (dataStyleSrc != null && dataStyleSrc !== '') {
    // Deduplicate paths from debug string if present
    // <path>:<line-1>; <path>:<line-2> => <path>:<line-1>,<line-2>
    const chunks = dataStyleSrc.split(';');
    const pathsMap: { [string]: string } = {};
    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      const [path, line] = trimmed.split(':');
      if (line != null) {
        pathsMap[path] =
          pathsMap[path] != null ? `${pathsMap[path]},${line}` : line;
      }
    }
    result['data-style-src'] = Object.keys(pathsMap)
      .map((path) => `${path}:${pathsMap[path]}`)
      .join('; ');
  }
  return result;
}
