/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { CustomProperties } from '../../types/styles';
import type { MediaQueryContext } from './mediaQueryMatches';

import { CSSUnparsedValue } from './typed-om/CSSUnparsedValue';
import { CSSVariableReferenceValue } from './typed-om/CSSVariableReferenceValue';
import { mediaQueryMatches } from './mediaQueryMatches';
import { warnMsg } from '../../shared/logUtils';

const memoizedValues = new Map<string, string>();

function camelize(s: string): string {
  const memoizedValue = memoizedValues.get(s);
  if (memoizedValue != null) {
    return memoizedValue;
  }
  const result = s.replace(/-./g, (x) => x.toUpperCase()[1]);
  memoizedValues.set(s, result);
  return result;
}

function normalizeVariableName(name: string): string {
  if (__DEV__) {
    if (!name.startsWith('--')) {
      throw new Error("Invalid variable name, must begin with '--'");
    }
  }
  // TODO: remove camelize
  // https://github.com/facebook/react-strict-dom/pull/73
  return camelize(name.substring(2));
}

export function stringContainsVariables(input: string): boolean {
  return input.includes('var(');
}

function selectVariableValue(
  value: unknown,
  context: MediaQueryContext,
  depth: number = 0
): ?{ value: string | number, depth: number } {
  if (typeof value === 'string' || typeof value === 'number') {
    return { value, depth };
  }
  if (
    value == null ||
    typeof value !== 'object' ||
    !Object.hasOwn(value, 'default')
  ) {
    return null;
  }

  let selected = selectVariableValue(value.default, context, depth);
  // StyleX emits nested conditions after shallower ones. At equal depth,
  // keep the native convention of taking the last matching declaration.
  for (const query in value) {
    if (query.startsWith('@media') && mediaQueryMatches(query, context)) {
      const match = selectVariableValue(value[query], context, depth + 1);
      if (
        match != null &&
        (selected == null || match.depth >= selected.depth)
      ) {
        selected = match;
      }
    }
  }
  return selected;
}

function resolveVariableReferenceValue(
  propName: string,
  variable: CSSVariableReferenceValue,
  propertyRegistry: CustomProperties,
  context: MediaQueryContext
) {
  const variableName = normalizeVariableName(variable.variable);
  const fallbackValue = variable.fallback;

  let variableValue: unknown = propertyRegistry[variableName];
  if (variableValue != null && typeof variableValue === 'object') {
    variableValue = selectVariableValue(variableValue, context)?.value;
  }

  // Perform variable resolution on the variable's resolved value if it itself
  // contains variables
  if (
    typeof variableValue === 'string' &&
    stringContainsVariables(variableValue)
  ) {
    variableValue = resolveVariableReferences(
      propName,
      CSSUnparsedValue.parse(propName, variableValue),
      propertyRegistry,
      context
    );
  }

  if (variableValue != null) {
    return variableValue;
  } else if (fallbackValue != null) {
    const resolvedFallback = resolveVariableReferences(
      propName,
      fallbackValue,
      propertyRegistry,
      context
    );
    if (resolvedFallback != null) {
      return resolvedFallback;
    }
  }

  if (__DEV__) {
    warnMsg(`unrecognized custom property "${variable.variable}"`);
  }

  return null;
}

// Takes a CSSUnparsedValue and registry of variable values and resolves it down to a string
export function resolveVariableReferences(
  propName: string,
  propValue: CSSUnparsedValue,
  propertyRegistry: CustomProperties,
  context: MediaQueryContext
): string | number | null {
  const result: Array<unknown> = [];
  for (const value of propValue.values()) {
    if (value instanceof CSSVariableReferenceValue) {
      const resolvedValue = resolveVariableReferenceValue(
        propName,
        value,
        propertyRegistry,
        context
      );
      if (resolvedValue == null) {
        // Failure to resolve a CSS variable in a value means the entire value
        // is unparsable so we bail out and resolve the entire value as null
        return null;
      }
      result.push(resolvedValue);
    } else {
      result.push(value);
    }
  }

  // special case for singular number value
  if (result.length === 1 && typeof result[0] === 'number') {
    return result[0];
  }

  // consider empty string as a null value
  const output = result.join('').trim();
  return output === '' ? null : output;
}
