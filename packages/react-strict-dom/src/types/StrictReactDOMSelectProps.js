/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { AutoComplete, StrictReactDOMProps } from './StrictReactDOMProps';
import type {
  StrictChangeEvent,
  StrictInputEvent,
  StrictOpaqueEventHandler
} from './StrictReactDOMEvents';

export type StrictReactDOMSelectProps = Readonly<{
  ...StrictReactDOMProps,
  autoComplete?: AutoComplete,
  defaultValue?: ?(Stringish | Array<Stringish>),
  disabled?: ?boolean,
  multiple?: ?boolean,
  name?: ?string,
  required?: ?boolean,
  onBeforeInput?: StrictOpaqueEventHandler,
  onChange?: (event: StrictChangeEvent) => void,
  onInput?: (event: StrictInputEvent) => void,
  onInvalid?: StrictOpaqueEventHandler,
  onSelect?: StrictOpaqueEventHandler,
  value?: ?(Stringish | Array<Stringish>)
}>;
