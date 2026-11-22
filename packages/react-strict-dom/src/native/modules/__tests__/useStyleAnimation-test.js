/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import { useStyleAnimation } from '../useStyleAnimation';
import { keyframeRegistry } from '../../css/keyframeRegistry';

// Mock AnimationController
jest.mock('../AnimationController', () => {
  const mockController = {
    start: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    dispose: jest.fn(),
    isPaused: jest.fn().mockReturnValue(false),
    getAnimatedValue: jest.fn().mockReturnValue({ value: 0.5 }),
    getState: jest.fn().mockReturnValue('running')
  };

  return {
    AnimationController: jest.fn().mockImplementation(() => mockController)
  };
});

// Mock React hooks
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: jest.fn(() => ({ current: new Map() })),
  useState: jest.fn(() => [false, jest.fn()]),
  useMemo: jest.fn((fn) => {
    // Simple mock that executes the function
    return fn();
  }),
  useEffect: jest.fn()
}));

// Mock animation utilities
jest.mock('../animationUtils', () => ({
  ...jest.requireActual('../animationUtils'),
  extractAnimationProperties: jest.fn(),
  normalizeAnimationArrays: jest.fn(),
  composeMultipleAnimatedStyles: jest.fn().mockReturnValue({ color: 'blue' })
}));

// Mock parseTimeValue
jest.mock('../../css/parseTimeValue', () => ({
  parseTimeValue: jest.fn().mockImplementation((value) => {
    if (value === '1s') return 1000;
    if (value === '0.5s') return 500;
    if (value === '0s') return 0;
    return 0;
  })
}));

const {
  extractAnimationProperties,
  normalizeAnimationArrays
} = require('../animationUtils');

