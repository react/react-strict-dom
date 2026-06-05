/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { StrictReactDOMProps } from './StrictReactDOMProps';

import type { StrictReactDOMAnchorProps } from './StrictReactDOMAnchorProps';
import type { StrictReactDOMButtonProps } from './StrictReactDOMButtonProps';
import type { StrictReactDOMImageProps } from './StrictReactDOMImageProps';
import type { StrictReactDOMInputProps } from './StrictReactDOMInputProps';
import type { StrictReactDOMLabelProps } from './StrictReactDOMLabelProps';
import type { StrictReactDOMListItemProps } from './StrictReactDOMListItemProps';
import type { StrictReactDOMOptionProps } from './StrictReactDOMOptionProps';
import type { StrictReactDOMSelectProps } from './StrictReactDOMSelectProps';
import type { StrictReactDOMTextAreaProps } from './StrictReactDOMTextAreaProps';

export type StrictProps = Readonly<{
  ...StrictReactDOMProps,
  ...StrictReactDOMAnchorProps,
  ...StrictReactDOMButtonProps,
  ...StrictReactDOMImageProps,
  ...StrictReactDOMInputProps,
  ...StrictReactDOMLabelProps,
  ...StrictReactDOMListItemProps,
  ...StrictReactDOMOptionProps,
  ...StrictReactDOMSelectProps,
  ...StrictReactDOMTextAreaProps
}>;
