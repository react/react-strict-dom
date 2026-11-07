/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { StyleEnvironment } from './StyleEnvironmentStore';

import * as React from 'react';

import {
  getStyleEnvironmentSnapshot,
  subscribeToStyleEnvironment
} from './StyleEnvironmentStore';

export function useStyleEnvironment(): StyleEnvironment {
  return React.useSyncExternalStore(
    subscribeToStyleEnvironment,
    getStyleEnvironmentSnapshot,
    getStyleEnvironmentSnapshot
  );
}
