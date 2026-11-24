/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Modified source: https://github.com/ericf/css-mediaquery
 * Copyright (c) 2014, Yahoo! Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 * https://github.com/ericf/css-mediaquery/blob/master/LICENSE
 *
 * @noflow
 */

/**
 * Parses and determines if a given CSS Media Query matches a set of values via
 * JavaScript. This package has two exports: `parse()` and `match()`.
 *
 * **Matching**
 *
 * The `match()` method lets you compare a media query expression with a JavaScript
 * object and determine if a media query matches a given set of values.
 *
 *     const isMatch = mediaQuery.match(mediaQueryString, stateObject);
 *
 * A `type` value must be included in the state and it can't be "all".
 *
 * Parsing
 *
 * You can parse a media query expression and get an AST back by using the
 * `parse()` method.
 *
 *     const ast = mediaQuery.parse(mediaQueryString);
 *
 * The AST has the following shape:
 *
 *     [{
 *        inverse: false,
 *        type: 'screen',
 *        expressions: [{
 *          modifier: 'min',
 *          feature : 'width',
 *          value   : '48em'
 *        }]
 *      }]
 */

'use strict';

// -----------------------------------------------------------------------------

const RE_MEDIA_QUERY =
  /^(?:(only|not)?\s*([_a-z][_a-z0-9-]*)|(\([^)]+\)))(?:\s*and\s*(.*))?$/i;
const RE_MQ_EXPRESSION = /^\(\s*([_a-z-][_a-z0-9-]*)\s*(?::\s*([^)]+))?\s*\)$/;
const RE_MQ_FEATURE = /^(?:(min|max)-)?(.+)/;
const RE_LENGTH_UNIT = /(em|rem|px|cm|mm|in|pt|pc)?\s*$/;
const RE_RESOLUTION_UNIT = /(dpi|dpcm|dppx)?\s*$/;
const RE_EXPRESSION = /\([^)]+\)/g;

function matchQuery(mediaQuery, values) {
  return parseQuery(mediaQuery).some(function (query) {
    const inverse = query.inverse;

    // Either the parsed or specified `type` is "all", or the types must be
    // equal for a match.
    const typeMatch = query.type === 'all' || values.type === query.type;

    // Quit early when `type` doesn't match, but take "not" into account.
    if ((typeMatch && inverse) || !(typeMatch || inverse)) {
      return false;
    }

    const expressionsMatch = query.expressions.every(function (expression) {
      const feature = expression.feature;
      const modifier = expression.modifier;
      let expValue = expression.value;
      let value = values[feature];

      // Missing or falsy values don't match.
      if (!value && value !== 0) {
        return false;
      }

      // prefers-reduce-motion without a keyword value is equivalent to
      // prefers-reduced-motion: reduce.
      if (feature === 'prefers-reduced-motion' && !expValue) {
        expValue = 'reduce';
      }

      switch (feature) {
        case 'prefers-color-scheme':
        case 'prefers-reduced-motion':
        case 'orientation':
        case 'scan':
          return value.toLowerCase() === expValue.toLowerCase();

        case 'width':
        case 'height':
        case 'device-width':
        case 'device-height':
          expValue = toPx(expValue);
          value = toPx(value);
          break;

        case 'resolution':
          expValue = toDpi(expValue);
          value = toDpi(value);
          break;

        case 'aspect-ratio':
        case 'device-aspect-ratio':
          expValue = toDecimal(expValue);
          value = toDecimal(value);
          break;

        case 'grid':
        case 'color':
        case 'color-index':
        case 'monochrome':
          expValue = parseInt(expValue, 10) || 1;
          value = parseInt(value, 10) || 0;
          break;

        default:
          break;
      }

      switch (modifier) {
        case 'min':
          return value >= expValue;
        case 'max':
          return value <= expValue;
        default:
          return value === expValue;
      }
    });

    return (expressionsMatch && !inverse) || (!expressionsMatch && inverse);
  });
}

const memoizedValues = new Map();

function parseQuery(mediaQuery) {
  const memoizedValue = memoizedValues.get(mediaQuery);
  if (memoizedValue != null) {
    return memoizedValue;
  }

  const parsedQuery = mediaQuery.split(',').map(function (query) {
    query = query.trim();

    const captures = query.match(RE_MEDIA_QUERY);

    // Media Query must be valid.
    if (!captures) {
      throw new SyntaxError('Invalid CSS media query: "' + query + '"');
    }

    const modifier = captures[1];
    const type = captures[2];
    let expressions = ((captures[3] || '') + (captures[4] || '')).trim();
    const parsed = {};

    parsed.inverse = !!modifier && modifier.toLowerCase() === 'not';
    parsed.type = type ? type.toLowerCase() : 'all';

    // Check for media query expressions.
    if (!expressions) {
      parsed.expressions = [];
      return parsed;
    }

    // Split expressions into a list.
    expressions = expressions.match(RE_EXPRESSION);

    // Media Query must be valid.
    if (!expressions) {
      throw new SyntaxError('Invalid CSS media query: "' + query + '"');
    }

    parsed.expressions = expressions.map(function (expression) {
      const captures = expression.match(RE_MQ_EXPRESSION);

      // Media Query must be valid.
      if (!captures) {
        throw new SyntaxError('Invalid CSS media query: "' + query + '"');
      }

      const feature = captures[1].toLowerCase().match(RE_MQ_FEATURE);

      return {
        modifier: feature[1],
        feature: feature[2],
        value: captures[2]
      };
    });

    return parsed;
  });

  memoizedValues.set(mediaQuery, parsedQuery);
  return parsedQuery;
}

// -- Utilities ----------------------------------------------------------------

function toDecimal(ratio) {
  let decimal = Number(ratio),
    numbers;

  if (!decimal) {
    numbers = ratio.match(/^(\d+)\s*\/\s*(\d+)$/);
    decimal = numbers[1] / numbers[2];
  }

  return decimal;
}

function toDpi(resolution) {
  const value = parseFloat(resolution),
    units = String(resolution).match(RE_RESOLUTION_UNIT)[1];

  switch (units) {
    case 'dpcm':
      return value / 2.54;
    case 'dppx':
      return value * 96;
    default:
      return value;
  }
}

function toPx(length) {
  const value = parseFloat(length),
    units = String(length).match(RE_LENGTH_UNIT)[1];

  switch (units) {
    case 'em':
      return value * 16;
    case 'rem':
      return value * 16;
    case 'cm':
      return (value * 96) / 2.54;
    case 'mm':
      return (value * 96) / 2.54 / 10;
    case 'in':
      return value * 96;
    case 'pt':
      return value * 72;
    case 'pc':
      return (value * 72) / 12;
    default:
      return value;
  }
}

export const mediaQuery = { match: matchQuery, parse: parseQuery };
