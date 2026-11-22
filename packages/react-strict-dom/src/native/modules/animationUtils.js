/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { ReactNativeStyle } from '../../types/renderer.native';
import type {
  AnimationDirection,
  AnimationFillMode,
  AnimationPlayState,
  AnimationComposition
} from '../../types/animation';
import { AnimationController } from './AnimationController';

import {
  isNumber,
  isString,
  parseAnimationTimeValue,
  canUseNativeDriver,
  canUseNativeDriverForProperties,
  getEasingFunction,
  collectAnimatedProperties
} from './sharedAnimationUtils';
import { warnMsg } from '../../shared/logUtils';
import { keyframeRegistry } from '../css/keyframeRegistry';
import { getInterpolatedStyle } from '../css/animationInterpolation';
import { parseAnimationString } from '../css/parseAnimationStrings';
import { parseTransform } from '../css/parseTransform';

export function handleAnimationError(
  error: Error | unknown,
  context: string
): void {
  if (__DEV__) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    warnMsg(`${context}: ${errorMessage}`);
  }
}

export const ANIMATION_PROPERTIES: ReadonlyArray<string> = [
  'animationName',
  'animationDuration',
  'animationDelay',
  'animationTimingFunction',
  'animationIterationCount',
  'animationDirection',
  'animationFillMode',
  'animationPlayState',
  'animationComposition'
];

export {
  isNumber,
  isString,
  parseAnimationTimeValue,
  canUseNativeDriver,
  canUseNativeDriverForProperties,
  getEasingFunction,
  collectAnimatedProperties
};

function parseTransformString(transformString: unknown) {
  if (typeof transformString === 'string') {
    try {
      return parseTransform(transformString).resolveTransformValue();
    } catch (error) {
      handleAnimationError(error, 'Transform string parsing');
      return [];
    }
  }
  return [];
}

export function parseAnimationIterationCount(
  value: unknown
): number | 'infinite' {
  if (value === 'infinite') {
    return 'infinite';
  }
  if (isNumber(value)) {
    return Math.max(0, value);
  }
  if (isString(value)) {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return Math.max(0, parsed);
    }
  }
  return 1;
}

export function parseAnimationDirection(value: unknown): AnimationDirection {
  if (
    value === 'normal' ||
    value === 'reverse' ||
    value === 'alternate' ||
    value === 'alternate-reverse'
  ) {
    return value;
  }
  return 'normal';
}

export function parseAnimationFillMode(value: unknown): AnimationFillMode {
  if (
    value === 'none' ||
    value === 'forwards' ||
    value === 'backwards' ||
    value === 'both'
  ) {
    return value;
  }
  return 'none';
}

export function parseAnimationPlayState(value: unknown): AnimationPlayState {
  if (value === 'paused' || value === 'running') {
    return value;
  }
  return 'running';
}

export function parseAnimationComposition(
  value: unknown
): AnimationComposition {
  if (value === 'replace' || value === 'add' || value === 'accumulate') {
    return value;
  }
  return 'replace';
}

/**
 * Create optimized animation configuration with native driver detection.
 */
export function createOptimizedAnimationConfig(config: {
  properties: Array<string>,
  keyframes?: { [string]: unknown },
  ...
}): { useNativeDriver: boolean, ... } {
  const { properties, keyframes } = config;

  let canUseNative = canUseNativeDriverForProperties(properties);

  if (canUseNative && keyframes) {
    canUseNative = canUseNativeDriver(keyframes);
  }

  return {
    ...config,
    useNativeDriver: canUseNative
  };
}

/**
 * Cycle source array to create target array of specified length.
 * CSS spec behavior: [a,b] with length 3 becomes [a,b,a]
 */
export function cycleTo<T>(
  sourceArray: Array<T>,
  targetLength: number
): Array<T> {
  if (targetLength <= 0) return [];
  if (sourceArray.length === 0) return [];

  const result = [];
  for (let i = 0; i < targetLength; i++) {
    result.push(sourceArray[i % sourceArray.length]);
  }
  return result;
}

