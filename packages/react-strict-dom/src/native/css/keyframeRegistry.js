/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { warnMsg } from '../../shared/logUtils';

export type KeyframeDefinition = {
  +id: string,
  +keyframes: { +[percentage: string]: { +[property: string]: unknown } }
};

type KeyframeValues = { +[property: string]: unknown };

function parsePercentage(percentage: string): number | null {
  if (percentage === 'from') return 0;
  if (percentage === 'to') return 1;

  const match = percentage.match(/^(\d+(?:\.\d+)?)%$/);
  if (match) {
    const value = parseFloat(match[1]) / 100;
    return Math.max(0, Math.min(1, value));
  }

  return null;
}

export function parseKeyframeStops(keyframes: {
  +[percentage: string]: unknown
}): Array<{ percentage: string, value: number }> {
  const stops = [];

  for (const percentage in keyframes) {
    const value = parsePercentage(percentage);
    if (value !== null) {
      stops.push({ percentage, value });
    }
  }

  return stops.sort((a, b) => a.value - b.value);
}

/**
 * Registry for managing keyframe definitions in the native implementation.
 */
class KeyframeRegistryImpl {
  _registry: Map<string, KeyframeDefinition> = new Map();
  _idCounter: number = 0;

  /**
   * Register a keyframe definition and return a unique identifier
   */
  register(keyframes: { +[percentage: string]: KeyframeValues }): string {
    if (!keyframes || Object.keys(keyframes).length === 0) {
      if (__DEV__) {
        warnMsg('Keyframes cannot be empty, returning empty keyframe ID');
      }
      // Return a placeholder ID instead of throwing in production
      return this._generateUniqueId();
    }

    const id = this._generateUniqueId();
    const definition: KeyframeDefinition = {
      id,
      keyframes
    };

    this._registry.set(id, definition);
    return id;
  }

  /**
   * Resolve a keyframe definition by its ID
   */
  resolve(animationName: string): KeyframeDefinition | null {
    return this._registry.get(animationName) || null;
  }

  /**
   * Clear all registered keyframes (useful for testing)
   */
  clear(): void {
    this._registry.clear();
    this._idCounter = 0;
  }

  /**
   * Generate a unique identifier for keyframes
   */
  _generateUniqueId(): string {
    return `keyframe_${++this._idCounter}`;
  }
}

// Export singleton instance
export const keyframeRegistry: KeyframeRegistryImpl =
  new KeyframeRegistryImpl();
