/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { CustomProperties } from '../../types/styles';

import { CSSUnparsedValue } from './typed-om/CSSUnparsedValue';
import { CSSVariableReferenceValue } from './typed-om/CSSVariableReferenceValue';
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

function resolveVariableReferenceValue(
  propName: string,
  variable: CSSVariableReferenceValue,
  propertyRegistry: CustomProperties,
  colorScheme: 'light' | 'dark'
) {
  const variableName = normalizeVariableName(variable.variable);
  const fallbackValue = variable.fallback;

  let variableValue: unknown = propertyRegistry[variableName];

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
      colorScheme
    );
  }

  if (variableValue != null) {
    if (typeof variableValue === 'object' && variableValue.default != null) {
      let defaultValue = variableValue.default;
      if (
        colorScheme === 'dark' &&
        variableValue['@media (prefers-color-scheme: dark)'] != null
      ) {
        defaultValue = variableValue['@media (prefers-color-scheme: dark)'];
      }
      return defaultValue;
    }
    return variableValue;
  } else if (fallbackValue != null) {
    const resolvedFallback = resolveVariableReferences(
      propName,
      fallbackValue,
      propertyRegistry,
      colorScheme
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
  colorScheme: 'light' | 'dark' = 'light'
): string | number | null {
  const result: Array<unknown> = [];
  for (const value of propValue.values()) {
    if (value instanceof CSSVariableReferenceValue) {
      const resolvedValue = resolveVariableReferenceValue(
        propName,
        value,
        propertyRegistry,
        colorScheme
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
