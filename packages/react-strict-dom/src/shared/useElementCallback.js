/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { CallbackRef } from '../types/react';

import { useCallback, useRef } from 'react';

type OptionalCleanup = (() => void) | void;

/**
 * Constructs a callback ref with easy cleanup functionality. The supplied
 * callback is called with non-null host elements.
 *
 * When a new callback is supplied, the previous callbacks cleanup function
 * will be called first.
 *
 * WARNING: The callback should be stable (e.g. using `useCallback`).
 */
export function useElementCallback<T>(
  callback: (v: T) => OptionalCleanup
): CallbackRef<T> {
  const cleanupRef = useRef<OptionalCleanup>(undefined);
  return useCallback(
    (target) => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = undefined;
      }
      if (target != null) {
        cleanupRef.current = callback(target);
      }
    },
    [callback]
  );
}
