/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import * as React from 'react';

export type CallbackRef<T> = (node: T | null) => unknown;
export type ObjectRef<T> = { writeonly current: T, ... };
export type Ref<T> = CallbackRef<T> | ObjectRef<T | null> | React.RefObject<T>;
