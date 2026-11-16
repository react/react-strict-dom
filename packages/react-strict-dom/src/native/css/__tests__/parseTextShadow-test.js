/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { parseTextShadow } from '../parseTextShadow';

describe('parseTextShadow', () => {
  test('parses lengths followed by a color', () => {
    expect(parseTextShadow('1px 2px 3px red')).toEqual({
      textShadowColor: 'red',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 3
    });
  });

  test('parses a color that precedes the lengths', () => {
    expect(parseTextShadow('red 1px 2px 3px')).toEqual({
      textShadowColor: 'red',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 3
    });
  });

  test('parses functional colors', () => {
    expect(parseTextShadow('rgba(0, 0, 0, 0.5) 1px 2px')).toEqual({
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: undefined
    });
  });

  test('parses negative and decimal lengths without a color', () => {
    expect(parseTextShadow('2px -2px')).toEqual({
      textShadowColor: null,
      textShadowOffset: { width: 2, height: -2 },
      textShadowRadius: undefined
    });
    expect(parseTextShadow('-1px 0.5px 1.5px')).toEqual({
      textShadowColor: null,
      textShadowOffset: { width: -1, height: 0.5 },
      textShadowRadius: 1.5
    });
    expect(parseTextShadow('1px 1px .5px blue')).toEqual({
      textShadowColor: 'blue',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 0.5
    });
  });

  test('ignores repeated whitespace', () => {
    expect(parseTextShadow('1px  2px   red')).toEqual({
      textShadowColor: 'red',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: undefined
    });
  });
});
