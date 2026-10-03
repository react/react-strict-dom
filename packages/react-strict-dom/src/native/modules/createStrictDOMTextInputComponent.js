/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { CallbackRef } from '../../types/react';
import type {
  HostInstance,
  ReactNativeProps
} from '../../types/renderer.native';
import type { StrictReactDOMInputProps } from '../../types/StrictReactDOMInputProps';
import type { StrictReactDOMTextAreaProps } from '../../types/StrictReactDOMTextAreaProps';

import * as React from 'react';
import * as ReactNative from '../react-native';

import { errorMsg } from '../../shared/logUtils';
import { mergeRefs } from '../../shared/mergeRefs';
import { useNativeProps } from './useNativeProps';
import { useStrictDOMElement } from './useStrictDOMElement';

const AnimatedTextInput = ReactNative.Animated.createAnimatedComponent(
  ReactNative.TextInput
);

// Selection-cache polyfill view: `_selectionStart` / `_selectionEnd` are
// strict-dom-internal fields, not part of the public host instance type.
type SelectionCacheNode = {
  _selectionStart?: number,
  _selectionEnd?: number,
  ...
};

type StrictInputProps = StrictReactDOMInputProps | StrictReactDOMTextAreaProps;

// Helper to update cached selection state for selectionStart/End polyfill
function updateCachedSelection(
  node: ?HostInstance,
  selection: ?{ start: number, end: number }
) {
  if (node != null && selection != null) {
    // $FlowFixMe[class-object-subtyping] - write polyfill-only cache fields.
    const view: SelectionCacheNode = node;
    view._selectionStart = selection.start;
    view._selectionEnd = selection.end;
  }
}

// Plain (non-hook) helper so it can mutate the caller-owned `nativeProps`
// without a defensive copy (a hook may not mutate its own return value).
function applyTextInputProps(
  nativeProps: ReactNativeProps,
  props: StrictInputProps,
  tagName: string,
  mergedRef: CallbackRef<HostInstance>,
  cacheSelection: (selection: ?{ start: number, end: number }) => void
): void {
  const {
    autoCapitalize,
    autoComplete,
    defaultValue,
    disabled,
    enterKeyHint,
    inputMode,
    maxLength,
    onChange,
    onInput,
    onKeyDown,
    onSelectionChange,
    placeholder,
    readOnly,
    rows,
    spellCheck,
    type,
    value
  } = props;

  // Tag-specific props

  if (tagName === 'input') {
    let _inputMode = inputMode;
    if (type === 'email') {
      _inputMode = 'email';
    }
    if (type === 'search') {
      _inputMode = 'search';
    }
    if (type === 'tel') {
      _inputMode = 'tel';
    }
    if (type === 'url') {
      _inputMode = 'url';
    }
    if (type === 'number') {
      _inputMode = 'numeric';
    }
    if (_inputMode != null) {
      nativeProps.inputMode = _inputMode;
    }
    if (type === 'password') {
      nativeProps.secureTextEntry = true;
    }
    if (type === 'checkbox' || type === 'date' || type === 'radio') {
      if (__DEV__) {
        errorMsg(
          `<input type="${type}" /> is not implemented in React Native.`
        );
      }
    }
  } else if (tagName === 'textarea') {
    nativeProps.multiline = true;
    if (rows != null) {
      nativeProps.numberOfLines = rows;
    }
  }

  // Component-specific props

  if (autoCapitalize != null) {
    nativeProps.autoCapitalize = autoCapitalize;
  }
  if (autoComplete != null) {
    nativeProps.autoComplete = autoComplete;
  }
  if (defaultValue != null) {
    nativeProps.defaultValue = defaultValue;
  }
  if (disabled === true) {
    // polyfill disabled elements
    nativeProps.disabled = true;
    nativeProps.editable = false;
    nativeProps.focusable = false;
  }
  if (enterKeyHint != null) {
    nativeProps.enterKeyHint = enterKeyHint;
  }
  if (maxLength != null) {
    nativeProps.maxLength = maxLength;
  }
  if (onChange != null || onInput != null) {
    nativeProps.onChange = function (e) {
      const { text, selection } = e.nativeEvent;
      // Update cached selection state immediately to ensure sync with onChange
      cacheSelection(selection);
      if (onInput != null) {
        onInput({
          target: {
            value: text
          },
          type: 'input'
        });
      }
      if (onChange != null) {
        onChange({
          target: {
            value: text
          },
          type: 'change'
        });
      }
    };
  }
  if (onKeyDown != null) {
    nativeProps.onKeyPress = function (e) {
      const { key } = e.nativeEvent;
      // Filter out bad iOS keypress data on submit
      if (
        key === 'Backspace' ||
        (tagName === 'textarea' && key === 'Enter') ||
        key.length === 1
      ) {
        onKeyDown({
          key,
          type: 'keydown'
        });
      }
    };
    nativeProps.onSubmitEditing = function (e) {
      onKeyDown({
        key: 'Enter',
        type: 'keydown'
      });
    };
  }
  // Part of polyfill for selectionStart/End
  nativeProps.onSelectionChange = function (e) {
    const { selection } = e.nativeEvent;
    cacheSelection(selection);
    if (onSelectionChange != null) {
      onSelectionChange(e);
    }
  };
  if (placeholder != null) {
    nativeProps.placeholder = placeholder;
  }
  if (readOnly != null) {
    nativeProps.readOnly = readOnly;
  }
  if (spellCheck != null) {
    nativeProps.spellCheck = spellCheck;
  }
  if (value != null && typeof value === 'string') {
    nativeProps.value = value;
  }

  nativeProps.ref = mergedRef;
}

export function createStrictDOMTextInputComponent<
  T,
  P extends StrictInputProps
>(
  tagName: string,
  defaultProps?: P
): component(ref?: React.RefSetter<T>, ...P) {
  component Component(ref?: React.RefSetter<T>, ...props: P) {
    let NativeComponent:
      | typeof ReactNative.TextInput
      | typeof AnimatedTextInput = ReactNative.TextInput;
    const nodeRef = React.useRef<?HostInstance>(null);
    const elementRef = useStrictDOMElement<T>(ref, { tagName });

    /**
     * Resolve global HTML and style props
     */

    const { nativeProps } = useNativeProps(defaultProps, props, {
      provideInheritableStyle: false,
      withInheritedStyle: false,
      withTextStyle: true
    });

    const mergedRef = React.useMemo(
      () =>
        mergeRefs((node) => {
          nodeRef.current = node;
        }, elementRef),
      [elementRef]
    );
    // Reads nodeRef lazily so the ref object never enters the plain props
    // builder, which would trip react-rule-unsafe-ref.
    const cacheSelection = React.useCallback(
      (selection: ?{ start: number, end: number }) => {
        updateCachedSelection(nodeRef.current, selection);
      },
      []
    );

    applyTextInputProps(nativeProps, props, tagName, mergedRef, cacheSelection);

    // Use Animated components if necessary
    if (nativeProps.animated === true) {
      NativeComponent = AnimatedTextInput;
    }

    const element =
      typeof props.children === 'function' ? (
        props.children(nativeProps)
      ) : (
        // strict-dom's wide ReactNativeProps spreads onto RN's exact
        // TextInputProps; harmless extras are ignored at runtime.
        // $FlowFixMe[incompatible-type]
        // $FlowFixMe[incompatible-use]
        <NativeComponent {...nativeProps} />
      );

    return element;
  }

  // eslint-disable-next-line no-unreachable
  Component.displayName = `html.${tagName}`;
  return Component;
}
