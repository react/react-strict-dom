/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { AutoComplete, StrictReactDOMProps } from './StrictReactDOMProps';

export type StrictReactDOMSelectProps = Readonly<{
  ...StrictReactDOMProps,
  autoComplete?: AutoComplete,
  defaultValue?: ?(Stringish | Array<Stringish>),
  disabled?: ?boolean,
  multiple?: ?boolean,
  name?: ?string,
  required?: ?boolean,
  onBeforeInput?: $FlowFixMe,
  onChange?: $FlowFixMe,
  onInput?: $FlowFixMe,
  onInvalid?: $FlowFixMe,
  onSelect?: $FlowFixMe,
  value?: ?(Stringish | Array<Stringish>)
}>;
