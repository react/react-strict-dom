/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { CSSLengthUnitValue } from './CSSLengthUnitValue';

import valueParser from 'postcss-value-parser';

type CalcLeafToken =
  | { type: 'literal', value: number }
  | { type: 'length', value: CSSLengthUnitValue }
  | { type: 'percentage', value: number };

type CalcOpToken = { type: 'op', value: '+' | '-' | '*' | '/' };

type CalcGroupToken = { type: 'group', tokens: Array<CalcToken> };

type CalcToken = CalcLeafToken | CalcOpToken | CalcGroupToken;

type CalcASTNode =
  | CalcLeafToken
  | {
      type: 'binary',
      op: '+' | '-' | '*' | '/',
      left: CalcASTNode,
      right: CalcASTNode
    };

type DualValue = { percent: number, offset: number };

type ResolvePixelValueOptions = $ReadOnly<{
  fontScale?: number | void,
  inheritedFontSize?: ?number,
  viewportHeight?: number,
  viewportScale?: number,
  viewportWidth?: number
}>;

export type CalcResult =
  | number
  | { __rsdCalc: true, percent: number, offset: number };

const memoizedCalcValues = new Map<string, CSSCalcValue | null>();

export class CSSCalcValue {
  ast: CalcASTNode;

  static parse(input: string): CSSCalcValue | null {
    const memoizedValue = memoizedCalcValues.get(input);
    if (memoizedValue !== undefined) {
      return memoizedValue;
    }
    try {
      const parsed = valueParser(input);
      const calcNode = parsed.nodes.find(
        (n) => n.type === 'function' && n.value === 'calc'
      );
      if (calcNode == null || !Array.isArray(calcNode.nodes)) {
        memoizedCalcValues.set(input, null);
        return null;
      }
      const tokens = CSSCalcValue._tokenize(calcNode.nodes);
      if (tokens.length === 0) {
        memoizedCalcValues.set(input, null);
        return null;
      }
      const ast = CSSCalcValue._parseExpression(tokens, { pos: 0 });
      if (ast == null) {
        memoizedCalcValues.set(input, null);
        return null;
      }
      const instance = new CSSCalcValue(ast);
      memoizedCalcValues.set(input, instance);
      return instance;
    } catch {
      memoizedCalcValues.set(input, null);
      return null;
    }
  }

