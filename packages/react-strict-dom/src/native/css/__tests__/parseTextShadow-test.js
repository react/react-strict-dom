/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { parseTextShadow } from '../parseTextShadow';

describe('parseTextShadow', () => {
  test('parses offsets, blur radius and color', () => {
    expect(parseTextShadow('1px 2px 3px red')).toEqual({
      textShadowColor: 'red',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 3
    });
  });

  test('parses a trailing color with a negative offset', () => {
    expect(parseTextShadow('1px -2px 3px red')).toEqual({
      textShadowColor: 'red',
      textShadowOffset: { width: 1, height: -2 },
      textShadowRadius: 3
    });
  });

  test('parses a negative offset when no color is provided', () => {
    // The vertical offset is negative and is the last token. It must be
    // treated as a length, not as a color.
    expect(parseTextShadow('1px -2px')).toEqual({
      textShadowColor: null,
      textShadowOffset: { width: 1, height: -2 },
      textShadowRadius: undefined
    });
  });

  test('parses a color that precedes the offset values', () => {
    // CSS allows the color to be specified before or after the offsets.
    expect(parseTextShadow('red 1px 2px 3px')).toEqual({
      textShadowColor: 'red',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 3
    });
  });

  test('parses a decimal blur radius when no color is provided', () => {
    // The blur radius is a decimal length and is the last token. It must be
    // treated as a length, not as a color.
    expect(parseTextShadow('1px 1px 2.5px')).toEqual({
      textShadowColor: null,
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2.5
    });
  });
});
