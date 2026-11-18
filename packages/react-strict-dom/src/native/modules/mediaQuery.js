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
// Media Queries Level 4 range syntax, e.g. "(width >= 600px)",
// "(600px <= width)" or "(400px < width <= 800px)".
const RE_MQ_RANGE =
  /^\(\s*(?:([^<>=\s][^<>=]*?)\s*(<=?|>=?|=)\s*)?([_a-z-][_a-z0-9-]*)\s*(?:(<=?|>=?|=)\s*([^<>=\s][^<>=]*?))?\s*\)$/;
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
        case 'gt':
          return value > expValue;
        case 'lt':
          return value < expValue;
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

    parsed.expressions = [];
    expressions.forEach(function (expression) {
      const captures = expression.match(RE_MQ_EXPRESSION);

      if (captures) {
        const feature = captures[1].toLowerCase().match(RE_MQ_FEATURE);
        parsed.expressions.push({
          modifier: feature[1],
          feature: feature[2],
          value: captures[2]
        });
        return;
      }

      const rangeExpressions = parseRangeExpression(expression);

      // Media Query must be valid.
      if (!rangeExpressions) {
        throw new SyntaxError('Invalid CSS media query: "' + query + '"');
      }

      parsed.expressions.push(...rangeExpressions);
    });

    return parsed;
  });

  memoizedValues.set(mediaQuery, parsedQuery);
  return parsedQuery;
}

// Converts a range expression into the same { modifier, feature, value }
// shape used for "min-" / "max-" features. "<" and ">" use the "lt" and "gt"
// modifiers so that the comparison stays exclusive.
const RANGE_MODIFIERS = { '>=': 'min', '<=': 'max', '>': 'gt', '<': 'lt' };
const FLIPPED_OPERATORS = { '>=': '<=', '<=': '>=', '>': '<', '<': '>' };

function toRangeExpression(feature, operator, value) {
  return {
    modifier: operator === '=' ? undefined : RANGE_MODIFIERS[operator],
    feature,
    value
  };
}

function parseRangeExpression(expression) {
  const captures = expression.match(RE_MQ_RANGE);
  if (!captures) {
    return null;
  }

  const leftValue = captures[1];
  const leftOperator = captures[2];
  const feature = captures[3].toLowerCase();
  const rightOperator = captures[4];
  const rightValue = captures[5];

  // "min-" and "max-" prefixes cannot be combined with range operators.
  if (RE_MQ_FEATURE.exec(feature)[1] != null) {
    return null;
  }

  // "(value op feature)", e.g. "(600px <= width)"
  if (leftOperator != null && rightOperator == null) {
    return [
      toRangeExpression(
        feature,
        leftOperator === '=' ? '=' : FLIPPED_OPERATORS[leftOperator],
        leftValue
      )
    ];
  }

  // "(feature op value)", e.g. "(width >= 600px)"
  if (leftOperator == null && rightOperator != null) {
    return [toRangeExpression(feature, rightOperator, rightValue)];
  }

  // "(value op feature op value)", e.g. "(400px < width <= 800px)". Both
  // operators must point the same way.
  if (leftOperator != null && rightOperator != null) {
    const isLess = (op) => op === '<' || op === '<=';
    const isGreater = (op) => op === '>' || op === '>=';
    if (
      (isLess(leftOperator) && isLess(rightOperator)) ||
      (isGreater(leftOperator) && isGreater(rightOperator))
    ) {
      return [
        toRangeExpression(feature, FLIPPED_OPERATORS[leftOperator], leftValue),
        toRangeExpression(feature, rightOperator, rightValue)
      ];
    }
  }

  return null;
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
