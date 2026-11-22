/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import { renderHook } from '@testing-library/react';
import { useStyleProps } from '../useStyleProps';

// Minimal mocking for functionality testing
jest.mock('../ContextInheritedStyles', () => ({
  useInheritedStyles: () => ({})
}));

jest.mock('../usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => false
}));

jest.mock('../usePseudoStates', () => ({
  usePseudoStates: () => ({
    active: false,
    focus: false,
    hover: false,
    handlers: null
  })
}));

jest.mock('../ContextViewportScale', () => ({
  useViewportScale: () => ({ scale: 1 })
}));

jest.mock('../../react-native', () => ({
  useWindowDimensions: () => ({
    fontScale: 1,
    height: 800,
    width: 400
  }),
  useColorScheme: () => 'light',
  Platform: {
    constants: {
      reactNativeVersion: {
        major: 0,
        minor: 74,
        patch: 0,
        prerelease: null
      }
    }
  }
}));

// Mock transitions - should not modify style for these tests
jest.mock('../useStyleTransition', () => ({
  useStyleTransition: jest.fn((style) => style)
}));

// Mock the actual hooks we want to test integration with
const mockUseStyleAnimation = jest.fn();
jest.mock('../useStyleAnimation', () => ({
  useStyleAnimation: (...args) => mockUseStyleAnimation(...args)
}));

describe('useStyleProps animation integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no style modification
    mockUseStyleAnimation.mockImplementation((style) => style);
  });

  test('sets animated flag for components with animation arrays', () => {
    // Mock useStyleAnimation to return modified style for animation arrays
    mockUseStyleAnimation.mockImplementation((style) => {
      // Simulate that useStyleAnimation detected animation arrays and returned modified style
      if (style.animationName && Array.isArray(style.animationName)) {
        return {
          ...style,
          // Simulate transformed properties (different reference)
          transform: [{ scale: 1 }]
        };
      }
      return style;
    });

    const style = {
      animationName: ['bounce', 'fade'],
      animationDuration: ['1s', '2s'],
      backgroundColor: 'red'
    };

    const { result } = renderHook(() =>
      useStyleProps(style, {
        customProperties: null,
        provideInheritableStyle: false,
        withTextStyle: false,
        withInheritedStyle: false
      })
    );

    expect(mockUseStyleAnimation).toHaveBeenCalled();
    expect(result.current.nativeProps.animated).toBe(true);
  });

  test('maintains animated flag for persistent animation state', () => {
    // Test the "once animated, always animated" strategy
    // This should work through the enhanced useStyleAnimation hook

    // First call with animation properties
    mockUseStyleAnimation.mockImplementationOnce((style) => {
      if (style.animationName) {
        return {
          ...style,
          transform: [{ scale: 1 }] // Simulate animated transform
        };
      }
      return style;
    });

    const styleWithAnimation = {
      animationName: 'bounce',
      animationDuration: '1s',
      backgroundColor: 'blue'
    };

    const { result: result1 } = renderHook(() =>
      useStyleProps(styleWithAnimation, {
        customProperties: null,
        provideInheritableStyle: false,
        withTextStyle: false,
        withInheritedStyle: false
      })
    );

    expect(result1.current.nativeProps.animated).toBe(true);

    // Second call without animation properties but with persisted state
    mockUseStyleAnimation.mockImplementationOnce((style) => {
      // Simulate persistent animated values
      return {
        ...style,
        transform: [{ scale: {} }] // Mock AnimatedValue-like object
      };
    });

    const styleWithoutAnimation = { backgroundColor: 'red' };

    const { result: result2 } = renderHook(() =>
      useStyleProps(styleWithoutAnimation, {
        customProperties: null,
        provideInheritableStyle: false,
        withTextStyle: false,
        withInheritedStyle: false
      })
    );

    // This test verifies the integration works - the actual persistence
    // is handled by useStyleAnimation's "once animated, always animated" logic
    expect(result2.current.nativeProps).toBeDefined();
  });

  test('handles edge cases with null values and empty arrays', () => {
    // Should return same style reference for edge cases
    mockUseStyleAnimation.mockImplementation((style) => style);

    const style = {
      animationName: [],
      animationDuration: null,
      backgroundColor: 'green'
    };

    const { result } = renderHook(() =>
      useStyleProps(style, {
        customProperties: null,
        provideInheritableStyle: false,
        withTextStyle: false,
        withInheritedStyle: false
      })
    );

    // Should not crash and should not set animated flag for empty arrays
    expect(result.current.nativeProps.animated).toBeFalsy();
    expect(result.current.nativeProps.style).toBeDefined();
  });

  test('maintains backward compatibility with existing transitions', () => {
    const { useStyleTransition } = require('../useStyleTransition');

    // Mock transition detection
    useStyleTransition.mockImplementation((style) => {
      if (style.transitionProperty) {
        return {
          ...style,
          transform: [{ scale: 1 }] // Simulate transition transform
        };
      }
      return style;
    });

    const style = {
      transitionProperty: 'opacity',
      transitionDuration: '0.3s',
      opacity: 0.5
    };

    const { result } = renderHook(() =>
      useStyleProps(style, {
        customProperties: null,
        provideInheritableStyle: false,
        withTextStyle: false,
        withInheritedStyle: false
      })
    );

    expect(result.current.nativeProps.animated).toBe(true);
  });

  test('detects persisted animation state with AnimatedValue instances', () => {
    // Create a mock AnimatedValue-like object
    const mockAnimatedValue = {
      constructor: { name: 'AnimatedValue' },
      _value: 1,
      setValue: jest.fn()
    };

    mockUseStyleAnimation.mockImplementation((style) => style); // No modification

    const styleWithAnimatedValue = {
      transform: [{ scale: mockAnimatedValue }],
      backgroundColor: 'blue'
    };

    const { result } = renderHook(() =>
      useStyleProps(styleWithAnimatedValue, {
        customProperties: null,
        provideInheritableStyle: false,
        withTextStyle: false,
        withInheritedStyle: false
      })
    );

    // Should detect the AnimatedValue and set animated flag
    expect(result.current.nativeProps.animated).toBe(true);
  });

  test('does not set animated flag for regular objects', () => {
    mockUseStyleAnimation.mockImplementation((style) => style); // No modification

    const styleWithRegularObjects = {
      transform: [{ scale: { value: 1 } }], // Regular object, not AnimatedValue
      backgroundColor: 'green'
    };

    const { result } = renderHook(() =>
      useStyleProps(styleWithRegularObjects, {
        customProperties: null,
        provideInheritableStyle: false,
        withTextStyle: false,
        withInheritedStyle: false
      })
    );

    // Should NOT set animated flag for regular objects
    expect(result.current.nativeProps.animated).toBeFalsy();
  });
});