export type AnimationArrays = {
  animationName: Array<string>,
  animationDuration: Array<string>,
  animationDelay: Array<string>,
  animationTimingFunction: Array<string>,
  animationIterationCount: Array<string>,
  animationDirection: Array<string>,
  animationFillMode: Array<string>,
  animationPlayState: Array<string>,
  animationComposition: Array<string>,
  ...
};

/**
 * Extract animation properties and convert to arrays using string parsing.
 */
export function extractAnimationArrays(
  animationProps: AnimationPropsType
): AnimationArrays {
  const animationName = animationProps.animationName;
  const animationDuration = animationProps.animationDuration;
  const animationDelay = animationProps.animationDelay;
  const animationTimingFunction = animationProps.animationTimingFunction;
  const animationIterationCount = animationProps.animationIterationCount;
  const animationDirection = animationProps.animationDirection;
  const animationFillMode = animationProps.animationFillMode;
  const animationPlayState = animationProps.animationPlayState;
  const animationComposition = animationProps.animationComposition;

  return {
    animationName: parseAnimationString(
      animationName != null ? String(animationName) : ''
    ).filter((name) => typeof name === 'string' && name.trim() !== ''),
    animationDuration: parseAnimationString(
      animationDuration != null ? String(animationDuration) : '0s'
    ),
    animationDelay: parseAnimationString(
      animationDelay != null ? String(animationDelay) : '0s'
    ),
    animationTimingFunction: parseAnimationString(
      animationTimingFunction != null ? String(animationTimingFunction) : 'ease'
    ),
    animationIterationCount: parseAnimationString(
      animationIterationCount != null ? String(animationIterationCount) : '1'
    ),
    animationDirection: parseAnimationString(
      animationDirection != null ? String(animationDirection) : 'normal'
    ),
    animationFillMode: parseAnimationString(
      animationFillMode != null ? String(animationFillMode) : 'none'
    ),
    animationPlayState: parseAnimationString(
      animationPlayState != null ? String(animationPlayState) : 'running'
    ),
    animationComposition: parseAnimationString(
      animationComposition != null ? String(animationComposition) : 'replace'
    )
  };
}

export type NormalizedAnimationArrays = {
  animationName: Array<string>,
  animationDuration: Array<string>,
  animationDelay: Array<string>,
  animationTimingFunction: Array<string>,
  animationIterationCount: Array<string>,
  animationDirection: Array<string>,
  animationFillMode: Array<string>,
  animationPlayState: Array<string>,
  animationComposition: Array<string>,
  animationCount: number,
  ...
};

/**
 * Extract animation properties from style before React Native strips them.
 */
// Cache to prevent infinite re-renders
const animationPropsCache = new Map<
  string,
  ?{
    animationName?: string,
    animationDuration?: string,
    animationDelay?: string,
    animationTimingFunction?: string,
    animationIterationCount?: unknown,
    animationDirection?: string,
    animationFillMode?: string,
    animationPlayState?: string,
    animationComposition?: string
  }
>();

