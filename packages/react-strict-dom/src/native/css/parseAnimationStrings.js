/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

// Use Map for caching parsed animation strings
const parseCache = new Map<string, Array<string>>();

/**
 * Parses comma-separated animation strings while respecting parentheses.
 * Handles cubic-bezier(a, b, c, d) functions which contain commas that
 * should not be treated as separators.
 */
export function parseAnimationString(value: unknown): Array<string> {
  if (value == null || typeof value !== 'string') {
    return [''];
  }

  // Check string cache first - return same array reference for identical inputs
  if (typeof value === 'string' && parseCache.has(value)) {
    const cached = parseCache.get(value);
    // Flow refinement: we know cached is not undefined because has() returned true
    return cached != null ? cached : [''];
  }

  const result = [];
  let current = '';
  let parenDepth = 0;

  for (let i = 0; i < value.length; i++) {
    const char = value[i];

    if (char === '(') {
      parenDepth++;
      current += char;
    } else if (char === ')') {
      parenDepth--;
      current += char;
    } else if (char === ',' && parenDepth === 0) {
      // Comma outside parentheses - split here
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add final segment
  result.push(current.trim());

  // Cache result before returning to prevent infinite re-renders
  if (typeof value === 'string') {
    parseCache.set(value, result);
  }

  return result;
}
