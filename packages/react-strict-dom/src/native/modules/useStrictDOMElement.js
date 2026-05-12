/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { CallbackRef } from '../../types/react';

import * as React from 'react';

import { useElementCallback } from '../../shared/useElementCallback';
import { useViewportScale } from './ContextViewportScale';

type Options = {
  tagName: string
};

// $FlowFixMe[unclear-type]
type Node = any;

const memoizedStrictRefs: WeakMap<Node, Node> = new WeakMap();

const lengthPropertySet: ReadonlySet<string> = new Set([
  'clientHeight',
  'clientLeft',
  'clientTop',
  'clientWidth',
  'offsetHeight',
  'offsetLeft',
  'offsetTop',
  'offsetWidth',
  'scrollHeight',
  'scrollLeft',
  'scrollTop',
  'scrollWidth'
]);

/**
 * Wraps a React Native host node in a Proxy so strict-dom can override the
 * remaining DOM APIs it polyfills while forwarding RN's DOM Node APIs.
 * Methods are bound to the host node so RN internals receive the expected
 * `this` value.
 */
function getOrCreateStrictRef(
  node: Node,
  tagName: string,
  viewportScale: number
): Node {
  const ref = memoizedStrictRefs.get(node);
  if (ref != null) {
    return ref;
  }

  const isImg = tagName === 'img';
  const isTextInput = tagName === 'input' || tagName === 'textarea';
  const upperTagName = tagName.toUpperCase();
  const scaled = (n: number) => n / viewportScale;

  // $FlowFixMe[unclear-type] - ProxyHandler is not in Flow's built-in types.
  const handler: any = {
    get(target, prop, _receiver) {
      if (prop === 'nodeName') {
        return upperTagName;
      }
      if (prop === 'getBoundingClientRect') {
        const fn = target.getBoundingClientRect;
        if (typeof fn !== 'function') {
          return fn;
        }
        return () => {
          const rect = fn.call(target);
          if (viewportScale !== 1) {
            return new DOMRect(
              scaled(rect.x),
              scaled(rect.y),
              scaled(rect.width),
              scaled(rect.height)
            );
          }
          return rect;
        };
      }
      if (
        viewportScale !== 1 &&
        typeof prop === 'string' &&
        lengthPropertySet.has(prop)
      ) {
        const raw = target[prop];
        return typeof raw === 'number' ? scaled(raw) : raw;
      }
      if (isImg && prop === 'complete') {
        return target.complete ?? false;
      }
      if (isTextInput) {
        if (prop === 'setSelectionRange' && target.setSelectionRange == null) {
          return (a: number, b: number) => {
            target.setSelection(a, b);
            target._selectionStart = a;
            target._selectionEnd = b;
          };
        }
        if (prop === 'selectionStart' && target.selectionStart == null) {
          return target._selectionStart ?? 0;
        }
        if (prop === 'selectionEnd' && target.selectionEnd == null) {
          return target._selectionEnd ?? 0;
        }
      }
      // $FlowFixMe[unclear-type]
      const value: any = Reflect.get(target, prop, target);
      if (typeof value === 'function') {
        return value.bind(target);
      }
      return value;
    }
  };

  // $FlowFixMe[invalid-constructor] - Flow types Proxy strictly here.
  const strictRef: Node = new Proxy(node, handler);
  memoizedStrictRefs.set(node, strictRef);
  return strictRef;
}

export function useStrictDOMElement<T>(
  ref: React.RefSetter<Node>,
  { tagName }: Options
): CallbackRef<T> {
  const { scale: viewportScale } = useViewportScale();

  const elementCallback = useElementCallback(
    React.useCallback(
      // $FlowFixMe[unclear-type]
      (node: any) => {
        if (ref == null) {
          return undefined;
        } else {
          const strictRef = getOrCreateStrictRef(node, tagName, viewportScale);
          if (typeof ref === 'function') {
            // $FlowFixMe[incompatible-type] - Flow does not understand ref cleanup.
            const cleanup: void | (() => void) = ref(strictRef);
            return typeof cleanup === 'function'
              ? cleanup
              : () => {
                  ref(null);
                };
          } else {
            ref.current = strictRef;
            return () => {
              ref.current = null;
            };
          }
        }
      },
      [ref, tagName, viewportScale]
    )
  );

  return elementCallback;
}
