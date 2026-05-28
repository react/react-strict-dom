/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { contexts, html } from 'react-strict-dom';
import { act, create } from 'react-test-renderer';

global.DOMRect = class DOMRect {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
};

/**
 * Builds a fake host node mimicking the shape RN 0.82 exposes via element-node
 * refs. Properties present here pass through useStrictDOMElement; properties
 * intentionally omitted (setSelectionRange, selectionStart, selectionEnd,
 * complete) are the gaps strict-dom still polyfills.
 */
function buildHostNodeMock(overrides) {
  const ownerDocument = {
    nodeName: '#document',
    nodeType: 9
  };
  const node = {
    blur: () => {},
    focus: () => {},
    offsetWidth: 15,
    offsetHeight: 10,
    scrollTop: 0,
    setSelection: jest.fn(),
    ownerDocument,
    childNodes: [],
    children: [],
    parentNode: null,
    getRootNode() {
      return ownerDocument;
    },
    getBoundingClientRect() {
      return new DOMRect(1, 2, 15, 10);
    }
  };
  if (overrides != null) {
    Object.assign(node, overrides);
  }
  return node;
}

describe('<html.*> refs', () => {
  const { ViewportProvider } = contexts;

  beforeEach(() => {
    // avoid console messages for these tests
    jest.spyOn(console, 'error');
    console.error.mockImplementation(() => {});
    jest.spyOn(console, 'warn');
    console.warn.mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.warn.mockRestore();
    jest.clearAllMocks();
  });

  describe('imperative api', () => {
    test('input ref polyfills selection range', () => {
      const setSelectionMock = jest.fn();
      function createNodeMock() {
        return buildHostNodeMock({ setSelection: setSelectionMock });
      }
      act(() => {
        create(
          <html.input
            ref={(node) => {
              expect(node.offsetWidth).toBe(15);
              expect(node.selectionStart).toBe(0);
              expect(node.selectionEnd).toBe(0);
              expect(() => node.setSelectionRange(1, 5)).not.toThrow();
              expect(setSelectionMock).toHaveBeenCalledWith(1, 5);
              expect(node.selectionStart).toBe(1);
              expect(node.selectionEnd).toBe(5);
            }}
          />,
          { createNodeMock }
        );
      });
    });

    test('input ref does not throw when host node is null', () => {
      act(() => {
        create(
          <html.input
            ref={(node) => {
              expect(() => node.getBoundingClientRect()).toThrow();
            }}
          />,
          { createNodeMock: () => null }
        );
      });
    });
  });

  describe('DOM node shape', () => {
    test('nodeName returns uppercase tag for html.div', () => {
      function createNodeMock() {
        return buildHostNodeMock({ tagName: 'RN:View' });
      }
      act(() => {
        create(
          <html.div
            ref={(node) => {
              expect(node.nodeName).toBe('DIV');
            }}
          />,
          { createNodeMock }
        );
      });
    });

    test('nodeName returns uppercase tag for html.span', () => {
      function createNodeMock() {
        return buildHostNodeMock({ tagName: 'RN:View' });
      }
      act(() => {
        create(
          <html.span
            ref={(node) => {
              expect(node.nodeName).toBe('SPAN');
            }}
          />,
          { createNodeMock }
        );
      });
    });

    test('getBoundingClientRect passes through when viewport scale is 1', () => {
      function createNodeMock() {
        return buildHostNodeMock();
      }
      act(() => {
        create(
          <html.div
            ref={(node) => {
              const rect = node.getBoundingClientRect();
              expect(rect.x).toBe(1);
              expect(rect.y).toBe(2);
              expect(rect.width).toBe(15);
              expect(rect.height).toBe(10);
            }}
          />,
          { createNodeMock }
        );
      });
    });

    test('getBoundingClientRect is scaled when viewport scale is not 1', () => {
      function createNodeMock() {
        return buildHostNodeMock();
      }
      const SCALE = 2;
      act(() => {
        create(
          <ViewportProvider viewportWidth={1000}>
            <html.div
              ref={(node) => {
                const rect = node.getBoundingClientRect();
                // useWindowDimensions mock returns width: 2000.
                // viewportScale = 2000 / 1000 = 2, so values are halved.
                expect(rect.x).toBe(1 / SCALE);
                expect(rect.y).toBe(2 / SCALE);
                expect(rect.width).toBe(15 / SCALE);
                expect(rect.height).toBe(10 / SCALE);
              }}
            />
          </ViewportProvider>,
          { createNodeMock }
        );
      });
    });

    test('ownerDocument, getRootNode, childNodes, children pass through', () => {
      let underlyingNode;
      function createNodeMock() {
        underlyingNode = buildHostNodeMock();
        return underlyingNode;
      }
      act(() => {
        create(
          <html.div
            ref={(node) => {
              expect(node.ownerDocument).toBe(underlyingNode.ownerDocument);
              expect(node.getRootNode()).toBe(underlyingNode.ownerDocument);
              expect(node.childNodes).toBe(underlyingNode.childNodes);
              expect(node.children).toBe(underlyingNode.children);
              expect(node.parentNode).toBe(null);
            }}
          />,
          { createNodeMock }
        );
      });
    });

    test('strict ref identity is stable for the same underlying node', () => {
      const captured = [];
      let underlyingNode;
      function createNodeMock() {
        // react-test-renderer reuses the same mock node across renders
        // when the element tree shape is unchanged, so this is one node
        // observed twice.
        underlyingNode = underlyingNode ?? buildHostNodeMock();
        return underlyingNode;
      }
      const refCallback = (node) => {
        if (node != null) {
          captured.push(node);
        }
      };
      let renderer;
      act(() => {
        renderer = create(<html.div key="a" ref={refCallback} />, {
          createNodeMock
        });
      });
      act(() => {
        renderer.update(<html.div key="b" ref={refCallback} />);
      });
      expect(captured.length).toBeGreaterThanOrEqual(2);
      expect(captured[0]).toBe(captured[captured.length - 1]);
    });

    test('html.img ref returns complete=false when underlying node omits it', () => {
      function createNodeMock() {
        return buildHostNodeMock();
        // `complete` deliberately omitted
      }
      act(() => {
        create(
          <html.img
            ref={(node) => {
              expect(node.complete).toBe(false);
            }}
            src="x"
          />,
          { createNodeMock }
        );
      });
    });

    test('html.img ref passes through complete when underlying node exposes it', () => {
      function createNodeMock() {
        return buildHostNodeMock({ complete: true });
      }
      act(() => {
        create(
          <html.img
            ref={(node) => {
              expect(node.complete).toBe(true);
            }}
            src="x"
          />,
          { createNodeMock }
        );
      });
    });
  });
});
