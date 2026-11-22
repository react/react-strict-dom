/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { CallbackRef } from '../../types/react';
import type { HostInstance } from '../../types/renderer.native';

import * as React from 'react';

import { useViewportScale } from './ContextViewportScale';

type Options = {
  tagName: string
};

// Polyfill members shared by both views below; declared once.
type StrictRefCommonPolyfills = {
  complete?: boolean,
  setSelectionRange?: (start: number, end: number) => void,
  selectionStart?: number,
  selectionEnd?: number
};

// Read view of the strict-dom polyfill members carried by the RN host node but
// not part of its public `HostInstance` type.
type StrictRefPolyfills = {
  ...StrictRefCommonPolyfills,
  setSelection?: (start: number, end: number) => void,
  _selectionStart?: number,
  _selectionEnd?: number,
  ...
};

// Writable augmentation target: inherits the host node via the prototype chain
// and adds these members via `defineProperty`.
type StrictRefTarget = {
  ...StrictRefCommonPolyfills,
  nodeName?: string,
  getBoundingClientRect?: () => DOMRect,
  ...
};

const memoizedStrictRefs: WeakMap<HostInstance, StrictRefTarget> =
  new WeakMap();

const objectPrototype: interface {} | null = Object.getPrototypeOf({});

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
 * Re-exposes the host node's inherited methods as own properties that call
 * through to the node.
 *
 * Reading a method off the wrapper resolves it via the prototype chain but
 * calls it with the wrapper as the receiver. RN's host node methods read
 * internals off `this`, and those internals are not reachable from the
 * wrapper, so `strictRef.focus()` is a no-op while `node.focus()` works.
 * Own methods of the node are left alone: RN assigns those as closures over
 * the node, so their receiver does not matter.
 */
function bindInheritedMethods(strictRef: StrictRefTarget, node: HostInstance) {
  let proto: interface {} | null = Object.getPrototypeOf(node);
  while (proto != null && proto !== objectPrototype) {
    const names: ReadonlyArray<string> = Object.getOwnPropertyNames(proto);
    for (const name of names) {
      if (
        name === 'constructor' ||
        Object.getOwnPropertyDescriptor(strictRef, name) != null
      ) {
        continue;
      }
      const descriptor = Object.getOwnPropertyDescriptor(proto, name);
      // Accessors are left on the prototype chain: they read the plain
      // instance fields that the wrapper already inherits.
      if (descriptor == null || typeof descriptor.value !== 'function') {
        continue;
      }
      Object.defineProperty(strictRef, name, {
        value: (...args: Array<unknown>) =>
          // $FlowFixMe[prop-missing] - dynamic method call on the RN host node.
          node[name](...args),
        configurable: true
      });
    }
    proto = Object.getPrototypeOf(proto);
  }
}

/**
 * Uses the RN host node as the wrapper's prototype so non-overridden reads
 * resolve via the prototype chain — including the symbol-keyed internals
 * RN's prototype methods consult via `this`. Keeps a static hidden class so
 * Hermes can optimize access; a Proxy cannot.
 *
 * Descendants are not wrapped; values read after traversal are not scaled.
 */
function getOrCreateStrictRef(
  node: HostInstance,
  tagName: string,
  viewportScale: number
): StrictRefTarget {
  const ref = memoizedStrictRefs.get(node);
  if (ref != null) {
    return ref;
  }

  // `Object.create(node)` is typed as the read-only host node, not the writable
  // augmentation target.
  const strictRef: StrictRefTarget = Object.create(node) as $FlowFixMe;
  // $FlowFixMe[class-object-subtyping] - read the host node's polyfill members.
  const nodeInternals: StrictRefPolyfills = node;

  // Runs before the definitions below so the strict-dom overrides, such as the
  // viewport-scaled `getBoundingClientRect`, still win.
  bindInheritedMethods(strictRef, node);

  Object.defineProperty(strictRef, 'nodeName', {
    value: tagName.toUpperCase(),
    configurable: true
  });

  if (viewportScale !== 1) {
    const scale = (n: number) => n / viewportScale;

    if ('getBoundingClientRect' in node) {
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
        Object.defineProperty(strictRef, prop, {
          get() {
            // $FlowFixMe[prop-missing] - dynamic length-property read off the RN host node.
            const value = node[prop];
            return typeof value === 'number' ? scale(value) : value;
          },
          configurable: true
        });
      }
    }
  }

  if (tagName === 'img') {
    Object.defineProperty(strictRef, 'complete', {
      get() {
        return nodeInternals.complete ?? false;
      },
      configurable: true
    });
  } else if (tagName === 'input' || tagName === 'textarea') {
    if (nodeInternals.setSelectionRange == null) {
      Object.defineProperty(strictRef, 'setSelectionRange', {
        value: (a: number, b: number) => {
          nodeInternals.setSelection?.(a, b);
          nodeInternals._selectionStart = a;
          nodeInternals._selectionEnd = b;
        },
        configurable: true
      });
    }
    if (nodeInternals.selectionStart == null) {
      Object.defineProperty(strictRef, 'selectionStart', {
        get() {
          return nodeInternals._selectionStart ?? 0;
        },
        configurable: true
      });
    }
    if (nodeInternals.selectionEnd == null) {
      Object.defineProperty(strictRef, 'selectionEnd', {
        get() {
          return nodeInternals._selectionEnd ?? 0;
        },
        configurable: true
      });
    }
  }

  memoizedStrictRefs.set(node, strictRef);
  return strictRef;
}

export function useStrictDOMElement<T>(
  ref: React.RefSetter<T>,
  { tagName }: Options
): ?CallbackRef<HostInstance> {
  const { scale: viewportScale } = useViewportScale();

  return React.useMemo(() => {
    if (ref == null) {
      return null;
    }
    let cleanup: void | (() => void);
    return (node: HostInstance | null) => {
      if (cleanup != null) {
        cleanup();
        cleanup = undefined;
      }
      if (node == null) {
        return;
      }
      const strictRef = getOrCreateStrictRef(node, tagName, viewportScale);
      if (typeof ref === 'function') {
        // Public ref type is the DOM element `T` (web/native parity); at
        // runtime we hand over the RN-backed strict wrapper.
        // $FlowFixMe[incompatible-type] - Flow does not understand ref cleanup.
        const refCleanup: void | (() => void) = ref(strictRef as $FlowFixMe);
        cleanup =
          typeof refCleanup === 'function'
            ? refCleanup
            : () => {
                ref(null);
              };
        return;
      }
      // $FlowFixMe[incompatible-type] - see the ref-callback note above.
      ref.current = strictRef;
      cleanup = () => {
        ref.current = null;
      };
    };
  }, [ref, tagName, viewportScale]);
}
