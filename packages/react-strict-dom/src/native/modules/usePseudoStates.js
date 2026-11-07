/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Style } from '../../types/styles';

import * as React from 'react';

type InteractionHandlers = {
  onBlur?: () => void,
  onFocus?: () => void,
  onMouseEnter?: () => void,
  onMouseLeave?: () => void,
  onPointerCancel?: () => void,
  onPointerDown?: () => void,
  onPointerEnter?: () => void,
  onPointerLeave?: () => void,
  onPointerUp?: () => void
};

type Interaction = {
  active: boolean,
  focus: boolean,
  hover: boolean,
  handlers: ?InteractionHandlers
};

type PseudoState = {
  +active: boolean,
  +focus: boolean,
  +mouseHover: boolean,
  +pointerHover: boolean
};

const defaultState: PseudoState = {
  active: false,
  focus: false,
  mouseHover: false,
  pointerHover: false
};

export function usePseudoStates(style: Style): Interaction {
  const [state, setState] = React.useState<PseudoState>(defaultState);

  let isHoverStyledElement = false;
  let isFocusStyledElement = false;
  let isActiveStyledElement = false;

  for (const key in style) {
    const styleValue = style[key];
    if (styleValue != null && typeof styleValue === 'object') {
      if (styleValue.hasOwnProperty(':hover')) {
        isHoverStyledElement = true;
      }
      if (styleValue.hasOwnProperty(':focus')) {
        isFocusStyledElement = true;
      }
      if (styleValue.hasOwnProperty(':active')) {
        isActiveStyledElement = true;
      }
      if (
        isHoverStyledElement &&
        isFocusStyledElement &&
        isActiveStyledElement
      ) {
        break;
      }
    }
  }

  const handlers = React.useMemo(() => {
    let value = null;
    if (isHoverStyledElement || isFocusStyledElement || isActiveStyledElement) {
      const set = (changes: Partial<PseudoState>) =>
        setState((prev) => ({ ...prev, ...changes }));
      value = {} as InteractionHandlers;
      if (isHoverStyledElement) {
        value.onMouseEnter = () => set({ mouseHover: true });
        value.onMouseLeave = () => set({ mouseHover: false });
        value.onPointerEnter = () => set({ pointerHover: true });
      }
      if (isFocusStyledElement) {
        value.onBlur = () => set({ focus: false });
        value.onFocus = () => set({ focus: true });
      }
      if (isActiveStyledElement) {
        value.onPointerCancel = () => set({ active: false });
        value.onPointerDown = () => set({ active: true });
        value.onPointerUp = () => set({ active: false });
      }
      if (isHoverStyledElement || isActiveStyledElement) {
        value.onPointerLeave = () =>
          set({ active: false, pointerHover: false });
      }
    }
    return value;
  }, [isHoverStyledElement, isFocusStyledElement, isActiveStyledElement]);

  return {
    active: state.active,
    focus: state.focus,
    hover: state.mouseHover || state.pointerHover,
    handlers
  };
}