export function extractAnimationProperties(style: ReactNativeStyle): ?{
  animationName?: string,
  animationDuration?: string,
  animationDelay?: string,
  animationTimingFunction?: string,
  animationIterationCount?: unknown,
  animationDirection?: string,
  animationFillMode?: string,
  animationPlayState?: string,
  animationComposition?: string
} {
  const animationKeys = [
    'animationName',
    'animationDuration',
    'animationDelay',
    'animationTimingFunction',
    'animationIterationCount',
    'animationDirection',
    'animationFillMode',
    'animationPlayState',
    'animationComposition'
  ];

  const cacheKeyParts: Array<string> = [];
  for (const key of animationKeys) {
    const value = style[key];
    cacheKeyParts.push(`${key}:${value == null ? 'null' : String(value)}`);
  }
  const cacheKey = cacheKeyParts.join('|');

  if (animationPropsCache.has(cacheKey)) {
    return animationPropsCache.get(cacheKey);
  }
  const animationProps: {
    animationName?: string,
    animationDuration?: string,
    animationDelay?: string,
    animationTimingFunction?: string,
    animationIterationCount?: unknown,
    animationDirection?: string,
    animationFillMode?: string,
    animationPlayState?: string,
    animationComposition?: string
  } = {};
  let hasAnimation = false;

  for (const key of animationKeys) {
    const value = style[key];
    if (value != null) {
      if (key === 'animationIterationCount') {
        animationProps.animationIterationCount = value;
      } else if (key === 'animationName') {
        animationProps.animationName = String(value);
      } else if (key === 'animationDuration') {
        animationProps.animationDuration = String(value);
      } else if (key === 'animationDelay') {
        animationProps.animationDelay = String(value);
      } else if (key === 'animationTimingFunction') {
        animationProps.animationTimingFunction = String(value);
      } else if (key === 'animationDirection') {
        animationProps.animationDirection = String(value);
      } else if (key === 'animationFillMode') {
        animationProps.animationFillMode = String(value);
      } else if (key === 'animationPlayState') {
        animationProps.animationPlayState = String(value);
      } else if (key === 'animationComposition') {
        animationProps.animationComposition = String(value);
      }
      hasAnimation = true;
    }
  }

  const result = hasAnimation ? animationProps : null;
  animationPropsCache.set(cacheKey, result);

  return result;
}

export type AnimationPropsType = {
  animationName?: string,
  animationDuration?: string,
  animationDelay?: string,
  animationTimingFunction?: string,
  animationIterationCount?: unknown,
  animationDirection?: string,
  animationFillMode?: string,
  animationPlayState?: string,
  animationComposition?: string
};

/**
 * Normalize animation arrays per CSS specification.
 * animationName controls count, other properties cycle to match.
 */
export function normalizeAnimationArrays(
  animationProps: AnimationPropsType
): NormalizedAnimationArrays | null {
  try {
    const arrays = extractAnimationArrays(animationProps);

    if (arrays.animationName.length === 0) {
      return null;
    }
    const validAnimationNames = arrays.animationName.filter((name) => {
      const keyframes = keyframeRegistry.resolve(name);
      if (!keyframes) {
        handleAnimationError(
          new Error(`Animation "${name}" keyframes not found`),
          'Keyframe validation'
        );
        return false;
      }
      return true;
    });

    if (validAnimationNames.length === 0) {
      return null;
    }
    const animationCount = validAnimationNames.length;

    return {
      animationName: validAnimationNames,
      animationDuration: cycleTo(arrays.animationDuration, animationCount),
      animationDelay: cycleTo(arrays.animationDelay, animationCount),
      animationTimingFunction: cycleTo(
        arrays.animationTimingFunction,
        animationCount
      ),
      animationIterationCount: cycleTo(
        arrays.animationIterationCount,
        animationCount
      ),
      animationDirection: cycleTo(arrays.animationDirection, animationCount),
      animationFillMode: cycleTo(arrays.animationFillMode, animationCount),
      animationPlayState: cycleTo(arrays.animationPlayState, animationCount),
      animationComposition: cycleTo(
        arrays.animationComposition,
        animationCount
      ),
      animationCount
    };
  } catch (error) {
    handleAnimationError(error, 'Animation normalization');
    return null;
  }
}

/**
 * Add numeric values with unit support (e.g., px, deg, %).
 */
