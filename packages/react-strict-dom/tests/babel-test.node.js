/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const reactStrictPreset = require('../babel/preset');
const jsx = require('@babel/plugin-syntax-jsx');

function transform(source, pluginOptions = {}) {
  return transformSync(source, {
    filename: 'root/foo/bar/baz.js',
    parserOpts: {
      flow: 'all'
    },
    presets: [[reactStrictPreset, { debug: false, ...pluginOptions }]],
    plugins: [jsx]
  }).code;
}

describe('react-strict-dom/babel-preset', () => {
  test('emits base and nested media declarations for variables', () => {
    const { metadata } = transformSync(
      `
        import { css } from 'react-strict-dom';
        export const tokens = css.defineVars({
          '--rsd-size': {
            default: '1rem',
            '@media (min-width: 400px)': {
              default: '2rem',
              '@media (prefers-color-scheme: dark)': '3rem'
            },
            '@media (prefers-color-scheme: dark)': '1.5rem'
          },
          '--rsd-opacity': {
            default: null,
            '@media (min-width: 400px)': 0
          }
        });
      `,
      {
        filename: 'tokens.css.js',
        presets: [[reactStrictPreset, { debug: false }]]
      }
    );
    const css = reactStrictPreset.generateStyles(metadata.stylex);
    expect(css.split('\n')).toEqual([
      expect.stringMatching(/^:root.*\{--rsd-size:1rem;\}$/),
      expect.stringMatching(
        /^@media \(prefers-color-scheme: dark\).*--rsd-size:1\.5rem;/
      ),
      expect.stringMatching(
        /^@media \(min-width: 400px\).*--rsd-size:2rem;--rsd-opacity:0;/
      ),
      expect.stringMatching(
        /^@media \(prefers-color-scheme: dark\).*@media \(min-width: 400px\).*--rsd-size:3rem;/
      )
    ]);
  });

  describe('[transform] ignore unrelated elements', () => {
    test('noop <div>', () => {
      expect(
        transform(`
          function App() {
            return <div />;
          };
        `)
      ).toMatchSnapshot();
    });

    test('noop <div style={{}}>', () => {
      expect(
        transform(`
          function App() {
            return <div style={{}} />;
          };
        `)
      ).toMatchSnapshot();
    });

    test('noop <View style={{}}>', () => {
      expect(
        transform(`
          function App() {
            return <View style={{}} />;
          };
        `)
      ).toMatchSnapshot();
    });
  });

  describe('[transform] <html.*> elements', () => {
    test('basic element', () => {
      expect(
        transform(`
          import {html} from 'react-strict-dom';
          function App() {
            return <html.div />;
          };
        `)
      ).toMatchSnapshot();
    });

    test('styled elements', () => {
      expect(
        transform(`
          import {html} from 'react-strict-dom';
          function App() {
            return <html.div style={styles.one} />;
          };
        `)
      ).toMatchSnapshot('simple');

      expect(
        transform(`
          import {html} from 'react-strict-dom';
          function App() {
            return <html.div style={[styles.one, styles.two]} />;
          };
        `)
      ).toMatchSnapshot('array');
    });

    test('other props', () => {
      expect(
        transform(`
          import {html} from 'react-strict-dom';
          function App() {
            return (
              <html.div role="none">
                <html.label for="for" />
                <html.input />
                <html.textarea />
                <html.input dir="rtl" />
                <html.textarea dir="rtl" />
                <html.button />
                <html.button type="submit" />
              </html.div>
            );
          };
        `)
      ).toMatchSnapshot();
    });

    test('aliased imports', () => {
      expect(
        transform(`
          import {html as h} from 'react-strict-dom';
          function App() {
            return (
              <h.div style={[styles.root]} />
            );
          };
        `)
      ).toMatchSnapshot();
    });

    test('repeated imports', () => {
      expect(
        transform(`
        import {html} from 'react-strict-dom';
        import {html as h} from 'react-strict-dom';
        function App() {
          return (
            <h.div style={[styles.root]}>
              <html.span />
            </h.div>
          );
        };
        `)
      ).toMatchSnapshot();
    });

    test('debug mode', () => {
      const opts = { debug: true };
      const source = `
      import {html as h} from 'react-strict-dom'
      function App() {
        return (
          <h.div />
        );
      };
      `;
      // expect line-number to be 5
      expect(transform(source, opts)).toMatchSnapshot();
    });
  });
});
