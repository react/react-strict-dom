/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

type Milliseconds = number;

const memoizedValues = new Map<string, Milliseconds>();

export function parseTimeValue(timeValue: string): Milliseconds {
  const memoizedValue = memoizedValues.get(timeValue);
  if (memoizedValue != null) {
    return memoizedValue;
  }
  const trimmedTimeValue = timeValue.trim().toLowerCase();
  if (trimmedTimeValue.endsWith('ms')) {
    const msVal = parseFloat(trimmedTimeValue.slice(0, -2));
    const normalizedValue = Number.isFinite(msVal) ? msVal : 0;
    memoizedValues.set(timeValue, normalizedValue);
    return normalizedValue;
  }
  if (trimmedTimeValue.endsWith('s')) {
    const sVal = parseFloat(trimmedTimeValue.slice(0, -1));
    const normalizedValue = Number.isFinite(sVal) ? sVal * 1000 : 0;
    memoizedValues.set(timeValue, normalizedValue);
    return normalizedValue;
  }

  const numericValue = parseFloat(trimmedTimeValue);
  if (Number.isFinite(numericValue)) {
    memoizedValues.set(timeValue, numericValue);
    return numericValue;
  }

  return 0;
}
