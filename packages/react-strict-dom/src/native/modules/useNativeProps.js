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
  ReactNativeProps,
  StrictReactNativeMetaProps
} from '../../types/renderer.native';
import type { StrictProps as StrictPropsOriginal } from '../../types/StrictProps';
import type { Style } from '../../types/styles';

import * as ReactNative from '../react-native';
import { CSSUnparsedValue } from '../css/typed-om/CSSUnparsedValue';
import {
  resolveVariableReferences,
  stringContainsVariables
} from '../css/customProperties';
import { errorMsg, warnMsg } from '../../shared/logUtils';
import { extractStyleThemes } from './extractStyleThemes';
import { isPropAllowed } from '../../shared/isPropAllowed';
import { useCustomProperties } from './ContextCustomProperties';
import { useStyleProps } from './useStyleProps';

export type ResolveStyleValue = (value: string) => string | number | null;

type StrictProps = Readonly<{
  ...StrictPropsOriginal,
  children?:
    | React.Node
    | ((ReactNativeProps, StrictReactNativeMetaProps) => React.Node)
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
 * Utility to merge event handlers
 */
type EventHandler =
  | ReactNativeProps['onBlur']
  | ReactNativeProps['onFocus']
  | ReactNativeProps['onMouseEnter']
  | ReactNativeProps['onMouseLeave']
  | ReactNativeProps['onPointerCancel']
  | ReactNativeProps['onPointerDown']
  | ReactNativeProps['onPointerEnter']
  | ReactNativeProps['onPointerUp']
  | ReactNativeProps['onPointerLeave'];

// $FlowFixMe[incompatible-type]
function combineEventHandlers(a: EventHandler, b: EventHandler): $FlowFixMe {
  if (a == null) {
    return b;
  } else {
    return (e) => {
      const returnA = typeof a === 'function' ? a(e) : null;
      const returnB = typeof b === 'function' ? b(e) : null;
      return returnB || returnA;
    };
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
  resolveStyleValue: ResolveStyleValue,
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
    dir,
    //disabled,
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
    style,
    tabIndex
  } = props;

  /**
   * Resolve style props
   */

  const renderStyle = [defaultProps?.style ?? null, style];

  const [extractedStyle, customPropertiesFromThemes] =
    extractStyleThemes(renderStyle);
  const customProperties = useCustomProperties(customPropertiesFromThemes);

  const colorScheme = ReactNative.useColorScheme();
  const resolveStyleValue: ResolveStyleValue = (value) => {
    if (typeof value !== 'string' || !stringContainsVariables(value)) {
      return value;
    }
    return resolveVariableReferences(
      'styleValue',
      CSSUnparsedValue.parse('styleValue', value),
      customProperties,
      colorScheme === 'dark' ? 'dark' : 'light'
    );
  };

  const { nativeProps, inheritableStyle } = useStyleProps(extractedStyle, {
    customProperties,
    provideInheritableStyle: options.provideInheritableStyle,
    withTextStyle: options.withTextStyle,
    withInheritedStyle: options.withInheritedStyle,
    writingDirection: dir
  });

  const displayValue = nativeProps.style.display;
  // 'hidden' polyfill (only if "display" is not set)
  if (displayValue == null && hidden && hidden !== 'until-found') {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.style.display = 'none';
  }

  /**
   * Resolve common props
   */

  if (typeof children !== 'function') {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.children = children;
  }

  if (ariaHidden != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.accessibilityElementsHidden = ariaHidden;
    if (ariaHidden === true) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.importantForAccessibility = 'no-hide-descendants';
    }
  }
  if (ariaLabel != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.accessibilityLabel = ariaLabel;
  }
  if (ariaLabelledBy != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.accessibilityLabelledBy = ariaLabelledBy?.split(/\s*,\s*/g);
  }
  if (ariaLive != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.accessibilityLiveRegion =
      ariaLive === 'off' ? 'none' : ariaLive;
  }
  if (ariaModal != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.accessibilityViewIsModal = ariaModal;
  }
  if (ariaPosInSet != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.accessibilityPosInSet = ariaPosInSet;
  }
  const ariaRole = role;
  if (ariaRole) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.role = ariaRole;
  }
  if (ariaSetSize != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.accessibilitySetSize = ariaSetSize;
  }
  if (
    ariaBusy != null ||
    ariaChecked != null ||
    ariaDisabled != null ||
    ariaExpanded != null ||
    ariaSelected != null
  ) {
    // $FlowFixMe[react-rule-hook-mutation]
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
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.accessibilityValue = {
      max: ariaValueMax,
      min: ariaValueMin,
      now: ariaValueNow,
      text: ariaValueText
    };
  }
  if (dataTestID != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.testID = dataTestID;
  }
  if (id != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.nativeID = id;
  }
  if (tabIndex != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.focusable = !tabIndex;
  }

  // Events

  if (onBlur != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onBlur = combineEventHandlers(nativeProps.onBlur, onBlur);
  }
  // TODO: remove once PointerEvent onClick is available
  if (onClick != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    // $FlowFixMe[missing-local-annot]
    nativeProps.onPress = function ({ nativeEvent }) {
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
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onFocus = combineEventHandlers(nativeProps.onFocus, onFocus);
  }
  if (onGotPointerCapture != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onGotPointerCapture = onGotPointerCapture;
  }
  if (onLostPointerCapture != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onLostPointerCapture = onLostPointerCapture;
  }
  if (onMouseDown != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onMouseDown = onMouseDown;
  }
  if (onMouseEnter != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onMouseEnter = combineEventHandlers(
      nativeProps.onMouseEnter,
      onMouseEnter
    );
  }
  if (onMouseLeave != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onMouseLeave = combineEventHandlers(
      nativeProps.onMouseLeave,
      onMouseLeave
    );
  }
  if (onMouseOut != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onMouseOut = onMouseOut;
  }
  if (onMouseOver != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onMouseOver = onMouseOver;
  }
  if (onMouseUp != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onMouseUp = onMouseUp;
  }
  if (onPointerCancel != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onPointerCancel = combineEventHandlers(
      nativeProps.onPointerCancel,
      onPointerCancel
    );
  }
  if (onPointerDown != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onPointerDown = combineEventHandlers(
      nativeProps.onPointerDown,
      onPointerDown
    );
  }
  if (onPointerEnter != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onPointerEnter = combineEventHandlers(
      nativeProps.onPointerEnter,
      onPointerEnter
    );
  }
  if (onPointerLeave != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onPointerLeave = combineEventHandlers(
      nativeProps.onPointerLeave,
      onPointerLeave
    );
  }
  if (onPointerMove != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onPointerMove = onPointerMove;
  }
  if (onPointerOut != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onPointerOut = onPointerOut;
  }
  if (onPointerOver != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onPointerOver = onPointerOver;
  }
  if (onPointerUp != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onPointerUp = combineEventHandlers(
      nativeProps.onPointerUp,
      onPointerUp
    );
  }
  if (onScroll != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onScroll = onScroll;
  }
  if (onTouchCancel != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onTouchCancel = onTouchCancel;
  }
  if (onTouchEnd != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onTouchEnd = onTouchEnd;
  }
  if (onTouchMove != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onTouchMove = onTouchMove;
  }
  if (onTouchStart != null) {
    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.onTouchStart = onTouchStart;
  }

  return {
    customProperties:
      customPropertiesFromThemes != null ? customProperties : null,
    resolveStyleValue,
    nativeProps,
    inheritableStyle
  };
}