function addNumericValues(
  baseValue: unknown,
  values: Array<unknown>
): number | string {
  const parseValueAndUnit = (val: unknown): { value: number, unit: string } => {
    if (typeof val === 'number') {
      return { value: val, unit: '' };
    }
    if (typeof val === 'string') {
      const match = val.match(/^(-?\d*\.?\d+)(.*)$/);
      if (match) {
        return { value: parseFloat(match[1]), unit: match[2] };
      }
    }
    return { value: 0, unit: '' };
  };

  const base = parseValueAndUnit(baseValue);
  let result = base.value;
  let unit = base.unit;

  for (const value of values) {
    const parsed = parseValueAndUnit(value);
    result += parsed.value;
    if (parsed.unit) {
      unit = parsed.unit;
    }
  }

  return unit ? `${result}${unit}` : result;
}

/**
 * Multiply numeric values with unit support.
 */
function multiplyNumericValues(
  baseValue: unknown,
  values: Array<unknown>
): number {
  const parseNumeric = (val: unknown): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 1 : parsed;
    }
    return 1;
  };

  let result = parseNumeric(baseValue);
  for (const value of values) {
    result *= parseNumeric(value);
  }

  return result;
}

/**
 * Combine transforms for React Native transform arrays.
 */
function combineTransforms(
  baseValue: unknown,
  values: Array<unknown>
): unknown {
  const baseTransforms = Array.isArray(baseValue)
    ? baseValue
    : parseTransformString(baseValue);
  let combinedTransforms = [...baseTransforms];

  for (const value of values) {
    if (Array.isArray(value)) {
      combinedTransforms = [...combinedTransforms, ...value];
    }
  }

  return combinedTransforms.length > 0 ? combinedTransforms : baseValue;
}

/**
 * Accumulate property values based on CSS property type.
 */
export function accumulatePropertyValues(
  property: string,
  values: Array<unknown>,
  baseValue: unknown
): unknown {
  if (values.length === 0) return baseValue;

  switch (property) {
    case 'transform':
      return combineTransforms(baseValue, values);

    case 'opacity': {
      let opacityResult = typeof baseValue === 'number' ? baseValue : 1;
      for (const value of values) {
        if (typeof value === 'number') {
          opacityResult *= value;
        }
      }
      return Math.max(0, Math.min(1, opacityResult));
    }

    case 'translateX':
    case 'translateY':
    case 'translateZ':
    case 'rotate':
    case 'rotateX':
    case 'rotateY':
    case 'rotateZ':
      return addNumericValues(baseValue, values);

    case 'scale':
    case 'scaleX':
    case 'scaleY':
    case 'scaleZ':
      return multiplyNumericValues(baseValue, values);

    default:
      return values.length > 0 ? values[values.length - 1] : baseValue;
  }
}

export function removeAnimationProperties(
  style: ReactNativeStyle
): ReactNativeStyle {
  const animationProps = new Set(ANIMATION_PROPERTIES);
  const filteredStyle: ReactNativeStyle = {};

  for (const key in style) {
    if (animationProps.has(key)) {
      continue;
    }

    if (typeof key === 'string' && /^keyframe_\d+$/.test(key)) {
      continue;
    }

    filteredStyle[key] = style[key];
  }

  return filteredStyle;
}

export type AnimationData = {
  controller: AnimationController,
  animationIndex: number,
  animationName: string,
  direction: string,
  fillMode: string,
  compositionMode: string,
  ...
};

/**
 * Compose multiple animated styles with composition modes support.
 */
