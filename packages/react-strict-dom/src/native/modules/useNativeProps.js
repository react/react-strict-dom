/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { CustomProperties } from '../../types/styles';
import type {
  GestureResponderEvent,
  ReactNativeProps
} from '../../types/renderer.native';
import type { StrictProps as StrictPropsOriginal } from '../../types/StrictProps';
import type { Style } from '../../types/styles';

import { errorMsg, warnMsg } from '../../shared/logUtils';
import { extractStyleThemes } from './extractStyleThemes';
import { isPropAllowed } from '../../shared/isPropAllowed';
import { useCustomProperties } from './ContextCustomProperties';
import { useStyleProps } from './useStyleProps';

type StrictProps = Readonly<{
  ...StrictPropsOriginal,
  children?: React.Node | ((ReactNativeProps) => React.Node)
}>;

/**
 * Props validation
 */
const unsupportedProps = new Set([
  'onBeforeInput',
  'onInvalid',
  'onSelect',
  'onSelectionChange'
]);

function validateStrictProps(props: StrictProps) {
  Object.keys(props).forEach((key) => {
    const isValidProp = isPropAllowed(key);
    const isUnsupportedProp = unsupportedProps.has(key);
    if (!isValidProp) {
      errorMsg(`invalid prop "${key}"`);
    }
    if (isUnsupportedProp) {
      warnMsg(`unsupported prop "${key}"`);
    }
  });
}

/**
 * Utility to merge event handlers. `a` and `b` receive different event shapes at
 * runtime but the merged handler forwards the same event to both for side effects.
 */
function combineEventHandlers<A, B>(
  a: ?(event: A) => void,
  b: ?(event: B) => void
): ?(event: B) => void {
  if (a == null) {
    return b;
  }
  return (e: B) => {
    if (typeof a === 'function') {
      a(e as $FlowFixMe);
    }
    if (typeof b === 'function') {
      b(e);
    }
  };
}

