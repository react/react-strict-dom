/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CSSCalcValue } from '../CSSCalcValue';

describe('CSSCalcValue parsing', () => {
  test('simple subtraction: calc(100px - 64px)', () => {
    const calc = CSSCalcValue.parse('calc(100px - 64px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toBe(36);
  });

  test('simple multiplication: calc(2 * 16px)', () => {
    const calc = CSSCalcValue.parse('calc(2 * 16px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toBe(32);
  });

  test('simple division: calc(100px / 2)', () => {
    const calc = CSSCalcValue.parse('calc(100px / 2)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toBe(50);
  });

  test('single value: calc(64px)', () => {
    const calc = CSSCalcValue.parse('calc(64px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toBe(64);
  });

  test('negative result: calc(0px - 64px)', () => {
    const calc = CSSCalcValue.parse('calc(0px - 64px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toBe(-64);
  });

  test('division by zero returns 0', () => {
    const calc = CSSCalcValue.parse('calc(100px / 0)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toBe(0);
  });

  test('addition: calc(10px + 20px)', () => {
    const calc = CSSCalcValue.parse('calc(10px + 20px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toBe(30);
  });
});

describe('CSSCalcValue with mixed units', () => {
  test('calc(100vh - 64px) with viewportHeight=812', () => {
    const calc = CSSCalcValue.parse('calc(100vh - 64px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'height'
    );
    expect(result).toBe(748);
  });

  test('calc(50vw + 50vw) with viewportWidth=375', () => {
    const calc = CSSCalcValue.parse('calc(50vw + 50vw)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toBe(375);
  });

  test('calc(1rem + 8px) with fontScale=1', () => {
    const calc = CSSCalcValue.parse('calc(1rem + 8px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    // 1rem = 16px (fontScale * 16 * 1), so 16 + 8 = 24
    expect(result).toBe(24);
  });

  test('calc(2em + 4px) with inheritedFontSize=16', () => {
    const calc = CSSCalcValue.parse('calc(2em + 4px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      {
        fontScale: 1,
        viewportHeight: 812,
        viewportWidth: 375,
        inheritedFontSize: 16
      },
      'width'
    );
    // 2em = 32px (inheritedFontSize * 2), so 32 + 4 = 36
    expect(result).toBe(36);
  });
});

describe('CSSCalcValue operator precedence', () => {
  test('calc(50px - 2 * 16px) should be 50 - 32 = 18', () => {
    const calc = CSSCalcValue.parse('calc(50px - 2 * 16px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toBe(18);
  });

  test('nested calc: calc(calc(100px - 64px) / 2) should be 18', () => {
    const calc = CSSCalcValue.parse('calc(calc(100px - 64px) / 2)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toBe(18);
  });

  test('nested parens: calc((100px - 64px) / 2) should be 18', () => {
    const calc = CSSCalcValue.parse('calc((100px - 64px) / 2)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toBe(18);
  });
});

describe('CSSCalcValue invalid inputs', () => {
  test('invalid calc expression returns null', () => {
    const calc = CSSCalcValue.parse('calc(red + blue)');
    expect(calc).toBeNull();
  });

  test('non-calc expression returns null', () => {
    const calc = CSSCalcValue.parse('100px');
    expect(calc).toBeNull();
  });
});

describe('CSSCalcValue memoization', () => {
  test('same calc expression returns consistent results', () => {
    const calc1 = CSSCalcValue.parse('calc(100px - 64px)');
    const calc2 = CSSCalcValue.parse('calc(100px - 64px)');
    expect(calc1).toBe(calc2);
    const opts = { viewportHeight: 812, viewportWidth: 375, fontScale: 1 };
    expect(calc1?.resolvePixelValue(opts, 'width')).toBe(36);
    expect(calc2?.resolvePixelValue(opts, 'width')).toBe(36);
  });
});

describe('CSSCalcValue with viewportScale', () => {
  test('calc(100px - 64px) with viewportScale=2', () => {
    const calc = CSSCalcValue.parse('calc(100px - 64px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      {
        fontScale: 1,
        viewportHeight: 812,
        viewportWidth: 375,
        viewportScale: 2
      },
      'width'
    );
    // 100*2 - 64*2 = 200 - 128 = 72
    expect(result).toBe(72);
  });
});

describe('CSSCalcValue with percentages', () => {
  test('calc(50% - 20px) produces __rsdCalc object', () => {
    const calc = CSSCalcValue.parse('calc(50% - 20px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toEqual({ __rsdCalc: true, percent: 50, offset: -20 });
  });

  test('calc(100% - 64px) produces correct percent and offset', () => {
    const calc = CSSCalcValue.parse('calc(100% - 64px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'height'
    );
    expect(result).toEqual({ __rsdCalc: true, percent: 100, offset: -64 });
  });

  test('calc(50% + 10px) produces positive offset', () => {
    const calc = CSSCalcValue.parse('calc(50% + 10px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toEqual({ __rsdCalc: true, percent: 50, offset: 10 });
  });

  test('calc(2 * 50%) produces doubled percentage', () => {
    const calc = CSSCalcValue.parse('calc(2 * 50%)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toEqual({ __rsdCalc: true, percent: 100, offset: 0 });
  });

  test('calc(50% - 2 * 16px) produces percent with evaluated offset', () => {
    const calc = CSSCalcValue.parse('calc(50% - 2 * 16px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    // 2 * 16px = 32px offset
    expect(result).toEqual({ __rsdCalc: true, percent: 50, offset: -32 });
  });

  test('calc(50% - 100vh) mixes percentage with viewport units', () => {
    const calc = CSSCalcValue.parse('calc(50% - 100vh)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'height'
    );
    // 100vh = 812px resolved at JS time
    expect(result).toEqual({ __rsdCalc: true, percent: 50, offset: -812 });
  });

  test('pure percentage calc(50%) still produces __rsdCalc', () => {
    const calc = CSSCalcValue.parse('calc(50%)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toEqual({ __rsdCalc: true, percent: 50, offset: 0 });
  });

  test('calc(50% / 2) divides percentage', () => {
    const calc = CSSCalcValue.parse('calc(50% / 2)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toEqual({ __rsdCalc: true, percent: 25, offset: 0 });
  });

  test('calc(50% - 10px - 10px - 10px) chains multiple subtractions', () => {
    const calc = CSSCalcValue.parse('calc(50% - 10px - 10px - 10px)');
    expect(calc).not.toBeNull();
    const result = calc?.resolvePixelValue(
      { fontScale: 1, viewportHeight: 812, viewportWidth: 375 },
      'width'
    );
    expect(result).toEqual({ __rsdCalc: true, percent: 50, offset: -30 });
  });
});
