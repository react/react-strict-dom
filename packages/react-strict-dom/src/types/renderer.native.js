/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

// $FlowFixMe[nonstrict-import]
import type AnimatedNode from 'react-native/Libraries/Animated/nodes/AnimatedNode';
import type {
  // $FlowFixMe[nonstrict-import]
  CompositeAnimation
} from 'react-native/Libraries/Animated/Animated';
import type {
  // $FlowFixMe[nonstrict-import]
  // $FlowFixMe[missing-export]
  Props as TextInputProps
} from 'react-native/Libraries/Components/TextInput/TextInput';
import type {
  // $FlowFixMe[nonstrict-import]
  ImageProps
} from 'react-native/Libraries/Image/ImageProps';
import type {
  // $FlowFixMe[missing-export]
  PressEvent,
  // $FlowFixMe[missing-export]
  SyntheticEvent
} from 'react-native/Libraries/Types/CoreEventTypes';
import type {
  // $FlowFixMe[nonstrict-import]
  ViewProps
} from 'react-native/Libraries/Components/View/ViewPropTypes';

type ReactNativeProps = {
  accessible?: ViewProps['accessible'],
  accessibilityLabel?: ViewProps['accessibilityLabel'],
  accessibilityLabelledBy?: ViewProps['accessibilityLabelledBy'],
  accessibilityLiveRegion?: ViewProps['accessibilityLiveRegion'],
  accessibilityElementsHidden?: ViewProps['accessibilityElementsHidden'],
  accessibilityPosInSet?: ?number,
  accessibilityState?: {
    busy?: ?boolean,
    checked?: ?boolean | 'mixed',
    disabled?: ?boolean,
    expanded?: ?boolean,
    selected?: ?boolean
  },
  accessibilitySetSize?: ?number,
  accessibilityValue?: {
    max?: ?number,
    min?: ?number,
    now?: ?number,
    text?: ?string
  },
  accessibilityViewIsModal?: ?boolean,
  autoCapitalize?: ?('none' | 'sentences' | 'words' | 'characters'),
  autoComplete?: ?string,
  alt?: ?Stringish,
  animated?: ?boolean, // non-standard
  caretHidden?: TextInputProps['caretHidden'],
  cursorColor?: TextInputProps['cursorColor'],
  children?: ?React.Node,
  crossOrigin?: ImageProps['crossOrigin'],
  defaultValue?: TextInputProps['defaultValue'],
  disabled?: ?boolean,
  editable?: TextInputProps['editable'],
  enterKeyHint?: TextInputProps['enterKeyHint'],
  focusable?: ?boolean,
  height?: ImageProps['height'],
  importantForAccessibility?: 'no-hide-descendants',
  inputMode?: TextInputProps['inputMode'],
  maxLength?: TextInputProps['maxLength'],
  multiline?: TextInputProps['multiline'],
  nativeID?: ViewProps['nativeID'],
  numberOfLines?: TextInputProps['numberOfLines'],
  onBlur?: ViewProps['onBlur'],
  onChange?: TextInputProps['onChange'],
  onError?: ImageProps['onError'],
  onFocus?: ViewProps['onFocus'],
  onGotPointerCapture?: ViewProps['onGotPointerCapture'],
  onKeyPress?: TextInputProps['onKeyPress'],
  onLoad?: ImageProps['onLoad'],
  onLostPointerCapture?: ViewProps['onLostPointerCapture'],
  onMouseDown?: $FlowFixMe,
  onMouseEnter?: $FlowFixMe,
  onMouseLeave?: $FlowFixMe,
  onMouseMove?: $FlowFixMe,
  onMouseOut?: $FlowFixMe,
  onMouseOver?: $FlowFixMe,
  onMouseUp?: $FlowFixMe,
  onPointerCancel?: ViewProps['onPointerCancel'],
  onPointerDown?: ViewProps['onPointerDown'],
  onPointerEnter?: ViewProps['onPointerEnter'],
  onPointerLeave?: ViewProps['onPointerLeave'],
  onPointerMove?: ViewProps['onPointerMove'],
  onPointerOut?: ViewProps['onPointerOut'],
  onPointerOver?: ViewProps['onPointerOver'],
  onPointerUp?: ViewProps['onPointerUp'],
  onPress?: ?(event: PressEvent) => void,
  onScroll?: $FlowFixMe,
  onSelectionChange?: TextInputProps['onSelectionChange'],
  onSubmitEditing?: TextInputProps['onSubmitEditing'],
  onTouchCancel?: ViewProps['onTouchCancel'],
  onTouchStart?: ViewProps['onTouchStart'],
  onTouchEnd?: ViewProps['onTouchEnd'],
  onTouchMove?: ViewProps['onTouchMove'],
  placeholder?: TextInputProps['placeholder'],
  placeholderTextColor?: TextInputProps['placeholderTextColor'],
  pointerEvents?: ViewProps['pointerEvents'],
  ref?: $FlowFixMe,
  referrerPolicy?: ImageProps['referrerPolicy'],
  readOnly?: TextInputProps['readOnly'],
  renderToHardwareTextureAndroid?: ViewProps['renderToHardwareTextureAndroid'],
  role?: ?string,
  secureTextEntry?: TextInputProps['secureTextEntry'],
  spellCheck?: TextInputProps['spellCheck'],
  src?: ImageProps['src'],
  srcSet?: ImageProps['srcSet'],
  style: ReactNativeStyle,
  testID?: ViewProps['testID'],
  value?: TextInputProps['value'],
  width?: ImageProps['width']
};

type ReactNativeTransform =
  | Readonly<{ matrix: number[] }>
  | Readonly<{ perspective: number }>
  | Readonly<{ rotate: string }>
  | Readonly<{ rotateX: string }>
  | Readonly<{ rotateY: string }>
  | Readonly<{ rotateZ: string }>
  | Readonly<{ scale: number }>
  | Readonly<{ scaleX: number }>
  | Readonly<{ scaleY: number }>
  | Readonly<{ scaleZ: number }>
  | Readonly<{ translateX: number | string }>
  | Readonly<{ translateY: number | string }>
  | Readonly<{ skewX: string }>
  | Readonly<{ skewY: string }>;

type ReactNativeStyleValue =
  | number
  | string
  | ReactNativeTransform[]
  | AnimatedNode;

type ReactNativeStyle = { [string]: ?ReactNativeStyleValue };

export type {
  CompositeAnimation,
  ReactNativeProps,
  ReactNativeStyle,
  ReactNativeStyleValue,
  ReactNativeTransform,
  SyntheticEvent
};