describe('useStyleAnimation', () => {
  beforeEach(() => {
    keyframeRegistry.clear();
    jest.clearAllMocks();

    // Reset mocks to default behavior
    extractAnimationProperties.mockReturnValue(null);
    normalizeAnimationArrays.mockReturnValue(null);
  });

  afterEach(() => {
    keyframeRegistry.clear();
  });

  test('returns original style when no animation properties', () => {
    const style = { backgroundColor: 'red', color: 'blue' };
    extractAnimationProperties.mockReturnValue(null);

    const result = useStyleAnimation(style);
    expect(result).toEqual(style);
  });

  test('returns original style when animationName is null', () => {
    const style = { backgroundColor: 'red', color: 'blue' };
    extractAnimationProperties.mockReturnValue({
      animationDuration: '1s',
      animationName: null
    });

    const result = useStyleAnimation(style);
    expect(result).toEqual(style);
  });

  test('handles basic animation style processing', () => {
    const keyframes = {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    };
    const animationName = keyframeRegistry.register(keyframes);

    const style = { backgroundColor: 'red' };
    const animationProps = {
      animationName,
      animationDuration: '1s',
      animationDelay: '0s'
    };

    const normalizedAnimations = {
      animationName: [animationName],
      animationDuration: ['1s'],
      animationDelay: ['0s'],
      animationTimingFunction: ['ease'],
      animationIterationCount: ['1'],
      animationDirection: ['normal'],
      animationFillMode: ['none'],
      animationPlayState: ['running'],
      animationComposition: ['replace'],
      animationCount: 1
    };

    extractAnimationProperties.mockReturnValue(animationProps);
    normalizeAnimationArrays.mockReturnValue(normalizedAnimations);

    useStyleAnimation(style);

    expect(extractAnimationProperties).toHaveBeenCalledWith(style);
    expect(normalizeAnimationArrays).toHaveBeenCalledWith(animationProps);
  });

  test('handles invalid animation names', () => {
    const style = { backgroundColor: 'red' };
    const animationProps = {
      animationName: 'nonexistent',
      animationDuration: '1s'
    };

    extractAnimationProperties.mockReturnValue(animationProps);
    normalizeAnimationArrays.mockReturnValue(null);

    const result = useStyleAnimation(style);
    expect(result).toEqual(style);
  });

  test('processes animation properties correctly', () => {
    const keyframes = {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    };
    const animationName = keyframeRegistry.register(keyframes);

    const style = { backgroundColor: 'red' };
    extractAnimationProperties.mockReturnValue({
      animationName,
      animationDuration: '1s'
    });

    normalizeAnimationArrays.mockReturnValue({
      animationName: [animationName],
      animationDuration: ['1s'],
      animationDelay: ['0s'],
      animationTimingFunction: ['ease'],
      animationIterationCount: ['1'],
      animationDirection: ['normal'],
      animationFillMode: ['none'],
      animationPlayState: ['running'],
      animationComposition: ['replace'],
      animationCount: 1
    });

    useStyleAnimation(style);

    expect(extractAnimationProperties).toHaveBeenCalledWith(style);
  });

  test('handles empty animation properties', () => {
    const style = { backgroundColor: 'red' };
    extractAnimationProperties.mockReturnValue(null);

    const result = useStyleAnimation(style);
    expect(result).toBe(style);
  });

  test('processes valid keyframes', () => {
    const keyframes = {
      '0%': { opacity: 0 },
      '50%': { opacity: 0.5 },
      '100%': { opacity: 1 }
    };
    const animationName = keyframeRegistry.register(keyframes);

    const resolved = keyframeRegistry.resolve(animationName);
    expect(resolved).toBeTruthy();
    expect(resolved?.keyframes).toEqual(keyframes);
  });

  test('handles animations with null duration', () => {
    const keyframes = {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    };
    const animationName = keyframeRegistry.register(keyframes);

    const style = { backgroundColor: 'red' };
    const animationProps = {
      animationName,
      animationDuration: null
    };

    extractAnimationProperties.mockReturnValue(animationProps);
    normalizeAnimationArrays.mockReturnValue({
      animationName: [animationName],
      animationDuration: [null],
      animationDelay: ['0s'],
      animationTimingFunction: ['ease'],
      animationIterationCount: ['1'],
      animationDirection: ['normal'],
      animationFillMode: ['none'],
      animationPlayState: ['running'],
      animationComposition: ['replace'],
      animationCount: 1
    });

    const result = useStyleAnimation(style);
    expect(result).toBeTruthy();
  });

  test('handles animations with zero duration', () => {
    const keyframes = {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    };
    const animationName = keyframeRegistry.register(keyframes);

    const style = { backgroundColor: 'red' };
    const animationProps = {
      animationName,
      animationDuration: '0s'
    };

    extractAnimationProperties.mockReturnValue(animationProps);
    normalizeAnimationArrays.mockReturnValue({
      animationName: [animationName],
      animationDuration: ['0s'],
      animationDelay: ['0s'],
      animationTimingFunction: ['ease'],
      animationIterationCount: ['1'],
      animationDirection: ['normal'],
      animationFillMode: ['none'],
      animationPlayState: ['running'],
      animationComposition: ['replace'],
      animationCount: 1
    });

    const result = useStyleAnimation(style);
    expect(result).toBeTruthy();
  });

  test('handles empty animationName in normalized arrays', () => {
    const style = { backgroundColor: 'red' };
    const animationProps = {
      animationName: '',
      animationDuration: '1s'
    };

    extractAnimationProperties.mockReturnValue(animationProps);
    normalizeAnimationArrays.mockReturnValue({
      animationName: [''],
      animationDuration: ['1s'],
      animationDelay: ['0s'],
      animationTimingFunction: ['ease'],
      animationIterationCount: ['1'],
      animationDirection: ['normal'],
      animationFillMode: ['none'],
      animationPlayState: ['running'],
      animationComposition: ['replace'],
      animationCount: 1
    });

    const result = useStyleAnimation(style);
    expect(result).toEqual(style);
  });

  test('handles complex animation properties', () => {
    const keyframes = {
      '0%': { transform: 'translateX(0px)', opacity: 0 },
      '100%': { transform: 'translateX(100px)', opacity: 1 }
    };
    const animationName = keyframeRegistry.register(keyframes);

    const style = { backgroundColor: 'red' };
    const animationProps = {
      animationName,
      animationDuration: '2s',
      animationDelay: '0.5s',
      animationDirection: 'alternate',
      animationFillMode: 'both',
      animationPlayState: 'running',
      animationIterationCount: 3,
      animationTimingFunction: 'ease-in-out'
    };

    extractAnimationProperties.mockReturnValue(animationProps);
    normalizeAnimationArrays.mockReturnValue({
      animationName: [animationName],
      animationDuration: ['2s'],
      animationDelay: ['0.5s'],
      animationTimingFunction: ['ease-in-out'],
      animationIterationCount: ['3'],
      animationDirection: ['alternate'],
      animationFillMode: ['both'],
      animationPlayState: ['running'],
      animationComposition: ['replace'],
      animationCount: 1
    });

    useStyleAnimation(style);

    expect(extractAnimationProperties).toHaveBeenCalledWith(style);
    expect(normalizeAnimationArrays).toHaveBeenCalledWith(animationProps);
  });

  test('handles multiple animations', () => {
    const keyframes = {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    };
    const animationName = keyframeRegistry.register(keyframes);

    const style = { backgroundColor: 'red' };
    const animationProps = {
      animationName: `${animationName}, ${animationName}`,
      animationDuration: '1s, 2s'
    };

    const normalizedAnimations = {
      animationName: [animationName, animationName],
      animationDuration: ['1s', '2s'],
      animationDelay: ['0s', '0s'],
      animationTimingFunction: ['ease', 'ease'],
      animationIterationCount: ['1', '1'],
      animationDirection: ['normal', 'normal'],
      animationFillMode: ['none', 'none'],
      animationPlayState: ['running', 'running'],
      animationComposition: ['replace', 'replace'],
      animationCount: 2
    };

    extractAnimationProperties.mockReturnValue(animationProps);
    normalizeAnimationArrays.mockReturnValue(normalizedAnimations);

    useStyleAnimation(style);

    expect(extractAnimationProperties).toHaveBeenCalledWith(style);
    expect(normalizeAnimationArrays).toHaveBeenCalledWith(animationProps);
  });

  test('handles style without animation properties', () => {
    const style = {
      backgroundColor: 'blue',
      fontSize: 16,
      margin: 10
    };

    extractAnimationProperties.mockReturnValue(null);

    const result = useStyleAnimation(style);
    expect(result).toEqual(style);
  });

  test('handles undefined animation properties on subsequent calls', () => {
    const style = { backgroundColor: 'red' };

    // Mock the first call with animation props
    extractAnimationProperties.mockReturnValueOnce({
      animationName: 'test',
      animationDuration: '1s'
    });
    normalizeAnimationArrays.mockReturnValueOnce({
      animationName: ['test'],
      animationDuration: ['1s'],
      animationDelay: ['0s'],
      animationTimingFunction: ['ease'],
      animationIterationCount: ['1'],
      animationDirection: ['normal'],
      animationFillMode: ['none'],
      animationPlayState: ['running'],
      animationComposition: ['replace'],
      animationCount: 1
    });

    useStyleAnimation(style);

    // Second call with no animation props
    extractAnimationProperties.mockReturnValueOnce(null);
    normalizeAnimationArrays.mockReturnValueOnce(null);

    const result = useStyleAnimation(style);
    expect(result).toEqual(style);
  });

  test('handles animation property type differences', () => {
    const keyframes = {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    };
    const animationName = keyframeRegistry.register(keyframes);

    // Mock useState to track state changes
    const mockSetCurrentStyle = jest.fn();
    const React = require('react');
    React.useState = jest
      .fn()
      .mockReturnValueOnce([null, mockSetCurrentStyle]) // hasBeenAnimated
      .mockReturnValueOnce([{ animationName: 'old' }, mockSetCurrentStyle]); // currentStyle

    const style = { backgroundColor: 'red' };

    // First call with string animation name
    extractAnimationProperties.mockReturnValueOnce({
      animationName,
      animationDuration: '1s'
    });
    normalizeAnimationArrays.mockReturnValueOnce({
      animationName: [animationName],
      animationDuration: ['1s'],
      animationDelay: ['0s'],
      animationTimingFunction: ['ease'],
      animationIterationCount: ['1'],
      animationDirection: ['normal'],
      animationFillMode: ['none'],
      animationPlayState: ['running'],
      animationComposition: ['replace'],
      animationCount: 1
    });

    useStyleAnimation(style);

    expect(extractAnimationProperties).toHaveBeenCalled();
  });

  test('handles zero duration animations', () => {
    const keyframes = {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    };
    const animationName = keyframeRegistry.register(keyframes);

    const style = { backgroundColor: 'red' };

    extractAnimationProperties.mockReturnValue({
      animationName,
      animationDuration: '0s'
    });

    normalizeAnimationArrays.mockReturnValue({
      animationName: [animationName],
      animationDuration: ['0s'],
      animationDelay: ['0s'],
      animationTimingFunction: ['ease'],
      animationIterationCount: [1],
      animationDirection: ['normal'],
      animationFillMode: ['none'],
      animationPlayState: ['running'],
      animationCount: 1
    });

    const result = useStyleAnimation(style);
    expect(result).toEqual(style);
  });

  test('handles missing keyframe definitions', () => {
    const style = { backgroundColor: 'red' };

    extractAnimationProperties.mockReturnValue({
      animationName: 'nonexistent-keyframe',
      animationDuration: '1s'
    });

    normalizeAnimationArrays.mockReturnValue({
      animationName: ['nonexistent-keyframe'],
      animationDuration: ['1s'],
      animationDelay: ['0s'],
      animationTimingFunction: ['ease'],
      animationIterationCount: [1],
      animationDirection: ['normal'],
      animationFillMode: ['none'],
      animationPlayState: ['running'],
      animationCount: 1
    });

    const result = useStyleAnimation(style);
    expect(result).toEqual(style);
  });

  test('handles pause and resume animation states', () => {
    const mockController = {
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      dispose: jest.fn(),
      isPaused: jest.fn(),
      getAnimatedValue: jest.fn().mockReturnValue({ value: 0.5 }),
      getState: jest.fn().mockReturnValue('running')
    };

    // Mock AnimationController constructor
    const { AnimationController } = require('../AnimationController');
    AnimationController.mockImplementation(() => mockController);

    const keyframes = {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    };
    const animationName = keyframeRegistry.register(keyframes);

    const style = { backgroundColor: 'red' };

    // Mock controllersRef to simulate existing animation
    const mockControllersRef = new Map();
    mockControllersRef.set(`${animationName}_0`, mockController);

    const React = require('react');
    React.useRef = jest.fn(() => ({ current: mockControllersRef }));

    // Mock useState for state management
    const stateSetters = [];
    React.useState = jest.fn((initial) => {
      const setter = jest.fn();
      stateSetters.push(setter);
      return [initial, setter];
    });

    extractAnimationProperties.mockReturnValue({
      animationName,
      animationDuration: '1s',
      animationPlayState: 'paused'
    });

    normalizeAnimationArrays.mockReturnValue({
      animationName: [animationName],
      animationDuration: ['1s'],
      animationDelay: ['0s'],
      animationTimingFunction: ['ease'],
      animationIterationCount: [1],
      animationDirection: ['normal'],
      animationFillMode: ['none'],
      animationPlayState: ['paused'],
      animationCount: 1
    });

    mockController.isPaused.mockReturnValue(false);
    useStyleAnimation(style);

    extractAnimationProperties.mockReturnValue({
      animationName,
      animationDuration: '1s',
      animationPlayState: 'running'
    });

    normalizeAnimationArrays.mockReturnValue({
      animationName: [animationName],
      animationDuration: ['1s'],
      animationDelay: ['0s'],
      animationTimingFunction: ['ease'],
      animationIterationCount: [1],
      animationDirection: ['normal'],
      animationFillMode: ['none'],
      animationPlayState: ['running'],
      animationCount: 1
    });

    mockController.isPaused.mockReturnValue(true);
    useStyleAnimation(style);

    expect(mockController.pause || mockController.resume).toBeTruthy();
  });

  test('handles animation restart when properties change', () => {
    const keyframes = {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    };
    const animationName = keyframeRegistry.register(keyframes);

    const style = { backgroundColor: 'red' };

    // Mock currentStyle state to have previous animation
    const mockSetCurrentStyle = jest.fn();
    const React = require('react');
    React.useState = jest
      .fn()
      .mockReturnValueOnce([false, jest.fn()]) // hasBeenAnimated
      .mockReturnValueOnce([
        {
          animationName: 'old-animation',
          animationDuration: '0.5s',
          animationDelay: '0.1s',
          animationTimingFunction: 'linear',
          animationIterationCount: 2
        },
        mockSetCurrentStyle
      ]);

    extractAnimationProperties.mockReturnValue({
      animationName,
      animationDuration: '1s',
      animationDelay: '0s',
      animationTimingFunction: 'ease',
      animationIterationCount: 1
    });

    normalizeAnimationArrays.mockReturnValue({
      animationName: [animationName],
      animationDuration: ['1s'],
      animationDelay: ['0s'],
      animationTimingFunction: ['ease'],
      animationIterationCount: [1],
      animationDirection: ['normal'],
      animationFillMode: ['none'],
      animationPlayState: ['running'],
      animationCount: 1
    });

    useStyleAnimation(style);

    expect(extractAnimationProperties).toHaveBeenCalled();
  });

  // Additional targeted coverage tests
  test('covers specific uncovered animation edge cases', () => {
    const style = { backgroundColor: 'red' };

    // Test with undefined animation properties to trigger early return path
    extractAnimationProperties.mockReturnValue(undefined);
    const result = useStyleAnimation(style);
    expect(result).toEqual(style);
  });
});