// Plain (non-hook) helper so it can mutate the caller-owned `nativeProps` (built
// fresh each render by `useStyleProps`) without a defensive copy.
function applyHtmlProps(
  nativeProps: ReactNativeProps,
  props: StrictProps
): void {
  const {
    'aria-busy': ariaBusy,
    'aria-checked': ariaChecked,
    'aria-disabled': ariaDisabled,
    'aria-expanded': ariaExpanded,
    'aria-hidden': ariaHidden,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-live': ariaLive,
    'aria-modal': ariaModal,
    'aria-posinset': ariaPosInSet,
    'aria-selected': ariaSelected,
    'aria-setsize': ariaSetSize,
    'aria-valuemax': ariaValueMax,
    'aria-valuemin': ariaValueMin,
    'aria-valuenow': ariaValueNow,
    'aria-valuetext': ariaValueText,
    children,
    'data-testid': dataTestID,
    hidden,
    id,
    onBlur,
    onClick,
    onFocus,
    onGotPointerCapture,
    onLostPointerCapture,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseOut,
    onMouseOver,
    onMouseUp,
    onPointerCancel,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerMove,
    onPointerOut,
    onPointerOver,
    onPointerUp,
    onScroll,
    onTouchCancel,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
    role,
    tabIndex
  } = props;

  const displayValue = nativeProps.style.display;
  // 'hidden' polyfill (only if "display" is not set)
  if (displayValue == null && hidden && hidden !== 'until-found') {
    nativeProps.style.display = 'none';
  }

  /**
   * Resolve common props
   */

  if (typeof children !== 'function') {
    nativeProps.children = children;
  }

  if (ariaHidden != null) {
    nativeProps.accessibilityElementsHidden = ariaHidden;
    if (ariaHidden === true) {
      nativeProps.importantForAccessibility = 'no-hide-descendants';
    }
  }
  if (ariaLabel != null) {
    nativeProps.accessibilityLabel = ariaLabel;
  }
  if (ariaLabelledBy != null) {
    nativeProps.accessibilityLabelledBy = ariaLabelledBy?.split(/\s*,\s*/g);
  }
  if (ariaLive != null) {
    nativeProps.accessibilityLiveRegion =
      ariaLive === 'off' ? 'none' : ariaLive;
  }
  if (ariaModal != null) {
    nativeProps.accessibilityViewIsModal = ariaModal;
  }
  if (ariaPosInSet != null) {
    nativeProps.accessibilityPosInSet = ariaPosInSet;
  }
  const ariaRole = role;
  if (ariaRole) {
    nativeProps.role = ariaRole;
  }
  if (ariaSetSize != null) {
    nativeProps.accessibilitySetSize = ariaSetSize;
  }
  if (
    ariaBusy != null ||
    ariaChecked != null ||
    ariaDisabled != null ||
    ariaExpanded != null ||
    ariaSelected != null
  ) {
    nativeProps.accessibilityState = {
      busy: ariaBusy,
      checked: ariaChecked,
      disabled: ariaDisabled,
      expanded: ariaExpanded,
      selected: ariaSelected
    };
  }
  if (
    ariaValueMax != null ||
    ariaValueMin != null ||
    ariaValueNow != null ||
    ariaValueText != null
  ) {
    nativeProps.accessibilityValue = {
      max: ariaValueMax,
      min: ariaValueMin,
      now: ariaValueNow,
      text: ariaValueText
    };
  }
  if (dataTestID != null) {
    nativeProps.testID = dataTestID;
  }
  if (id != null) {
    nativeProps.nativeID = id;
  }
  if (tabIndex != null) {
    nativeProps.focusable = !tabIndex;
  }

  // Events

  if (onBlur != null) {
    nativeProps.onBlur = combineEventHandlers(nativeProps.onBlur, onBlur);
  }
  // TODO: remove once PointerEvent onClick is available
  if (onClick != null) {
    nativeProps.onPress = function (e: GestureResponderEvent) {
      const { nativeEvent } = e;
      const event: unknown = nativeEvent;
      let altKey = false;
      let ctrlKey = false;
      let metaKey = false;
      let shiftKey = false;
      let button = 0;
      if (event != null) {
        if (typeof event.altKey === 'boolean') {
          altKey = event.altKey;
        }
        if (typeof event.ctrlKey === 'boolean') {
          ctrlKey = event.ctrlKey;
        }
        if (typeof event.metaKey === 'boolean') {
          metaKey = event.metaKey;
        }
        if (typeof event.shiftKey === 'boolean') {
          shiftKey = event.shiftKey;
        }
        if (typeof event.button === 'number') {
          button = event.button;
        }
      }
      const getModifierState = (key: string): boolean => {
        switch (key) {
          case 'Alt':
            return altKey;
          case 'Control':
            return ctrlKey;
          case 'Meta':
            return metaKey;
          case 'Shift':
            return shiftKey;
          default:
            return false;
        }
      };
      onClick({
        altKey,
        button,
        ctrlKey,
        defaultPrevented: false,
        getModifierState,
        metaKey,
        pageX: nativeEvent.pageX,
        pageY: nativeEvent.pageY,
        preventDefault() {},
        shiftKey,
        stopPropagation() {},
        type: 'click'
      });
    };
  }
  if (onFocus != null) {
    nativeProps.onFocus = combineEventHandlers(nativeProps.onFocus, onFocus);
  }
  if (onGotPointerCapture != null) {
    nativeProps.onGotPointerCapture = onGotPointerCapture;
  }
  if (onLostPointerCapture != null) {
    nativeProps.onLostPointerCapture = onLostPointerCapture;
  }
  if (onMouseDown != null) {
    nativeProps.onMouseDown = onMouseDown;
  }
  if (onMouseEnter != null) {
    nativeProps.onMouseEnter = combineEventHandlers(
      nativeProps.onMouseEnter,
      onMouseEnter
    );
  }
  if (onMouseLeave != null) {
    nativeProps.onMouseLeave = combineEventHandlers(
      nativeProps.onMouseLeave,
      onMouseLeave
    );
  }
  if (onMouseOut != null) {
    nativeProps.onMouseOut = onMouseOut;
  }
  if (onMouseOver != null) {
    nativeProps.onMouseOver = onMouseOver;
  }
  if (onMouseUp != null) {
    nativeProps.onMouseUp = onMouseUp;
  }
  if (onPointerCancel != null) {
    nativeProps.onPointerCancel = combineEventHandlers(
      nativeProps.onPointerCancel,
      onPointerCancel
    );
  }
  if (onPointerDown != null) {
    nativeProps.onPointerDown = combineEventHandlers(
      nativeProps.onPointerDown,
      onPointerDown
    );
  }
  if (onPointerEnter != null) {
    nativeProps.onPointerEnter = combineEventHandlers(
      nativeProps.onPointerEnter,
      onPointerEnter
    );
  }
  if (onPointerLeave != null) {
    nativeProps.onPointerLeave = combineEventHandlers(
      nativeProps.onPointerLeave,
      onPointerLeave
    );
  }
  if (onPointerMove != null) {
    nativeProps.onPointerMove = onPointerMove;
  }
  if (onPointerOut != null) {
    nativeProps.onPointerOut = onPointerOut;
  }
  if (onPointerOver != null) {
    nativeProps.onPointerOver = onPointerOver;
  }
  if (onPointerUp != null) {
    nativeProps.onPointerUp = combineEventHandlers(
      nativeProps.onPointerUp,
      onPointerUp
    );
  }
  if (onScroll != null) {
    nativeProps.onScroll = onScroll;
  }
  if (onTouchCancel != null) {
    nativeProps.onTouchCancel = onTouchCancel;
  }
  if (onTouchEnd != null) {
    nativeProps.onTouchEnd = onTouchEnd;
  }
  if (onTouchMove != null) {
    nativeProps.onTouchMove = onTouchMove;
  }
  if (onTouchStart != null) {
    nativeProps.onTouchStart = onTouchStart;
  }
}

/**
 * Produces the relevant React Native props to implement the global HTML props.
 */
type OptionsType = {|
  provideInheritableStyle: boolean,
  withTextStyle: boolean,
  withInheritedStyle: boolean
|};
type ReturnType = {|
  customProperties: ?CustomProperties,
  nativeProps: ReactNativeProps,
  inheritableStyle: ?Style
|};

export function useNativeProps(
  defaultProps: ?StrictProps,
  props: StrictProps,
  options: OptionsType
): ReturnType {
  if (__DEV__) {
    validateStrictProps(props);
  }

  const { dir, style } = props;

  /**
   * Resolve style props
   */

  const renderStyle = [defaultProps?.style ?? null, style];

  const [extractedStyle, customPropertiesFromThemes] =
    extractStyleThemes(renderStyle);
  const customProperties = useCustomProperties(customPropertiesFromThemes);

  const { nativeProps, inheritableStyle } = useStyleProps(extractedStyle, {
    customProperties,
    provideInheritableStyle: options.provideInheritableStyle,
    withTextStyle: options.withTextStyle,
    withInheritedStyle: options.withInheritedStyle,
    writingDirection: dir
  });

  applyHtmlProps(nativeProps, props);

  return {
    customProperties:
      customPropertiesFromThemes != null ? customProperties : null,
    nativeProps,
    inheritableStyle
  };
}
