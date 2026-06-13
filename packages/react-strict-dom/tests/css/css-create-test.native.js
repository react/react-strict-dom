/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { css, html } from 'react-strict-dom';
import { act, create } from 'react-test-renderer';

describe('css.create()', () => {
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

  /**
   * Properties: general
   */

  describe('properties', () => {
    test('animationDelay', () => {
      const styles = css.create({
        root: {
          animationDelay: '0.3s'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('animationDuration', () => {
      const styles = css.create({
        root: {
          animationDuration: '0.5s'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('animationName', () => {
      const keyframeId = css.keyframes({
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      });

      // keyframes should return a unique ID string
      expect(typeof keyframeId).toBe('string');
      expect(keyframeId.length).toBeGreaterThan(0);

      // Test animation with keyframes
      const styles = css.create({
        animated: {
          animationName: keyframeId,
          animationDuration: '1s'
        }
      });

      let root;
      act(() => {
        root = create(<html.div style={styles.animated} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('backgroundImage', () => {
      const styles = css.create({
        root: {
          backgroundImage: 'linear-gradient(to bottom right, yellow, green)'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('blockSize', () => {
      const styles = css.create({
        blockSize: {
          blockSize: '100px'
        },
        maxBlockSize: {
          maxBlockSize: '100px'
        },
        minBlockSize: {
          minBlockSize: '100px'
        },
        height: (v) => ({ height: v }),
        maxHeight: (v) => ({ maxHeight: v }),
        minHeight: (v) => ({ minHeight: v })
      });
      let root;

      // blockSize
      act(() => {
        root = create(<html.div style={styles.blockSize} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('blockSize');
      act(() => {
        root = create(
          <html.div style={[styles.height(200), styles.blockSize]} />
        );
      });
      expect(root.toJSON().props.style).toMatchSnapshot(
        'blockSize after height'
      );

      // maxBlockSize
      act(() => {
        root = create(<html.div style={styles.maxBlockSize} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('maxBlockSize');
      act(() => {
        root = create(
          <html.div style={[styles.maxHeight(200), styles.maxBlockSize]} />
        );
      });
      expect(root.toJSON().props.style).toMatchSnapshot(
        'maxBlockSize after maxHeight'
      );

      // minBlockSize
      act(() => {
        root = create(<html.div style={styles.minBlockSize} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('minBlockSize');
      act(() => {
        root = create(
          <html.div style={[styles.minHeight(200), styles.minBlockSize]} />
        );
      });
      expect(root.toJSON().props.style).toMatchSnapshot(
        'minBlockSize after minHeight'
      );
    });

    test('borderBlock', () => {
      const styles = css.create({
        borderBlock: {
          borderBlockColor: 'black',
          borderBlockStyle: 'solid',
          borderBlockWidth: 1
        },
        borderBlockEnd: {
          borderBlockEndColor: 'red',
          borderBlockEndStyle: 'dotted',
          borderBlockEndWidth: 2
        },
        borderBlockStart: {
          borderBlockStartColor: 'green',
          borderBlockStartStyle: 'dashed',
          borderBlockStartWidth: 3
        }
      });
      let root;

      // borderBlock
      act(() => {
        root = create(<html.div style={styles.borderBlock} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('borderBlock');
      act(() => {
        root = create(
          <html.div style={[styles.borderBlockEnd, styles.borderBlock]} />
        );
      });
      expect(root.toJSON().props.style).toMatchSnapshot(
        'borderBlock after borderBlockEnd'
      );
      act(() => {
        root = create(
          <html.div style={[styles.borderBlockStart, styles.borderBlock]} />
        );
      });
      expect(root.toJSON().props.style).toMatchSnapshot(
        'borderBlock after borderBlockStart'
      );

      // borderBlockEnd
      act(() => {
        root = create(<html.div style={styles.borderBlockEnd} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('borderBlockEnd');

      // borderBlockStart
      act(() => {
        root = create(<html.div style={styles.borderBlockStart} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('borderBlockStart');
    });

    test('borderColor', () => {
      const { underTest } = css.create({
        underTest: {
          // test for potential false positive on invalid shortform (multiple values / spaces)
          borderColor: 'rgba(0, 0, 0, 0.5)'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
    });

    test('borderInline', () => {
      const styles = css.create({
        borderInline: {
          borderInlineColor: 'black',
          borderInlineStyle: 'solid',
          borderInlineWidth: 1
        },
        borderInlineEnd: {
          borderInlineEndColor: 'red',
          borderInlineEndStyle: 'dotted',
          borderInlineEndWidth: 2
        },
        borderInlineStart: {
          borderInlineStartColor: 'green',
          borderInlineStartStyle: 'dashed',
          borderInlineStartWidth: 3
        }
      });

      let root;

      // borderInline
      act(() => {
        root = create(<html.div style={styles.borderInline} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('borderInline');
      act(() => {
        root = create(
          <html.div style={[styles.borderInlineEnd, styles.borderInline]} />
        );
      });
      expect(root.toJSON().props.style).toMatchSnapshot(
        'borderInline after borderInlineEnd'
      );
      act(() => {
        root = create(
          <html.div style={[styles.borderInlineStart, styles.borderInline]} />
        );
      });
      expect(root.toJSON().props.style).toMatchSnapshot(
        'borderInline after borderInlineStart'
      );

      // borderInlineEnd
      act(() => {
        root = create(<html.div style={styles.borderInlineEnd} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('borderInlineEnd');

      // borderInlineStart
      act(() => {
        root = create(<html.div style={styles.borderInlineStart} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('borderInlineStart');
    });

    test('borderRadius', () => {
      const styles = css.create({
        startstart: {
          borderStartStartRadius: 10
        },
        startend: {
          borderStartEndRadius: 10
        },
        endstart: {
          borderEndStartRadius: 10
        },
        endend: {
          borderEndEndRadius: 10
        }
      });

      let root;

      act(() => {
        root = create(<html.div style={styles.startstart} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('startstart');
      act(() => {
        root = create(<html.div style={styles.startend} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('startend');
      act(() => {
        root = create(<html.div style={styles.endstart} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('endstart');
      act(() => {
        root = create(<html.div style={styles.endend} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('endend');
    });

    test('borderStyle', () => {
      const styles = css.create({
        root: {
          borderStyle: 'none',
          borderWidth: 10
        },
        override: {
          borderStyle: 'solid'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
      act(() => {
        root = create(<html.div style={[styles.root, styles.override]} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test.skip('borderWidth', () => {
      const styles = css.create({
        root: {}
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('boxShadow', () => {
      const styles = css.create({
        single: {
          boxShadow: '1px 2px 3px 4px red'
        },
        multi: {
          boxShadow: '1px 2px 3px 4px red, 2px 3px 4px 5px blue'
        },
        inset: {
          boxShadow: 'inset 1px 2px 3px 4px red'
        }
      });

      let root;
      act(() => {
        root = create(<html.div style={styles.single} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('single');
      act(() => {
        root = create(<html.div style={styles.multi} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('multi');
      act(() => {
        root = create(<html.div style={styles.inset} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('inset');
    });

    test('boxSizing: content-box', () => {
      const styles = css.create({
        test: {
          boxSizing: 'content-box',
          borderWidth: 2,
          padding: 10,
          height: 50,
          width: '50%'
        }
      });

      let root;
      act(() => {
        root = create(<html.div style={styles.test} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
    });

    test('caretColor', () => {
      const styles = css.create({
        transparentCaret: {
          caretColor: 'transparent'
        },
        redCaret: {
          caretColor: 'red'
        },
        inheritCaret: {
          caretColor: 'inherit'
        },
        autoCaret: {
          caretColor: 'auto'
        }
      });

      let root;
      act(() => {
        root = create(<html.div style={styles.transparentCaret} />);
      });
      expect(root.toJSON().props).toMatchSnapshot('transparent caret color');
      act(() => {
        root = create(<html.div style={styles.redCaret} />);
      });
      expect(root.toJSON().props).toMatchSnapshot('red caret color');
      act(() => {
        root = create(<html.div style={styles.unsupportedCaret} />);
      });
      expect(root.toJSON().props).toMatchSnapshot('unsupported caret color');

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'unsupported style value in "caretColor:inherit"'
        )
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('unsupported style value in "caretColor:auto"')
      );
    });

    test('direction', () => {
      const styles = css.create({
        ltr: {
          direction: 'ltr'
        },
        rtl: {
          direction: 'rtl'
        }
      });

      let root;
      act(() => {
        root = create(<html.div style={styles.ltr} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('ltr');
      act(() => {
        root = create(<html.div style={styles.rtl} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('rtl');
    });

    test('display', () => {
      const styles = css.create({
        flex: {
          display: 'flex'
        },
        align: {
          alignItems: 'center'
        },
        row: {
          flexDirection: 'row'
        }
      });
      act(() => {
        create(<html.div style={[styles.flex, styles.align]} />);
      });
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('"display:flex" is required')
      );
      act(() => {
        create(<html.div style={[styles.align, styles.row]} />);
      });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"display:flex" is required')
      );
    });

    test('filter', () => {
      const { underTest } = css.create({
        underTest: {
          filter: 'blur(1px)'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('fontSize', () => {
      const styles = css.create({
        root: {
          fontSize: '2.5rem'
        }
      });
      let root;
      act(() => {
        root = create(<html.span style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    describe('fontSize scaling', () => {
      const ReactNative = require('../../src/native/react-native');
      beforeEach(() => {
        ReactNative.useWindowDimensions.mockReturnValue({ fontScale: 2 });
      });
      afterEach(() => {
        ReactNative.useWindowDimensions.mockReturnValue({ fontScale: 1 });
      });

      test('fontScale:2', () => {
        const styles = css.create({
          root: {
            fontSize: '2.5rem'
          }
        });
        let root;
        act(() => {
          root = create(<html.span style={styles.root} />);
        });
        expect(root.toJSON().props.style).toMatchSnapshot();
      });
    });

    test('fontVariant', () => {
      const styles = css.create({
        root: {
          fontVariant: 'common-ligatures small-caps'
        }
      });
      let root;
      act(() => {
        root = create(<html.span style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('fontWeight', () => {
      const styles = css.create({
        number: {
          fontWeight: 900
        },
        string: {
          fontWeight: 'bold'
        }
      });
      let root;
      act(() => {
        root = create(<html.span style={styles.number} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();

      act(() => {
        root = create(<html.span style={styles.string} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('inlineSize', () => {
      const styles = css.create({
        inlineSize: {
          inlineSize: '100px'
        },
        maxInlineSize: {
          maxInlineSize: '100px'
        },
        minInlineSize: {
          minInlineSize: '100px'
        },
        width: (v) => ({ width: v }),
        maxWidth: (v) => ({ maxWidth: v }),
        minWidth: (v) => ({ minWidth: v })
      });

      let root;

      // inlineSize
      act(() => {
        root = create(<html.div style={styles.inlineSize} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('inlineSize');
      act(() => {
        root = create(
          <html.div style={[styles.width(200), styles.inlineSize]} />
        );
      });
      expect(root.toJSON().props.style).toMatchSnapshot(
        'inlineSize after width'
      );

      // maxInlineSize
      act(() => {
        root = create(<html.div style={styles.maxInlineSize} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('maxInlineSize');
      act(() => {
        root = create(
          <html.div style={[styles.maxWidth(200), styles.maxInlineSize]} />
        );
      });
      expect(root.toJSON().props.style).toMatchSnapshot(
        'maxInlineSize after maxWidth'
      );

      // minInlineSize
      act(() => {
        root = create(<html.div style={styles.minInlineSize} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('minInlineSize');
      act(() => {
        root = create(
          <html.div style={[styles.minWidth(200), styles.minInlineSize]} />
        );
      });
      expect(root.toJSON().props.style).toMatchSnapshot(
        'minInlineSize after minWidth'
      );
    });

    test('inset', () => {
      const styles = css.create({
        inset: {
          inset: 1
        },
        insetBlock: {
          insetBlock: 2
        },
        insetBlockStart: {
          insetBlockStart: 3
        },
        insetBlockEnd: {
          insetBlockEnd: 4
        },
        insetInline: {
          insetInline: 5
        },
        insetInlineStart: {
          insetInlineStart: 6
        },
        insetInlineEnd: {
          insetInlineEnd: 7
        },
        physInset: { left: 10, right: 10, bottom: 100, top: 100 },
        physInsetBlock: { bottom: 100, top: 100 },
        physInsetBlockEnd: { top: 100 },
        physInsetBlockStart: { bottom: 100 }
      });
      let root;
      act(() => {
        root = create(<html.span style={styles.inset} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('inset');
      act(() => {
        root = create(<html.span style={styles.insetBlock} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('insetBlock');
      act(() => {
        root = create(<html.span style={styles.insetBlockStart} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('insetBlockStart');
      act(() => {
        root = create(<html.span style={styles.insetBlockEnd} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('insetBlockEnd');
      act(() => {
        root = create(<html.span style={styles.insetInline} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('insetInline');
      act(() => {
        root = create(<html.span style={styles.insetInlineStart} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('insetInlineStart');
      act(() => {
        root = create(<html.span style={styles.insetInlineEnd} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('insetInlineEnd');
      act(() => {
        root = create(<html.span style={[styles.physInset, styles.inset]} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('inset vs phys');
      act(() => {
        root = create(
          <html.span style={[styles.physInsetBlock, styles.insetBlock]} />
        );
      });
      expect(root.toJSON().props.style).toMatchSnapshot('insetBlock vs phys');
      act(() => {
        root = create(
          <html.span style={[styles.physInsetBlockEnd, styles.insetBlockEnd]} />
        );
      });
      expect(root.toJSON().props.style).toMatchSnapshot(
        'insetBlockEnd vs phys'
      );
      act(() => {
        root = create(
          <html.span
            style={[styles.physInsetBlockStart, styles.insetBlockStart]}
          />
        );
      });
      expect(root.toJSON().props.style).toMatchSnapshot(
        'insetBlockStart vs phys'
      );
    });

    test('isolation', () => {
      const { underTest } = css.create({
        underTest: {
          isolation: 'isolate'
        }
      });
      let root;
      act(() => {
        root = create(<html.span style={underTest} />);
      });
      expect(root.toJSON().props).toMatchSnapshot();
    });

    test('lineClamp', () => {
      const styles = css.create({
        root: {
          lineClamp: 3
        }
      });
      let root;
      act(() => {
        root = create(<html.span style={styles.root}>text</html.span>);
      });
      // expect userSelect:none
      // See #136
      expect(root.toJSON()).toMatchSnapshot();
    });

    test('lineHeight', () => {
      const styles = css.create({
        numeric: {
          fontSize: 16,
          lineHeight: 1.5
        },
        string: {
          fontSize: 16,
          lineHeight: '1.5'
        },
        rem: {
          lineHeight: '1.5rem'
        },
        px: {
          lineHeight: '24px'
        }
      });
      let root;
      act(() => {
        root = create(<html.span style={styles.numeric} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('unitless number');
      act(() => {
        root = create(<html.span style={styles.string} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('unitless string');
      act(() => {
        root = create(<html.span style={styles.rem} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('rem');
      act(() => {
        root = create(<html.span style={styles.px} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('px');
    });

    test('margin*', () => {
      const styles = css.create({
        marginBlock: {
          marginBlock: 1
        },
        marginBlockStart: {
          marginBlockStart: 2
        },
        marginBlockEnd: {
          marginBlockEnd: 3
        },
        marginInline: {
          marginInline: 1
        },
        marginInlineStart: {
          marginInlineStart: 2
        },
        marginInlineEnd: {
          marginInlineEnd: 3
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.marginBlock} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('marginBlock');
      act(() => {
        root = create(<html.div style={styles.marginBlockEnd} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('marginBlockEnd');
      act(() => {
        root = create(<html.div style={styles.marginBlockStart} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('marginBlockStart');
      act(() => {
        root = create(<html.div style={styles.marginInline} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('marginInline');
      act(() => {
        root = create(<html.div style={styles.marginInlineEnd} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('marginInlineEnd');
      act(() => {
        root = create(<html.div style={styles.marginInlineStart} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('marginInlineStart');
    });

    // multiple values are unsupported
    test('margin (with multiple values)', () => {
      const { underTest } = css.create({
        underTest: {
          margin: '0 auto'
        }
      });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(
          'Shortform properties cannot contain multiple values'
        )
      );
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    // unsupported
    test('marginStart', () => {
      const { underTest } = css.create({
        underTest: {
          marginStart: 10
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
    });

    // unsupported
    test('marginEnd', () => {
      const { underTest } = css.create({
        underTest: {
          marginEnd: 10
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
    });

    // unsupported
    test('marginHorizontal', () => {
      const { underTest } = css.create({
        underTest: {
          marginHorizontal: 10
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
    });

    // unsupported
    test('marginVertical', () => {
      const { underTest } = css.create({
        underTest: {
          marginVertical: 10
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
    });

    test('mixBlendMode', () => {
      const { underTest } = css.create({
        underTest: {
          mixBlendMode: 'multiply'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('objectFit', () => {
      const styles = css.create({
        contain: {
          objectFit: 'contain'
        },
        cover: {
          objectFit: 'cover'
        },
        fill: {
          objectFit: 'fill'
        },
        scaleDown: {
          objectFit: 'scale-down'
        },
        none: {
          objectFit: 'none'
        }
      });
      let root;
      act(() => {
        root = create(<html.img style={styles.contain} />);
      });
      expect(root.toJSON().props).toMatchSnapshot('contain');
      act(() => {
        root = create(<html.img style={styles.cover} />);
      });
      expect(root.toJSON().props).toMatchSnapshot('cover');
      act(() => {
        root = create(<html.img style={styles.fill} />);
      });
      expect(root.toJSON().props).toMatchSnapshot('fill');
      act(() => {
        root = create(<html.img style={styles.scaleDown} />);
      });
      expect(root.toJSON().props).toMatchSnapshot('scaleDown');
      act(() => {
        root = create(<html.img style={styles.none} />);
      });
      expect(root.toJSON().props).toMatchSnapshot('none');
    });

    test('opacity (string value)', () => {
      const { underTest } = css.create({
        underTest: {
          opacity: '0.25'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('outlineColor,Offset,Style,Width', () => {
      const { underTest } = css.create({
        underTest: {
          outlineColor: 'red',
          outlineOffset: '2px',
          outlineStyle: 'solid',
          outlineWidth: '3px'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('padding*', () => {
      const styles = css.create({
        paddingBlock: {
          paddingBlock: 1
        },
        paddingBlockStart: {
          paddingBlockStart: 2
        },
        paddingBlockEnd: {
          paddingBlockEnd: 3
        },
        paddingInline: {
          paddingInline: 1
        },
        paddingInlineStart: {
          paddingInlineStart: 2
        },
        paddingInlineEnd: {
          paddingInlineEnd: 3
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.paddingBlock} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('paddingBlock');
      act(() => {
        root = create(<html.div style={styles.paddingBlockEnd} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('paddingBlockEnd');
      act(() => {
        root = create(<html.div style={styles.paddingBlockStart} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('paddingBlockStart');
      act(() => {
        root = create(<html.div style={styles.paddingInline} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('paddingInline');
      act(() => {
        root = create(<html.div style={styles.paddingInlineEnd} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('paddingInlineEnd');
      act(() => {
        root = create(<html.div style={styles.paddingInlineStart} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('paddingInlineStart');
    });

    // multiple values are unsupported
    test('padding (with multiple values)', () => {
      const { underTest } = css.create({
        underTest: {
          padding: '1px 2px 3px'
        }
      });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(
          'Shortform properties cannot contain multiple values'
        )
      );
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    // unsupported
    test('paddingStart', () => {
      const { underTest } = css.create({
        underTest: {
          paddingStart: 10
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
    });

    // unsupported
    test('paddingEnd', () => {
      const { underTest } = css.create({
        underTest: {
          paddingEnd: 10
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
    });

    // unsupported
    test('paddingHorizontal', () => {
      const { underTest } = css.create({
        underTest: {
          paddingHorizontal: 10
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
    });

    // unsupported
    test('paddingVertical', () => {
      const { underTest } = css.create({
        underTest: {
          paddingVertical: 10
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={underTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
    });

    test('placeContent', () => {
      const validStyles = css.create({
        center: { placeContent: 'center' },
        flexStart: { placeContent: 'flex-start' },
        longForms: {
          alignContent: 'flex-start',
          justifyContent: 'flex-start'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={validStyles.center} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('center');
      act(() => {
        root = create(<html.div style={validStyles.flexStart} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('flexStart');
      act(() => {
        root = create(
          <html.div style={[validStyles.longForms, validStyles.center]} />
        );
      });
      expect(root.toJSON().props.style).toMatchSnapshot(
        'does not override existing long-forms'
      );

      const inValidStyles = css.create({
        safeCenter: { placeContent: 'safe center' },
        stretch: { placeContent: 'stretch' },
        invalid: { placeContent: 'flex-start flex-end' }
      });
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'unsupported style value in "placeContent:safe center"'
        )
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'unsupported style value in "placeContent:stretch"'
        )
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'unsupported style value in "placeContent:flex-start flex-end"'
        )
      );
      act(() => {
        root = create(<html.div style={inValidStyles.safeCenter} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('safeCenter');
      act(() => {
        root = create(<html.div style={inValidStyles.stretch} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('stretch');
      act(() => {
        root = create(<html.div style={inValidStyles.invalid} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('invalid');
    });

    test('pointerEvents', () => {
      const styles = css.create({
        root: {
          pointerEvents: 'none'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('position', () => {
      const styles = css.create({
        static: {
          position: 'static'
        },
        relative: {
          position: 'relative'
        },
        absolute: {
          position: 'absolute'
        },
        fixed: {
          position: 'fixed'
        },
        sticky: {
          position: 'sticky'
        }
      });
      expect(console.warn).toHaveBeenCalledTimes(2);
      let root;
      act(() => {
        root = create(<html.div style={styles.static} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('static');
      act(() => {
        root = create(<html.div style={styles.relative} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('relative');
      act(() => {
        root = create(<html.div style={styles.absolute} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('absolute');
      act(() => {
        root = create(<html.div style={styles.fixed} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('fixed');
      act(() => {
        root = create(<html.div style={styles.sticky} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('sticky');
    });

    test('positionTryFallbacks', () => {
      css.positionTry({
        left: 0,
        width: 1000
      });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('css.positionTry() is not supported')
      );
    });

    test('textAlign', () => {
      const styles = css.create({
        center: {
          textAlign: 'center'
        },
        end: {
          textAlign: 'end'
        },
        left: {
          textAlign: 'left'
        },
        right: {
          textAlign: 'right'
        },
        start: {
          textAlign: 'start'
        }
      });
      let root;
      act(() => {
        root = create(<html.span style={styles.center} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('center');
      act(() => {
        root = create(<html.span style={styles.end} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('end');
      act(() => {
        root = create(<html.span style={styles.left} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('left');
      act(() => {
        root = create(<html.span style={styles.right} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('right');
      act(() => {
        root = create(<html.span style={styles.start} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('start');
    });

    test('textShadow', () => {
      const styles = css.create({
        single: {
          textShadow: '1px 2px 3px red'
        },
        multi: {
          textShadow: '1px 2px 3px red, 2px 3px 4px blue'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.single} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('single');
      act(() => {
        root = create(<html.div style={styles.multi} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('multi');
      expect(console.warn).toHaveBeenCalledTimes(1);
    });

    test('transform', () => {
      const styles = css.create({
        none: {
          transform: 'none'
        },
        matrix: {
          transform: 'matrix(0.1, 1, -0.3, 1, 0, 0)'
        },
        perspective: {
          transform: 'perspective(10px)'
        },
        rotate: {
          transform:
            'rotate(10deg) rotateX(20deg) rotateY(30deg) rotateZ(40deg) rotate3d(0, 0.5, 1, 90deg)'
        },
        scale: {
          transform:
            'scale(1, 2) scaleX(1) scaleY(2) scaleZ(3) scale3d(1, 2, 3)'
        },
        skew: {
          transform: 'skew(10deg, 15deg) skewX(20deg) skewY(30deg)'
        },
        translate: {
          transform:
            'translate(10px, 20px) translateX(11px) translateY(12px) translateZ(13px) translate3d(20px, 30px, 40px)'
        },
        translatePercentage: {
          transform: 'translateX(10%) translateY(20%)'
        },
        mixed: {
          transform: `
            rotateX(1deg) rotateY(2deg) rotateZ(3deg) rotate3d(1deg, 2deg, 3deg)
            scale(1) scaleX(2) scaleY(3) scaleZ(4) scale3d(1,2,3)
            translateX(1px) translateY(1em) translateZ(1rem) translate3d(1px, 1em, 1rem)
          `
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.none} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('none');
      act(() => {
        root = create(<html.div style={styles.matrix} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('matrix');
      act(() => {
        root = create(<html.div style={styles.perspective} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('perspective');
      act(() => {
        root = create(<html.div style={styles.rotate} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('rotate');
      act(() => {
        root = create(<html.div style={styles.scale} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('scale');
      act(() => {
        root = create(<html.div style={styles.skew} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('skew');
      act(() => {
        root = create(<html.div style={styles.translate} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('translate');
      act(() => {
        root = create(<html.div style={styles.translatePercentage} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot(
        'translate (percentages)'
      );
      act(() => {
        root = create(<html.div style={styles.rotate} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('rotate');
      act(() => {
        root = create(<html.div style={styles.mixed} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('mixed');
    });

    test('userSelect', () => {
      const styles = css.create({
        root: {
          userSelect: 'none'
        }
      });
      let root;
      act(() => {
        root = create(<html.span style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('verticalAlign', () => {
      const styles = css.create({
        middle: {
          verticalAlign: 'middle'
        },
        top: {
          verticalAlign: 'top'
        }
      });
      let root;
      act(() => {
        root = create(<html.span style={styles.middle} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('middle');
      act(() => {
        root = create(<html.span style={styles.top} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot('top');
    });

    test('visibility', () => {
      const styles = css.create({
        collapse: {
          visibility: 'collapse'
        },
        hidden: {
          visibility: 'hidden'
        },
        visible: {
          visibility: 'visible'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.collapse} />);
      });
      expect(root.toJSON().props).toMatchSnapshot('collapse');
      act(() => {
        root = create(<html.div style={styles.hidden} />);
      });
      expect(root.toJSON().props).toMatchSnapshot('hidden');
      act(() => {
        root = create(<html.div style={styles.visible} />);
      });
      expect(root.toJSON().props).toMatchSnapshot('visible');
    });

    test('willChange', () => {
      const styles = css.create({
        root: {
          willChange: 'transform'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props).toMatchSnapshot();
    });

    describe('zIndex', () => {
      test('with position:static', () => {
        const styles = css.create({
          static: {
            position: 'static',
            zIndex: 1
          }
        });
        act(() => {
          create(<html.div style={styles.static} />);
        });
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining(
            '"position:static" prevents "zIndex" from having an effect.'
          )
        );
      });

      test('with position:static flex child', () => {
        const styles = css.create({
          flex: {
            display: 'flex'
          },
          static: {
            position: 'static',
            zIndex: 1
          }
        });
        act(() => {
          create(
            <html.div style={styles.flex}>
              <html.div style={styles.static} />
            </html.div>
          );
        });
        expect(console.error).not.toHaveBeenCalledWith(
          expect.stringContaining(
            '"position:static" prevents "zIndex" from having an effect.'
          )
        );
      });

      test('with position:relative', () => {
        const styles = css.create({
          relative: {
            position: 'relative',
            zIndex: 1
          }
        });
        act(() => {
          create(<html.div style={styles.relative} />);
        });
        expect(console.error).not.toHaveBeenCalledWith(
          expect.stringContaining(
            '"position:static" prevents "zIndex" from having an effect.'
          )
        );
      });
    });
  });

  /**
   * Properties: transition
   */

  describe('properties: "transition"', () => {
    const { Animated, Easing } = require('react-native');

    const styles = css.create({
      none: {
        backgroundColor: 'red'
      },
      backgroundColor: (backgroundColor) => ({
        backgroundColor: backgroundColor ?? 'rgba(0,0,0,0.1)',
        transitionDelay: 200,
        transitionDuration: 2000,
        transitionProperty: 'backgroundColor',
        transitionTimingFunction: 'ease-in-out'
      }),
      opacity: (opacity, timingFunction) => ({
        opacity: opacity ?? 1.0,
        transitionDelay: 50,
        transitionDuration: 1000,
        transitionProperty: 'opacity',
        transitionTimingFunction: timingFunction ?? 'ease-in'
      }),
      transform: (transform) => ({
        transform: transform ?? 'translateY(0px) rotateX(0deg)',
        transitionDelay: 0,
        transitionDuration: 1000,
        transitionProperty: 'transform',
        transitionTimingFunction: 'ease-out'
      }),
      transitionAll: (transform, opacity) => ({
        opacity: opacity ?? 1.0,
        transform: transform ?? 'translateY(0px) rotateX(0deg)',
        transitionDelay: 0,
        transitionDuration: 1000,
        transitionProperty: 'all',
        transitionTimingFunction: 'ease-in'
      }),
      transitionMultiple: (opacity, backgroundColor, transform) => ({
        backgroundColor,
        opacity,
        transform,
        transitionDelay: 0,
        transitionDuration: 1000,
        transitionProperty: 'opacity, backgroundColor',
        transitionTimingFunction: 'ease-in'
      }),
      transitionWithoutProperty: {
        // no transform value is set
        transitionDelay: 0,
        transitionDuration: 1000,
        transitionProperty: 'transform',
        transitionTimingFunction: 'ease-out'
      },
      width: (width) => ({
        width: width ?? 100,
        transitionDelay: 0,
        transitionDuration: 500,
        transitionProperty: 'width',
        transitionTimingFunction: 'ease-out'
      })
    });

    test('transitionDelay', () => {
      const styles = css.create({
        root: {
          transitionDelay: '0.3s'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('transitionDuration', () => {
      const styles = css.create({
        root: {
          transitionDuration: '0.5s'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('transitionProperty', () => {
      const styles = css.create({
        root: {
          transitionProperty: 'opacity'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
      expect(console.warn).not.toHaveBeenCalled();
    });

    test('default', () => {
      let root;
      // default
      act(() => {
        root = create(<html.div />);
      });
      act(() => {
        root.update(<html.div style={styles.none} />);
      });
      // assert no warning if no transition property is specified
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
      expect(Animated.timing).not.toHaveBeenCalled();
      expect(root.toJSON()).toMatchSnapshot('default');
    });

    test('update triggers transition', () => {
      let root;
      // update triggers transition
      act(() => {
        root = create(<html.div style={styles.none} />);
      });
      act(() => {
        root.update(<html.div style={styles.backgroundColor('green')} />);
      });
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
      expect(Animated.timing).toHaveBeenCalled();
      expect(root.toJSON()).toMatchSnapshot('red to green');
      Animated.timing.mockClear();

      act(() => {
        root.update(<html.div style={styles.backgroundColor('blue')} />);
      });
      expect(Animated.timing).toHaveBeenCalled();
      expect(root.toJSON()).toMatchSnapshot('green to blue');
    });

    test('backgroundColor transition', () => {
      let root;
      // backgroundColor transition
      act(() => {
        root = create(<html.div style={styles.backgroundColor()} />);
      });
      expect(root.toJSON()).toMatchSnapshot('start');
      expect(Easing.inOut).not.toHaveBeenCalled();
      act(() => {
        root.update(
          <html.div style={styles.backgroundColor('rgba(255,255,255,0.9)')} />
        );
      });
      expect(root.toJSON()).toMatchSnapshot('end');
      expect(Easing.inOut).toHaveBeenCalled();
      expect(Animated.timing).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          delay: 200,
          duration: 2000,
          useNativeDriver: false
        })
      );
    });

    test('opacity transition', () => {
      let root;
      // opacity transition
      act(() => {
        root = create(<html.div style={styles.opacity()} />);
      });
      expect(root.toJSON()).toMatchSnapshot('start');
      expect(Easing.in).not.toHaveBeenCalled();
      act(() => {
        root.update(<html.div style={styles.opacity(0)} />);
      });
      expect(root.toJSON()).toMatchSnapshot('end');
      expect(Easing.in).toHaveBeenCalled();
      expect(Animated.timing).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          delay: 50,
          duration: 1000,
          useNativeDriver: true
        })
      );
    });

    test('transform transition', () => {
      let root;
      // transform transition
      act(() => {
        root = create(<html.div style={styles.transform()} />);
      });
      expect(root.toJSON()).toMatchSnapshot('start');
      expect(Easing.out).not.toHaveBeenCalled();
      act(() => {
        root.update(
          <html.div
            style={styles.transform('translateY(50px) rotateX(90deg)')}
          />
        );
      });
      expect(root.toJSON()).toMatchSnapshot('end');
      expect(Easing.out).toHaveBeenCalled();
      expect(Animated.timing).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          delay: 0,
          duration: 1000,
          useNativeDriver: true
        })
      );
    });

    test('width transition', () => {
      let root;
      // width transition
      act(() => {
        root = create(<html.div style={styles.width()} />);
      });
      expect(root.toJSON()).toMatchSnapshot('start');
      expect(Easing.out).not.toHaveBeenCalled();
      act(() => {
        root.update(<html.div style={[styles.width(200)]} />);
      });
      expect(root.toJSON()).toMatchSnapshot('end');
      expect(Easing.out).toHaveBeenCalled();
      expect(Animated.timing).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          delay: 0,
          duration: 500,
          useNativeDriver: false
        })
      );
    });

    test('cubic-bezier() timing function', () => {
      const BEZIER_STR = 'cubic-bezier( 0.1,  0.2,0.3  ,0.4)';
      let root;
      act(() => {
        root = create(<html.div style={styles.opacity(1, BEZIER_STR)} />);
      });
      expect(root.toJSON()).toMatchSnapshot('start');
      expect(Easing.bezier).not.toHaveBeenCalled();
      act(() => {
        root.update(<html.div style={styles.opacity(0, BEZIER_STR)} />);
      });
      expect(root.toJSON()).toMatchSnapshot('end');
      expect(Easing.bezier).toHaveBeenCalledWith(0.1, 0.2, 0.3, 0.4);
    });

    test('spring() timing function', () => {
      // spring(mass, stiffness, damping, initialVelocity)
      const SPRING_STR = 'spring( 1,  2,3  , 4 )';
      let root;
      act(() => {
        root = create(<html.div style={styles.opacity(1, SPRING_STR)} />);
      });
      expect(root.toJSON()).toMatchSnapshot('start');
      expect(Animated.spring).not.toHaveBeenCalled();
      expect(Animated.timing).not.toHaveBeenCalled();
      act(() => {
        root.update(<html.div style={styles.opacity(0, SPRING_STR)} />);
      });
      expect(root.toJSON()).toMatchSnapshot('end');
      // Animated.spring(damping, mass, stiffness, toValue, useNativeDriver, velocity)
      expect(Animated.spring).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          damping: 3,
          mass: 1,
          stiffness: 2,
          toValue: 1,
          useNativeDriver: true,
          velocity: 4
        })
      );
      expect(Animated.timing).not.toHaveBeenCalled();

      // Test that we replace invalid spring params and print error msg
      const SPRING_BAD_STR = 'spring(0,0,-1,0)';
      let badRoot;
      act(() => {
        badRoot = create(
          <html.div style={styles.opacity(1, SPRING_BAD_STR)} />
        );
      });
      act(() => {
        badRoot.update(<html.div style={styles.opacity(0, SPRING_BAD_STR)} />);
      });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"mass" must be greater than 0')
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"stiffness" must be greater than 0')
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"damping" must be greater than or equal to 0')
      );
      expect(Animated.spring).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          damping: 10,
          mass: 1,
          stiffness: 100,
          toValue: 1,
          useNativeDriver: true,
          velocity: 0
        })
      );
    });

    test('transition all properties (opacity and transform)', () => {
      let root;
      // transition all properties (opacity and transform)
      act(() => {
        root = create(
          <html.div
            style={styles.transitionAll(
              'perspective(0px) translateY(0px) rotateX(0deg)',
              0.0
            )}
          />
        );
      });
      expect(root.toJSON()).toMatchSnapshot('start');
      expect(Easing.in).not.toHaveBeenCalled();
      act(() => {
        root.update(
          <html.div
            style={styles.transitionAll(
              'perspective(10px) translateY(100px) rotateX(90deg)',
              1.0
            )}
          />
        );
      });
      expect(root.toJSON()).toMatchSnapshot('end');
      expect(Easing.in).toHaveBeenCalled();
    });

    test('transition multiple properties', () => {
      let root;
      // transition multiple properties (opacity & backgroundColor — ignoring the changed transform)
      act(() => {
        root = create(
          <html.div
            style={styles.transitionMultiple(0.0, 'red', 'translateX(0px)')}
          />
        );
      });
      expect(root.toJSON()).toMatchSnapshot('start');
      expect(Easing.in).not.toBeCalled();
      act(() => {
        root.update(
          <html.div
            style={styles.transitionMultiple(1.0, 'green', 'translateX(50px)')}
          />
        );
      });
      expect(root.toJSON()).toMatchSnapshot('end');
      expect(Easing.in).toBeCalled();
    });

    test('transition with missing properties', () => {
      let root;
      // transition with missing properties
      act(() => {
        root = create(<html.div style={styles.transitionWithoutProperty} />);
      });
      act(() => {
        root.update(<html.div style={[styles.transitionWithoutProperty]} />);
      });
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
      expect(root.toJSON()).toMatchSnapshot();
      act(() => {
        root.update(
          <html.div
            style={
              // attempt to transition to an end value without a start value
              styles.transform('translateY(50px) rotateX(90deg)')
            }
          />
        );
      });
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
      expect(root.toJSON()).toMatchSnapshot();
    });

    test('other transforms', () => {
      let root;

      // rotation
      act(() => {
        root = create(
          <html.div
            style={styles.transform(
              'rotate(0deg) rotateX(0deg) rotateY(0deg) rotateZ(0deg)'
            )}
          />
        );
      });
      act(() => {
        root.update(
          <html.div
            style={styles.transform(
              'rotate(1deg) rotateX(2deg) rotateY(3deg) rotateZ(4deg)'
            )}
          />
        );
      });
      expect(root.toJSON()).toMatchSnapshot('rotate');

      // scaling
      act(() => {
        root = create(
          <html.div
            style={styles.transform('scale(0) scaleX(0) scaleY(0) scaleZ(0)')}
          />
        );
      });
      act(() => {
        root.update(
          <html.div
            style={styles.transform('scale(1) scaleX(2) scaleY(4) scaleZ(6)')}
          />
        );
      });
      expect(root.toJSON()).toMatchSnapshot('scale');

      // skewing
      act(() => {
        root = create(
          <html.div style={styles.transform('skewX(0px) skewY(0px)')} />
        );
      });
      act(() => {
        root.update(
          <html.div style={styles.transform('skewX(20px) skewY(21px)')} />
        );
      });
      expect(root.toJSON()).toMatchSnapshot('skew');

      // translating
      act(() => {
        root = create(
          <html.div
            style={styles.transform('translateX(0px) translateY(0px)')}
          />
        );
      });
      act(() => {
        root.update(
          <html.div
            style={styles.transform('translateX(11px) translateY(21px)')}
          />
        );
      });
      expect(root.toJSON()).toMatchSnapshot('translate');
    });

    test('other element types', () => {
      let root;
      // other element types
      act(() => {
        root = create(<html.span style={styles.backgroundColor()} />);
      });
      expect(root.toJSON().type).toBe('Animated.Text');
      act(() => {
        root.update(<html.button style={styles.backgroundColor()} />);
      });
      expect(root.toJSON().type).toMatchSnapshot();
    });
  });

  /**
   * Values: general
   */

  describe('values: general', () => {
    test('calc()', () => {
      const styles = css.create({
        root: {
          width: 'calc(2 * 1rem)'
        }
      });
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
      let root;
      act(() => {
        root = create(<html.span style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('currentcolor', () => {
      const styles = css.create({
        root: {
          color: 'currentcolor'
        }
      });
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
      let root;
      act(() => {
        root = create(<html.span style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('inherit', () => {
      const { fontSize } = css.create({
        fontSize: {
          fontSize: 'inherit'
        }
      });
      let root;
      act(() => {
        root = create(<html.span style={fontSize} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
      expect(console.warn).not.toHaveBeenCalled();

      const { padding } = css.create({
        padding: {
          padding: 'inherit'
        }
      });
      act(() => {
        root = create(<html.span style={padding} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('React Strict DOM')
      );
    });

    test('initial', () => {
      const styles = css.create({
        root: {
          fontSize: 'initial'
        }
      });
      expect(console.warn).toHaveBeenCalled();
      let root;
      act(() => {
        root = create(<html.span style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test('firstThatWorks', () => {
      const styles = css.create({
        root: {
          color: css.firstThatWorks('hsl(0,0,0)', 'rgb(0,0,0)')
        }
      });
      let root;
      act(() => {
        root = create(<html.span style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });
  });

  /**
   * Values: length units
   */

  describe('values: length units', () => {
    const unitsToTest = ['em', 'px', 'rem', 'vh', 'vmax', 'vmin', 'vw'];
    const value = 10;
    const negativeValue = -1 * value;

    for (const unitToTest of unitsToTest) {
      test(`${value} "${unitToTest}" units are resolved to pixels`, () => {
        const styles = css.create({
          root: {
            height: `${negativeValue}${unitToTest}`,
            width: `${value}${unitToTest}`
          }
        });
        let root;
        act(() => {
          root = create(<html.div style={styles.root} />);
        });
        expect(root.toJSON().props.style).toMatchSnapshot(unitToTest);
      });
    }

    test(`${value} "em" units based on font-size`, () => {
      const styles = css.create({
        root: {
          fontSize: 10,
          width: `${value}em`
        }
      });
      let root;
      act(() => {
        root = create(<html.span style={styles.root} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });

    test(`${value} "em" units based on inherited font-size`, () => {
      const styles = css.create({
        root: {
          fontSize: 12
        },
        underTest: {
          width: `${value}em`
        }
      });
      let root;
      act(() => {
        root = create(
          <html.div style={styles.root}>
            <html.div style={styles.underTest} />
          </html.div>
        );
      });
      expect(root.toJSON().children[0].props.style).toMatchSnapshot();
    });

    test("'0' is resolved to the number 0", () => {
      const styles = css.create({
        zeroStringTest: {
          borderRadius: '0',
          width: '0'
        }
      });
      let root;
      act(() => {
        root = create(<html.span style={styles.zeroStringTest} />);
      });
      expect(root.toJSON().props.style).toMatchSnapshot();
    });
  });

  /**
   * Values: object (states)
   */

  describe('values: object states', () => {
    const styles = css.create({
      hover: {
        backgroundColor: {
          default: 'white',
          ':hover': 'red'
        }
      },
      focus: {
        backgroundColor: {
          default: 'white',
          ':focus': 'green'
        }
      },
      active: {
        backgroundColor: {
          default: 'white',
          ':active': 'blue'
        }
      },
      all: {
        backgroundColor: {
          default: 'white',
          ':hover': 'red',
          ':focus': 'green',
          ':active': 'blue'
        }
      }
    });

    const getElement = (root) => root.root.children[0];
    const getBackgroundColor = (element) => element.props.style.backgroundColor;

    test('hover (mouse)', () => {
      const onMouseEnter = jest.fn();
      const onMouseLeave = jest.fn();
      let root;
      act(() => {
        root = create(
          <html.div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={styles.hover}
          />
        );
      });
      act(() => {
        getElement(root).props.onMouseEnter();
      });
      expect(getBackgroundColor(getElement(root))).toBe('red');
      expect(onMouseEnter).toHaveBeenCalled();
      act(() => {
        getElement(root).props.onMouseLeave();
      });
      expect(getBackgroundColor(getElement(root))).toBe('white');
      expect(onMouseLeave).toHaveBeenCalled();
      act(() => {
        getElement(root).props.onMouseEnter();
      });
      expect(getBackgroundColor(getElement(root))).toBe('red');
    });

    test('hover (pointer)', () => {
      const onPointerEnter = jest.fn();
      const onPointerLeave = jest.fn();
      let root;
      act(() => {
        root = create(
          <html.div
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            style={styles.hover}
          />
        );
      });
      act(() => {
        getElement(root).props.onPointerEnter();
      });
      expect(getBackgroundColor(getElement(root))).toBe('red');
      expect(onPointerEnter).toHaveBeenCalled();
      act(() => {
        getElement(root).props.onPointerLeave();
      });
      expect(getBackgroundColor(getElement(root))).toBe('white');
      expect(onPointerLeave).toHaveBeenCalled();
      act(() => {
        getElement(root).props.onPointerEnter();
      });
      expect(getBackgroundColor(getElement(root))).toBe('red');
    });

    test('focus', () => {
      const onBlur = jest.fn();
      const onFocus = jest.fn();
      let root;
      act(() => {
        root = create(
          <html.input onBlur={onBlur} onFocus={onFocus} style={styles.focus} />
        );
      });
      act(() => {
        getElement(root).props.onFocus();
      });
      expect(getBackgroundColor(getElement(root))).toBe('green');
      expect(onFocus).toHaveBeenCalled();
      act(() => {
        getElement(root).props.onBlur();
      });
      expect(getBackgroundColor(getElement(root))).toBe('white');
      expect(onBlur).toHaveBeenCalled();
    });

    test('active', () => {
      const onPointerCancel = jest.fn();
      const onPointerDown = jest.fn();
      const onPointerUp = jest.fn();
      let root;
      act(() => {
        root = create(
          <html.input
            onPointerCancel={onPointerCancel}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            style={styles.active}
          />
        );
      });
      act(() => {
        getElement(root).props.onPointerDown();
      });
      expect(getBackgroundColor(getElement(root))).toBe('blue');
      expect(onPointerDown).toHaveBeenCalled();
      act(() => {
        getElement(root).props.onPointerUp();
      });
      expect(getBackgroundColor(getElement(root))).toBe('white');
      expect(onPointerUp).toHaveBeenCalled();
      act(() => {
        getElement(root).props.onPointerDown();
      });
      expect(getBackgroundColor(getElement(root))).toBe('blue');
      act(() => {
        getElement(root).props.onPointerCancel();
      });
      expect(getBackgroundColor(getElement(root))).toBe('white');
      expect(onPointerCancel).toHaveBeenCalled();
    });

    test('all', () => {
      const onBlur = jest.fn();
      const onFocus = jest.fn();
      const onPointerDown = jest.fn();
      const onPointerEnter = jest.fn();
      const onPointerLeave = jest.fn();
      const onPointerUp = jest.fn();
      let root;
      act(() => {
        root = create(
          <html.input
            onBlur={onBlur}
            onFocus={onFocus}
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerUp={onPointerUp}
            style={styles.all}
          />
        );
      });
      act(() => {
        getElement(root).props.onPointerEnter();
      });
      expect(getBackgroundColor(getElement(root))).toBe('red');
      act(() => {
        getElement(root).props.onPointerDown();
        getElement(root).props.onFocus();
      });
      expect(getBackgroundColor(getElement(root))).toBe('blue');
      act(() => {
        getElement(root).props.onPointerUp();
      });
      expect(getBackgroundColor(getElement(root))).toBe('green');
      act(() => {
        getElement(root).props.onPointerLeave();
      });
      expect(getBackgroundColor(getElement(root))).toBe('green');
    });
  });

  /**
   * Styles: pseudo-elements
   */

  describe('pseudo-elements', () => {
    test('::placeholder syntax', () => {
      const styles = css.create({
        root: {
          '::placeholder': {
            color: 'red',
            fontWeight: 'bold'
          }
        }
      });
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'unsupported "::placeholder" style property "fontWeight"'
        )
      );
      let root;
      act(() => {
        root = create(<html.span style={styles.root} />);
      });
      expect(root.toJSON().props).toMatchSnapshot('placeholderTextColor');
    });
  });
});
