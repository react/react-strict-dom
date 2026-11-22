/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { parseTimeValue } from '../parseTimeValue';

// https://github.com/web-platform-tests/wpt/blob/b435252575/css/css-transitions/transition-delay-001.html
const WPT_TRANSITION_DELAY_TEST_CASES = [
  /* # The 3-Clause BSD License
   *
   * Copyright © web-platform-tests contributors
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice,
   *    this list of conditions and the following disclaimer.
   * 2. Redistributions in binary form must reproduce the above copyright
   *    notice, this list of conditions and the following disclaimer in the
   *    documentation and/or other materials provided with the distribution.
   * 3. Neither the name of the copyright holder nor the names of its
   *    contributors may be used to endorse or promote products derived from
   *    this software without specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
   * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
   * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
   * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
   * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
   * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
   * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
   * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   * POSSIBILITY OF SUCH DAMAGE.
   */
  ['10.2s', 10200],
  ['1s', 1000],
  ['0.1s', 100],
  ['0.01s', 10],
  ['0.001s', 1],
  ['0.009s', 9],
  ['0s', 0],
  ['.0s', 0],
  ['.3s', 300],
  ['-5s', -5000],
  ['10200ms', 10200],
  ['1000ms', 1000],
  ['100ms', 100],
  ['10ms', 10],
  ['9ms', 9],
  ['1ms', 1],
  ['0ms', 0],
  ['-500ms', -500],
  ['foobar', 0],
  ['fooms', 0],
  ['foos', 0]
];

describe('parseTimeValue', () => {
  test('parses time values to milliseconds', () => {
    for (const [
      timeValue,
      expectedMilliseconds
    ] of WPT_TRANSITION_DELAY_TEST_CASES) {
      expect(parseTimeValue(timeValue)).toEqual(expectedMilliseconds);
    }
  });

  test('parses raw numeric strings as milliseconds', () => {
    expect(parseTimeValue('1.5s')).toBe(1500);
    expect(parseTimeValue('2s')).toBe(2000);
    expect(parseTimeValue('0.5s')).toBe(500);
    expect(parseTimeValue('0s')).toBe(0);
    expect(parseTimeValue('1234.5')).toBe(1234.5);
  });

  test('handles invalid numeric strings', () => {
    expect(parseTimeValue('abc')).toBe(0);
    expect(parseTimeValue('')).toBe(0);
    expect(parseTimeValue('123abc')).toBe(123);
  });
});
