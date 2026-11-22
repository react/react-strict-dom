/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { mergeRefs } from '../mergeRefs';

describe('mergeRefs', () => {
  test('handles null and undefined refs', () => {
    const mergedRef = mergeRefs(null, undefined);
    const element = document.createElement('div');

    // Should not throw
    expect(() => mergedRef(element)).not.toThrow();
  });

  test('calls function refs', () => {
    const ref1 = jest.fn();
    const ref2 = jest.fn();
    const mergedRef = mergeRefs(ref1, ref2);
    const element = document.createElement('div');

    mergedRef(element);

    expect(ref1).toHaveBeenCalledWith(element);
    expect(ref2).toHaveBeenCalledWith(element);
  });

  test('sets object refs current property', () => {
    const ref1 = { current: null };
    const ref2 = { current: null };
    const mergedRef = mergeRefs(ref1, ref2);
    const element = document.createElement('div');

    mergedRef(element);

    expect(ref1.current).toBe(element);
    expect(ref2.current).toBe(element);
  });

  test('handles mixed ref types', () => {
    const functionRef = jest.fn();
    const objectRef = { current: null };
    const mergedRef = mergeRefs(functionRef, null, objectRef, undefined);
    const element = document.createElement('div');

    mergedRef(element);

    expect(functionRef).toHaveBeenCalledWith(element);
    expect(objectRef.current).toBe(element);
  });

  test('logs error for invalid ref types', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mergedRef = mergeRefs('invalid-ref');
    const element = document.createElement('div');

    mergedRef(element);

    expect(consoleSpy).toHaveBeenCalledWith(
      'mergeRefs cannot handle refs of type boolean, number, or string. Received ref invalid-ref'
    );

    consoleSpy.mockRestore();
  });

  test('logs error for boolean ref types', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mergedRef = mergeRefs(true);
    const element = document.createElement('div');

    mergedRef(element);

    expect(consoleSpy).toHaveBeenCalledWith(
      'mergeRefs cannot handle refs of type boolean, number, or string. Received ref true'
    );

    consoleSpy.mockRestore();
  });

  test('logs error for number ref types', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mergedRef = mergeRefs(42);
    const element = document.createElement('div');

    mergedRef(element);

    expect(consoleSpy).toHaveBeenCalledWith(
      'mergeRefs cannot handle refs of type boolean, number, or string. Received ref 42'
    );

    consoleSpy.mockRestore();
  });
});