  static _tokenize(nodes: $ReadOnlyArray<{ ... }>): Array<CalcToken> {
    const tokens: Array<CalcToken> = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.type === 'space') {
        continue;
      }
      if (node.type === 'function') {
        // Nested calc() or grouping parens (empty value)
        if (
          (node.value === 'calc' || node.value === '') &&
          Array.isArray(node.nodes)
        ) {
          const innerTokens = CSSCalcValue._tokenize(node.nodes);
          tokens.push({ type: 'group', tokens: innerTokens });
        } else {
          return []; // unsupported function
        }
        continue;
      }
      if (node.type === 'word') {
        const val: string = node.value;
        // Pure operator
        if (val === '*' || val === '/') {
          tokens.push({ type: 'op', value: val });
          continue;
        }
        if (val === '+' || val === '-') {
          tokens.push({ type: 'op', value: val });
          continue;
        }
        // Check if value starts with +/- and previous token was an operand
        // This handles cases like "100vh" followed by "-64px" (space-separated)
        if (
          (val.startsWith('+') || val.startsWith('-')) &&
          val.length > 1 &&
          tokens.length > 0
        ) {
          const lastToken = tokens[tokens.length - 1];
          if (lastToken.type !== 'op') {
            // Split into operator + value
            tokens.push({ type: 'op', value: (val[0]: $FlowFixMe) });
            const rest = val.slice(1);
            const leaf = CSSCalcValue._parseLeaf(rest);
            if (leaf == null) {
              return [];
            }
            tokens.push(leaf);
            continue;
          }
        }
        // Parse as leaf value
        const leaf = CSSCalcValue._parseLeaf(val);
        if (leaf == null) {
          return [];
        }
        tokens.push(leaf);
        continue;
      }
    }
    return tokens;
  }

  static _parseLeaf(val: string): CalcLeafToken | null {
    // Percentage
    if (val.endsWith('%')) {
      const num = parseFloat(val.slice(0, -1));
      if (isNaN(num)) {
        return null;
      }
      return { type: 'percentage', value: num };
    }
    // Try CSSLengthUnitValue
    const lengthVal = CSSLengthUnitValue.parse(val);
    if (lengthVal != null) {
      return { type: 'length', value: lengthVal };
    }
    // Unitless number
    const num = parseFloat(val);
    if (!isNaN(num) && String(num) === val) {
      return { type: 'literal', value: num };
    }
    // Could be integer like "2" parsed differently
    const numAlt = Number(val);
    if (!isNaN(numAlt) && isFinite(numAlt)) {
      return { type: 'literal', value: numAlt };
    }
    return null;
  }

  // Recursive descent parser: expression = term (('+' | '-') term)*
  static _parseExpression(
    tokens: $ReadOnlyArray<CalcToken>,
    state: { pos: number }
  ): CalcASTNode | null {
    let left = CSSCalcValue._parseTerm(tokens, state);
    if (left == null) {
      return null;
    }
    while (state.pos < tokens.length) {
      const token = tokens[state.pos];
      if (
        token.type === 'op' &&
        (token.value === '+' || token.value === '-')
      ) {
        state.pos++;
        const right = CSSCalcValue._parseTerm(tokens, state);
        if (right == null) {
          return null;
        }
        left = { type: 'binary', op: token.value, left, right };
      } else {
        break;
      }
    }
    return left;
  }

  // term = primary (('*' | '/') primary)*
  static _parseTerm(
    tokens: $ReadOnlyArray<CalcToken>,
    state: { pos: number }
  ): CalcASTNode | null {
    let left = CSSCalcValue._parsePrimary(tokens, state);
    if (left == null) {
      return null;
    }
    while (state.pos < tokens.length) {
      const token = tokens[state.pos];
      if (
        token.type === 'op' &&
        (token.value === '*' || token.value === '/')
      ) {
        state.pos++;
        const right = CSSCalcValue._parsePrimary(tokens, state);
        if (right == null) {
          return null;
        }
        left = { type: 'binary', op: token.value, left, right };
      } else {
        break;
      }
    }
    return left;
  }

  // primary = group | leaf
  static _parsePrimary(
    tokens: $ReadOnlyArray<CalcToken>,
    state: { pos: number }
  ): CalcASTNode | null {
    if (state.pos >= tokens.length) {
      return null;
    }
    const token = tokens[state.pos];
    if (token.type === 'group') {
      state.pos++;
      const innerState = { pos: 0 };
      const result = CSSCalcValue._parseExpression(token.tokens, innerState);
      return result;
    }
    if (
      token.type === 'literal' ||
      token.type === 'length' ||
      token.type === 'percentage'
    ) {
      state.pos++;
      return token;
    }
    return null;
  }

  constructor(ast: CalcASTNode) {
    this.ast = ast;
  }

  resolvePixelValue(
    options: ResolvePixelValueOptions,
    propertyName: string
  ): CalcResult {
    const result = CSSCalcValue._evaluateDual(this.ast, options, propertyName);
    if (result.percent === 0) {
      return result.offset;
    }
    // Has percentage component: return structured object for native
    // post-layout resolution (percent resolved by Yoga, offset applied after)
    return { __rsdCalc: true, percent: result.percent, offset: result.offset };
  }

  // Evaluates to {percent, offset} pair. Percentage stays symbolic;
  // non-percentage parts (px, vh, rem, etc.) resolve to offset.
  static _evaluateDual(
    node: CalcASTNode,
    options: ResolvePixelValueOptions,
    propertyName: string
  ): DualValue {
    if (node.type === 'literal') {
      return { percent: 0, offset: node.value };
    }
    if (node.type === 'length') {
      return {
        percent: 0,
        offset: node.value.resolvePixelValue((options: $FlowFixMe))
      };
    }
    if (node.type === 'percentage') {
      return { percent: node.value, offset: 0 };
    }
    if (node.type === 'binary') {
      const left = CSSCalcValue._evaluateDual(
        node.left,
        options,
        propertyName
      );
      const right = CSSCalcValue._evaluateDual(
        node.right,
        options,
        propertyName
      );
      switch (node.op) {
        case '+':
          return {
            percent: left.percent + right.percent,
            offset: left.offset + right.offset
          };
        case '-':
          return {
            percent: left.percent - right.percent,
            offset: left.offset - right.offset
          };
        case '*':
          // Multiplication: one side must be unitless (no percentage)
          if (left.percent === 0 && right.percent === 0) {
            return { percent: 0, offset: left.offset * right.offset };
          }
          if (left.percent === 0) {
            return {
              percent: right.percent * left.offset,
              offset: right.offset * left.offset
            };
          }
          if (right.percent === 0) {
            return {
              percent: left.percent * right.offset,
              offset: left.offset * right.offset
            };
          }
          // percent * percent is invalid CSS
          return { percent: 0, offset: 0 };
        case '/':
          // Divisor must be unitless
          if (right.percent !== 0 || right.offset === 0) {
            return { percent: 0, offset: 0 };
          }
          return {
            percent: left.percent / right.offset,
            offset: left.offset / right.offset
          };
        default:
          return { percent: 0, offset: 0 };
      }
    }
    return { percent: 0, offset: 0 };
  }
}
