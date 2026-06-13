/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { css, html } from 'react-strict-dom';
import { act, create } from 'react-test-renderer';

describe('<html.*> (native polyfills)', () => {
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

  test('opt in to strict layout conformance', () => {
    let root;
    act(() => {
      root = create(<html.div data-layoutconformance="strict" />);
    });
    expect(root.toJSON()).toMatchSnapshot('strict layout');
  });

  test('auto-wraps raw strings', () => {
    const styles = css.create({
      root: {
        color: 'black'
      }
    });

    let root;
    act(() => {
      root = create(<html.div style={styles.root}>text</html.div>);
    });
    expect(root.toJSON()).toMatchSnapshot('auto-wrap raw strings');
  });

  describe('polyfills: layout', () => {
    test('default block layout', () => {
      let root;
      act(() => {
        root = create(<html.div />);
      });
      expect(root.toJSON()).toMatchSnapshot('block layout');
    });

    test('default flex layout', () => {
      const styles = css.create({
        root: {
          display: 'flex'
        }
      });

      let root;
      act(() => {
        root = create(
          <html.div style={styles.root}>
            <html.div />
            <html.div />
          </html.div>
        );
      });
      expect(root.toJSON()).toMatchSnapshot('flex layout');
    });

    test('block layout override of flex layout', () => {
      const styles = css.create({
        root: {
          flexDirection: 'row',
          alignItems: 'start',
          flexShrink: '1',
          display: 'block'
        }
      });

      let root;
      act(() => {
        root = create(
          <html.div style={styles.root}>
            <html.div />
          </html.div>
        );
      });
      expect(root.toJSON()).toMatchSnapshot('block layout override of flex');
    });

    [
      'alignContent',
      'alignItems',
      'columnGap',
      'flexDirection',
      'flexWrap',
      'gap',
      'justifyContent',
      'rowGap'
    ].forEach((styleProp) => {
      test(`block layout error: "${styleProp}"`, () => {
        const styles = css.create({
          root: {
            [styleProp]: 'center'
          }
        });
        act(() => {
          create(<html.div style={styles.root} />);
        });
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining(
            `"display:flex" is required for "${styleProp}" to have an effect.`
          )
        );
      });
    });

    ['flex', 'flexBasis', 'flexGrow', 'flexShrink'].forEach((styleProp) => {
      test(`block layout error for flex child: "${styleProp}"`, () => {
        const styles = css.create({
          root: {
            [styleProp]: 1
          }
        });
        act(() => {
          create(
            <html.div>
              <html.div style={styles.root} />
            </html.div>
          );
        });
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining(
            `"display:flex" is required on the parent for "${styleProp}" to have an effect.`
          )
        );
      });
    });
  });

  describe('polyfills: props', () => {
    describe('global', () => {
      test('"dir" prop', () => {
        ['auto', 'ltr', 'rtl'].forEach((dir) => {
          let block, text;
          act(() => {
            block = create(<html.div dir={dir} />);
          });
          act(() => {
            text = create(<html.p dir={dir} />);
          });
          expect(block.toJSON()).toMatchSnapshot(`"${dir}" block`);
          expect(text.toJSON()).toMatchSnapshot(`"${dir}" text`);
        });
      });

      test('"hidden" prop', () => {
        let root;
        act(() => {
          root = create(<html.div hidden />);
        });

        expect(root.toJSON()).toMatchSnapshot();

        let rootOther;
        act(() => {
          rootOther = create(<html.div hidden style={{ display: 'flex' }} />);
        });
        expect(rootOther.toJSON()).toMatchSnapshot('display set');

        [true, false, 'true', 'false', 'hidden', 'until-found'].forEach(
          (hidden) => {
            let root;
            act(() => {
              root = create(<html.input hidden={hidden} />);
            });
            expect(root.toJSON()).toMatchSnapshot(`"${hidden}"`);
          }
        );
      });

      test('"inputMode" prop', () => {
        ['decimal', 'email', 'numeric', 'search', 'tel', 'url'].forEach(
          (inputMode) => {
            let root;
            act(() => {
              root = create(<html.input inputMode={inputMode} />);
            });
            expect(root.toJSON()).toMatchSnapshot(`"${inputMode}"`);
          }
        );
      });

      test('"onClick" prop', () => {
        const onClick = jest.fn();
        let root;
        act(() => {
          root = create(<html.div onClick={onClick} />);
        });
        act(() => {
          root.root.children[0].props.onPress({
            nativeEvent: {
              altKey: true,
              button: 0,
              ctrlKey: true,
              metaKey: true,
              shiftKey: true
            }
          });
        });
        expect(onClick).toHaveBeenCalledWith(
          expect.objectContaining({
            altKey: true,
            button: 0,
            ctrlKey: true,
            metaKey: true,
            shiftKey: true,
            type: 'click'
          })
        );
      });

      test('"onKeyDown" prop', () => {
        const onKeyDown = jest.fn();
        let root;
        act(() => {
          root = create(<html.input onKeyDown={onKeyDown} />);
        });
        act(() => {
          root.root.children[0].props.onKeyPress({ nativeEvent: { key: 'a' } });
        });
        expect(onKeyDown).toHaveBeenCalledWith(
          expect.objectContaining({
            key: 'a',
            type: 'keydown'
          })
        );
        act(() => {
          root.root.children[0].props.onSubmitEditing();
        });
        expect(onKeyDown).toHaveBeenCalledWith(
          expect.objectContaining({
            key: 'Enter',
            type: 'keydown'
          })
        );
      });

      test('"tabIndex" prop', () => {
        let root;
        act(() => {
          root = create(<html.input tabIndex={-1} />);
        });
        expect(root.toJSON()).toMatchSnapshot();
      });
    });

    describe('<img>', () => {
      test('"src" prop with loading props', () => {
        let root;
        act(() => {
          root = create(
            <html.img
              crossOrigin="use-credentials"
              decoding="async"
              fetchPriority="auto"
              loading="lazy"
              referrerPolicy="no-referrer"
              src="https://src.jpg"
            />
          );
        });
        expect(root.toJSON()).toMatchSnapshot();
      });

      test('"srcSet" prop with loading props', () => {
        let root;
        act(() => {
          root = create(
            <html.img
              crossOrigin="use-credentials"
              decoding="async"
              fetchPriority="auto"
              loading="lazy"
              referrerPolicy="no-referrer"
              srcSet="https://src.jpg 1x, https://srcx2.jpg 2x"
            />
          );
        });
        expect(root.toJSON()).toMatchSnapshot();
      });

      test('"onError" and "onLoad" prop', () => {
        const onError = jest.fn();
        const onLoad = jest.fn();

        let root;
        act(() => {
          root = create(
            <html.img onError={onError} onLoad={onLoad} src="https://src.jpg" />
          );
        });
        const element = root.toJSON();

        element.props.onError();
        expect(onError).toHaveBeenCalledWith({ type: 'error' });

        // Expected event shape
        element.props.onLoad({
          nativeEvent: {
            source: {
              height: 100,
              width: 200
            }
          }
        });
        expect(onLoad).toHaveBeenCalledWith({
          target: {
            naturalHeight: 100,
            naturalWidth: 200
          },
          type: 'load'
        });

        // Fabric event bug
        element.props.onLoad({
          nativeEvent: {
            source: undefined
          }
        });
        expect(onLoad).toHaveBeenCalledWith({
          target: {
            naturalHeight: undefined,
            naturalWidth: undefined
          },
          type: 'load'
        });
      });
    });

    describe('<input>', () => {
      test('"autoComplete" prop', () => {
        [
          'additional-name',
          'address-line1',
          'address-line2',
          'bday',
          'bday-day',
          'bday-month',
          'bday-year',
          'cc-csc',
          'cc-exp',
          'cc-exp-month',
          'cc-exp-year',
          'cc-number',
          'country',
          'current-password',
          'email',
          'family-name',
          'given-name',
          'honorific-prefix',
          'honorific-suffix',
          'name',
          'new-password',
          'nickname',
          'off',
          'on',
          'one-time-code',
          'organization',
          'organization-title',
          'postal-code',
          'sex',
          'street-address',
          'tel',
          'tel-country-code',
          'tel-national',
          'url',
          'username'
        ].forEach((autoComplete) => {
          let root;
          act(() => {
            root = create(<html.input autoComplete={autoComplete} />);
          });
          expect(root.toJSON()).toMatchSnapshot(`"${autoComplete}"`);
        });
      });

      test('"autoCapitalize" prop', () => {
        ['none', 'sentences', 'words', 'characters'].forEach(
          (autoCapitalize) => {
            let root;
            act(() => {
              root = create(<html.input autoCapitalize={autoCapitalize} />);
            });
            expect(root.toJSON()).toMatchSnapshot(`"${autoCapitalize}"`);
          }
        );
      });

      test('"disabled" prop', () => {
        let root;
        act(() => {
          root = create(<html.input disabled={true} />);
        });
        expect(root.toJSON()).toMatchSnapshot();
      });

      test('"readOnly" prop', () => {
        let root;
        act(() => {
          root = create(<html.input readOnly />);
        });
        expect(root.toJSON()).toMatchSnapshot();
      });

      test('"onChange" and "onInput" prop', () => {
        const onChange = jest.fn();
        const onInput = jest.fn();
        let root;
        act(() => {
          root = create(<html.input onChange={onChange} onInput={onInput} />);
        });
        const element = root.toJSON();
        element.props.onChange({
          nativeEvent: {
            text: 'hello world'
          }
        });
        // onChange and onInput are aliases in React DOM (not spec compliant)
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              value: 'hello world'
            }),
            type: 'change'
          })
        );
        expect(onInput).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              value: 'hello world'
            }),
            type: 'input'
          })
        );
      });

      test('"type" prop', () => {
        ['email', 'number', 'password', 'search', 'tel', 'url'].forEach(
          (type) => {
            let root;
            act(() => {
              root = create(<html.input type={type} />);
            });
            expect(root.toJSON()).toMatchSnapshot(`"${type}"`);
          }
        );

        ['checkbox', 'date', 'radio'].forEach((type, i) => {
          act(() => {
            create(<html.input type={type} />);
          });
          expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('React Strict DOM')
          );
        });
      });

      test('"style" prop', () => {
        const styles = css.create({
          input: {
            color: 'red',
            fontWeight: 'bold',
            '::placeholder': {
              color: 'pink'
            }
          }
        });
        let root;
        act(() => {
          root = create(<html.input style={styles.input} />);
        });
        expect(root.toJSON()).toMatchSnapshot();
      });
    });

    describe('<textarea>', () => {
      test('"disabled" prop', () => {
        let root;
        act(() => {
          root = create(<html.textarea disabled={true} />);
        });
        expect(root.toJSON()).toMatchSnapshot();
      });

      test('"readOnly" prop', () => {
        let root;
        act(() => {
          root = create(<html.textarea readOnly />);
        });
        expect(root.toJSON()).toMatchSnapshot();
      });

      test('"rows" prop', () => {
        let root;
        act(() => {
          root = create(<html.textarea rows={5} />);
        });
        expect(root.toJSON()).toMatchSnapshot();
      });
    });
  });

  describe('polyfills: inheritence', () => {
    test('inherited styles', () => {
      const styles = css.create({
        inherits: {
          borderColor: 'red', // e.g., should not inherit
          color: 'red',
          cursor: 'pointer',
          fontFamily: 'Arial',
          fontSize: '2em',
          fontStyle: 'italic',
          fontVariant: 'variant',
          fontWeight: 'bold',
          letterSpacing: '10px',
          lineHeight: 2,
          textAlign: 'right',
          textDecorationColor: 'red',
          textDecorationLine: 'underline',
          textDecorationStyle: 'solid',
          textIndent: '10px',
          textTransform: 'uppercase',
          whiteSpace: 'pre'
        },
        alsoInherits: {
          fontWeight: 300,
          fontSize: '2em'
        },
        text: {
          fontSize: '1.5em'
        }
      });
      // This also tests that unitless line-height is correctly inherited, including
      // through nested text elements.
      let root;
      act(() => {
        root = create(
          <html.div style={styles.inherits}>
            <html.div style={styles.alsoInherits}>
              <html.span style={styles.text}>Inherits text styles</html.span>
              <html.input placeholder="Does not inherit text styles" />
            </html.div>
          </html.div>
        );
      });
      expect(root.toJSON()).toMatchSnapshot();
    });

    test('inherited fontSize', () => {
      const tokens = css.defineVars({
        rootFontSize: '2em',
        rootFontSizeHover: '3em',
        nestedFontSize: '1.5em'
      });

      const styles = css.create({
        root: {
          fontSize: {
            default: tokens.rootFontSize,
            ':hover': tokens.rootFontSizeHover
          }
        },
        nested: {
          fontSize: tokens.nestedFontSize
        }
      });
      let root;
      act(() => {
        root = create(
          <html.div style={styles.root}>
            <html.span>text</html.span>
            <html.span style={styles.nested}>text</html.span>
          </html.div>
        );
      });
      const getFontSize = (element) => element.props.style.fontSize;
      let rootElement = root.toJSON();
      let firstChild = rootElement.children[0];
      let secondSecond = rootElement.children[1];
      expect(getFontSize(firstChild)).toBe(2 * 16);
      // check that 'em' values are correctly inherited
      expect(getFontSize(secondSecond)).toBe(1.5 * 2 * 16);
      // check hover interaction updates inherited value
      act(() => {
        rootElement.props.onMouseEnter();
      });
      rootElement = root.toJSON();
      firstChild = rootElement.children[0];
      secondSecond = rootElement.children[1];
      expect(getFontSize(firstChild)).toBe(3 * 16);
      expect(getFontSize(secondSecond)).toBe(1.5 * 3 * 16);
    });

    test('inherited lineHeight (unitless)', () => {
      const styles = css.create({
        root: {
          lineHeight: 2
        },
        text: {
          fontSize: '2em'
        },
        nestedText: {
          lineHeight: '0.5'
        }
      });
      let root;
      act(() => {
        root = create(
          <html.div style={styles.root}>
            <html.span style={styles.text}>
              <html.span style={styles.nestedText}>hello</html.span>
            </html.span>
          </html.div>
        );
      });
      const getLineHeight = (element) => element.props.style.lineHeight;
      const rootElement = root.toJSON();
      const firstChild = rootElement.children[0];
      const firstGrandChild = firstChild.children[0];
      expect(getLineHeight(firstChild)).toBe(64);
      expect(getLineHeight(firstGrandChild)).toBe(16);
    });

    test('inherited lineHeight (em)', () => {
      const styles = css.create({
        root: {
          lineHeight: '2em'
        },
        text: {
          fontSize: '2em'
        },
        nestedText: {
          lineHeight: 2
        }
      });
      let root;
      act(() => {
        root = create(
          <html.div style={styles.root}>
            <html.span style={styles.text}>
              <html.span style={styles.nestedText}>hello</html.span>
            </html.span>
          </html.div>
        );
      });
      const getLineHeight = (element) => element.props.style.lineHeight;
      const rootElement = root.toJSON();
      const firstChild = rootElement.children[0];
      const firstGrandChild = firstChild.children[0];

      expect(getLineHeight(firstChild)).toBe(32);
      expect(getLineHeight(firstGrandChild)).toBe(64);
    });

    test('inherited styles for auto-fix of raw strings', () => {
      const tokens = css.defineVars({
        color: 'red',
        fontSize: '1em',
        lineHeight: 1
      });
      const theme = css.createTheme(tokens, {
        color: 'green',
        fontSize: '2em',
        lineHeight: 3
      });

      const styles = css.create({
        root: {
          color: tokens.color,
          fontSize: tokens.fontSize,
          lineHeight: tokens.lineHeight
        },
        text: {
          fontSize: tokens.fontSize
        }
      });

      let root;
      act(() => {
        root = create(
          <html.div style={[theme, styles.root]}>
            <html.div style={styles.text}>text</html.div>
          </html.div>
        );
      });
      expect(root.toJSON()).toMatchSnapshot();
    });

    test('fontSize to resolve em units', () => {
      const styles = css.create({
        root: {
          fontSize: '2em',
          maxHeight: '2em'
        }
      });
      let root;
      act(() => {
        root = create(<html.div style={styles.root} />);
      });
      const rootElement = root.toJSON();
      expect(rootElement.props.style.fontSize).toBeUndefined();
      expect(rootElement.props.style.maxHeight).toBe(2 * 2 * 16);
    });

    test('"inherit" and "unset" keyword', () => {
      const styles = css.create({
        root: {
          backgroundColor: 'red',
          color: 'green',
          cursor: 'crosshair',
          direction: 'rtl',
          fontFamily: 'Foo',
          fontSize: '2em',
          fontStyle: 'oblique',
          fontVariant: 'small-caps',
          fontWeight: '300',
          letterSpacing: '2px',
          lineHeight: '30px',
          textAlign: 'center',
          textDecorationColor: 'red',
          textDecorationLine: 'dashed',
          textDecorationStyle: 'solid',
          textIndent: '10px',
          textTransform: 'uppercase',
          whiteSpace: 'pre'
        },
        inherit: {
          backgroundColor: 'inherit',
          color: {
            default: 'inherit',
            ':hover': 'red'
          },
          cursor: 'inherit',
          direction: 'inherit',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          fontStyle: 'inherit',
          fontVariant: 'inherit',
          fontWeight: 'inherit',
          letterSpacing: 'inherit',
          lineHeight: 'inherit',
          textAlign: 'inherit',
          textDecorationColor: 'inherit',
          textDecorationLine: 'inherit',
          textDecorationStyle: 'inherit',
          textIndent: 'inherit',
          textTransform: 'inherit',
          whiteSpace: 'inherit'
        },
        unset: {
          backgroundColor: 'unset',
          color: 'unset',
          cursor: 'unset',
          direction: 'unset',
          fontFamily: 'unset',
          fontSize: 'unset',
          fontStyle: 'unset',
          fontVariant: 'unset',
          fontWeight: 'unset',
          letterSpacing: 'unset',
          lineHeight: 'unset',
          textAlign: 'unset',
          textDecorationColor: 'unset',
          textDecorationLine: 'unset',
          textDecorationStyle: 'unset',
          textIndent: 'unset',
          textTransform: 'unset',
          whiteSpace: 'unset'
        }
      });
      let root;
      act(() => {
        root = create(
          <html.div style={styles.root}>
            <html.span style={styles.inherit}>text</html.span>
            <html.h1 style={styles.inherit}>text</html.h1>
            <html.a style={styles.inherit}>text</html.a>
            <html.span style={styles.unset}>text</html.span>
            <html.h1 style={styles.unset}>text</html.h1>
            <html.a style={styles.unset}>text</html.a>
          </html.div>
        );
      });
      const getStyle = (element) => element.props.style;
      const rootElement = root.toJSON();

      // "inherit"
      let span = rootElement.children[0];
      let h1 = rootElement.children[1];
      let a = rootElement.children[2];
      expect(getStyle(span).backgroundColor).toBeUndefined();
      expect(getStyle(span).color).toBe('green');
      expect(getStyle(span).cursor).toBe('crosshair');
      expect(getStyle(span).direction).toBe('inherit');
      expect(getStyle(span).fontFamily).toBe('Foo');
      expect(getStyle(span).fontSize).toBe(32);
      expect(getStyle(span).fontStyle).toBe('oblique');
      expect(getStyle(span).fontVariant).toBe('small-caps');
      expect(getStyle(span).fontWeight).toBe('300');
      expect(getStyle(span).letterSpacing).toBe(2);
      expect(getStyle(span).lineHeight).toBe(30);
      expect(getStyle(span).textAlign).toBe('center');
      expect(getStyle(span).textDecorationColor).toBe('red');
      expect(getStyle(span).textDecorationLine).toBe('dashed');
      expect(getStyle(span).textDecorationStyle).toBe('solid');
      //expect(getStyle(span).textIndent).toBe('10px');
      expect(getStyle(span).textTransform).toBe('uppercase');
      //expect(getStyle(span).whiteSpace).toBe('pre');
      // h1 has default fontSize and fontWeight
      expect(getStyle(h1).fontSize).toBe(32);
      expect(getStyle(h1).fontWeight).toBe('300');
      // a has default color and textDecorationLine
      expect(getStyle(a).color).toBe('green');
      expect(getStyle(a).textDecorationLine).toBe('dashed');
      // check that pseudo-states still work
      act(() => {
        span.props.onPointerEnter();
      });
      expect(getStyle(root.toJSON().children[0]).color).toBe('red');

      // "unset" (behaves like "inherit" for inherited properties)
      span = rootElement.children[3];
      h1 = rootElement.children[4];
      a = rootElement.children[5];
      expect(getStyle(span).backgroundColor).toBeUndefined();
      expect(getStyle(span).color).toBe('green');
      expect(getStyle(span).cursor).toBe('crosshair');
      expect(getStyle(span).direction).toBe('inherit');
      expect(getStyle(span).fontFamily).toBe('Foo');
      expect(getStyle(span).fontSize).toBe(32);
      expect(getStyle(span).fontStyle).toBe('oblique');
      expect(getStyle(span).fontVariant).toBe('small-caps');
      expect(getStyle(span).fontWeight).toBe('300');
      expect(getStyle(span).letterSpacing).toBe(2);
      expect(getStyle(span).lineHeight).toBe(30);
      expect(getStyle(span).textAlign).toBe('center');
      expect(getStyle(span).textDecorationColor).toBe('red');
      expect(getStyle(span).textDecorationLine).toBe('dashed');
      expect(getStyle(span).textDecorationStyle).toBe('solid');
      //expect(getStyle(span).textIndent).toBe('10px');
      expect(getStyle(span).textTransform).toBe('uppercase');
      //expect(getStyle(span).whiteSpace).toBe('pre');
      // h1 has default fontSize and fontWeight
      expect(getStyle(h1).fontSize).toBe(32);
      expect(getStyle(h1).fontWeight).toBe('300');
      // a has default color and textDecorationLine
      expect(getStyle(a).color).toBe('green');
      expect(getStyle(a).textDecorationLine).toBe('dashed');
    });

    test.skip('"initial" keyword', () => {});
  });
});
