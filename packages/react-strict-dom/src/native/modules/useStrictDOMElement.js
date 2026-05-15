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
 * Uses the RN host node as the wrapper's prototype so non-overridden reads
 * resolve via the prototype chain — including the symbol-keyed internals
 * RN's prototype methods consult via `this`. Keeps a static hidden class so
 * Hermes can optimize access; a Proxy cannot.
 *
 * Descendants are not wrapped; values read after traversal are not scaled.
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

  const strictRef: Node = Object.create(node);

  // $FlowFixMe[prop-missing]
  Object.defineProperty(strictRef, 'nodeName', {
    value: tagName.toUpperCase(),
    configurable: true
  });

  if (viewportScale !== 1) {
    const scale = (n: number) => n / viewportScale;

    if (typeof node.getBoundingClientRect === 'function') {
      // $FlowFixMe[prop-missing]
      Object.defineProperty(strictRef, 'getBoundingClientRect', {
        value: () => {
          const rect = node.getBoundingClientRect();
          return new DOMRect(
            scale(rect.x),
            scale(rect.y),
            scale(rect.width),
            scale(rect.height)
          );
        },
        configurable: true
      });
    }

    for (const prop of lengthPropertySet) {
      if (prop in node) {
        // $FlowFixMe[prop-missing]
        Object.defineProperty(strictRef, prop, {
          get() {
            const value = node[prop];
            return typeof value === 'number' ? scale(value) : value;
          },
          configurable: true
        });
      }
    }
  }

  if (tagName === 'img') {
    // $FlowFixMe[prop-missing]
    Object.defineProperty(strictRef, 'complete', {
      get() {
        return node.complete ?? false;
      },
      configurable: true
    });
  } else if (tagName === 'input' || tagName === 'textarea') {
    if (node.setSelectionRange == null) {
      // $FlowFixMe[prop-missing]
      Object.defineProperty(strictRef, 'setSelectionRange', {
        value: (a: number, b: number) => {
          node.setSelection(a, b);
          node._selectionStart = a;
          node._selectionEnd = b;
        },
        configurable: true
      });
    }
    if (node.selectionStart == null) {
      // $FlowFixMe[prop-missing]
      Object.defineProperty(strictRef, 'selectionStart', {
        get() {
          return node._selectionStart ?? 0;
        },
        configurable: true
      });
    }
    if (node.selectionEnd == null) {
      // $FlowFixMe[prop-missing]
      Object.defineProperty(strictRef, 'selectionEnd', {
        get() {
          return node._selectionEnd ?? 0;
        },
        configurable: true
      });
    }
  }

  memoizedStrictRefs.set(node, strictRef);
  return strictRef;
}

export function useStrictDOMElement<T>(
  ref: React.RefSetter<Node>,
  { tagName }: Options
): CallbackRef<T> {
  const { scale: viewportScale } = useViewportScale();

  return useElementCallback(
    React.useCallback(
      // $FlowFixMe[unclear-type]
      (node: any) => {
        if (ref == null) return undefined;
        const strictRef = getOrCreateStrictRef(node, tagName, viewportScale);
        if (typeof ref === 'function') {
          // $FlowFixMe[incompatible-type] - Flow does not understand ref cleanup.
          const cleanup: void | (() => void) = ref(strictRef);
          return typeof cleanup === 'function'
            ? cleanup
            : () => {
                ref(null);
              };
        }
        ref.current = strictRef;
        return () => {
          ref.current = null;
        };
      },
      [ref, tagName, viewportScale]
    )
  );
}