export function composeMultipleAnimatedStyles(
  baseStyle: ReactNativeStyle,
  controllers: Map<string, AnimationController>,
  normalizedAnimations: NormalizedAnimationArrays
): ReactNativeStyle {
  if (!controllers || controllers.size === 0) {
    return baseStyle;
  }

  const cleanStyle = removeAnimationProperties(baseStyle);
  const replaceAnimations = [];
  const additiveAnimations = [];
  const accumulateAnimations = [];

  const sortedControllers = Array.from(controllers?.entries() || []).sort(
    ([keyA], [keyB]) => {
      const partsA = keyA.split('_');
      const partsB = keyB.split('_');
      const indexA = parseInt(partsA[partsA.length - 1], 10) || 0;
      const indexB = parseInt(partsB[partsB.length - 1], 10) || 0;
      return indexA - indexB;
    }
  );

  for (const [animationKey, controller] of sortedControllers) {
    const keyParts = animationKey.split('_');
    const animationIndex = parseInt(keyParts[keyParts.length - 1], 10) || 0;
    const compositionMode =
      normalizedAnimations.animationComposition[animationIndex] || 'replace';

    const animationData: AnimationData = {
      controller,
      animationIndex,
      animationName: normalizedAnimations.animationName[animationIndex],
      direction: normalizedAnimations.animationDirection[animationIndex],
      fillMode: normalizedAnimations.animationFillMode[animationIndex],
      compositionMode
    };

    if (compositionMode === 'add') {
      additiveAnimations.push(animationData);
    } else if (compositionMode === 'accumulate') {
      accumulateAnimations.push(animationData);
    } else {
      replaceAnimations.push(animationData);
    }
  }

  const result = composeWithCompositionModes(
    cleanStyle,
    replaceAnimations,
    additiveAnimations,
    accumulateAnimations
  );

  return result;
}

/**
 * Apply composition modes to combine animation styles.
 */
export function composeWithCompositionModes(
  cleanStyle: ReactNativeStyle,
  replaceAnimations: Array<AnimationData>,
  additiveAnimations: Array<AnimationData>,
  accumulateAnimations: Array<AnimationData>
): ReactNativeStyle {
  const allAnimations = [
    ...replaceAnimations.map((a) => ({ ...a, mode: 'replace' })),
    ...additiveAnimations.map((a) => ({ ...a, mode: 'add' })),
    ...accumulateAnimations.map((a) => ({ ...a, mode: 'accumulate' }))
  ].sort((a, b) => a.animationIndex - b.animationIndex);
  const animationResults = [];
  for (const animation of allAnimations) {
    try {
      const interpolatedStyle = getInterpolatedStyle(
        animation.controller.getAnimatedValue(),
        animation.animationName,
        cleanStyle,
        parseAnimationDirection(animation.direction || 'normal'),
        parseAnimationFillMode(animation.fillMode || 'none'),
        animation.controller.getState()
      );

      animationResults.push({
        style: interpolatedStyle,
        mode: animation.mode,
        index: animation.animationIndex
      });
    } catch (error) {
      handleAnimationError(
        error,
        `Animation interpolation for ${animation.animationName}`
      );
    }
  }

  const result = { ...cleanStyle };
  const propertyNames = new Set(
    animationResults.flatMap((r) => Object.keys(r.style))
  );

  for (const property of propertyNames) {
    const propertyAnimations = animationResults
      .filter((r) => property in r.style)
      .sort((a, b) => a.index - b.index);

    let currentValue: unknown = cleanStyle[property];
    const hasEarlierReplaceOrAdd = propertyAnimations.some(
      (a) => a.mode === 'replace' || a.mode === 'add'
    );
    const effectiveAnimations = hasEarlierReplaceOrAdd
      ? propertyAnimations.filter((a) => a.mode !== 'accumulate')
      : propertyAnimations;

    for (const animation of effectiveAnimations) {
      const value = animation.style[property];

      switch (animation.mode) {
        case 'replace':
          if (property === 'transform' && Array.isArray(value)) {
            currentValue = Array.isArray(currentValue)
              ? [...currentValue, ...value]
              : [...value];
          } else {
            currentValue = value;
          }
          break;
        case 'add':
        case 'accumulate':
          currentValue = accumulatePropertyValues(
            property,
            [value],
            currentValue
          );
          break;
        default:
          currentValue = value;
          break;
      }
    }

    // $FlowFixMe[incompatible-type]: Animation processing guarantees valid ReactNativeStyleValue
    result[property] = currentValue;
  }

  return result;
}
