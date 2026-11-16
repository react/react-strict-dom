/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CSSUnparsedValue } from '../typed-om/CSSUnparsedValue';
import { resolveVariableReferences } from '../customProperties';

function resolve(registry, colorScheme) {
  return resolveVariableReferences(
    'color',
    CSSUnparsedValue.parse('color', 'var(--fg)'),
    registry,
    colorScheme
  );
}

describe('resolveVariableReferences', () => {
  test('uses the dark value in dark mode', () => {
    const registry = {
      fg: { default: 'black', '@media (prefers-color-scheme: dark)': 'white' }
    };
    expect(resolve(registry, 'light')).toBe('black');
    expect(resolve(registry, 'dark')).toBe('white');
  });

  test('falls back to the default value in dark mode when no dark value is defined', () => {
    const registry = {
      fg: { default: 'black', '@media (min-width: 400px)': 'gray' }
    };
    expect(resolve(registry, 'light')).toBe('black');
    expect(resolve(registry, 'dark')).toBe('black');
  });
});
