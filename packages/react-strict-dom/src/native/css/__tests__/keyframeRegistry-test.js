/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { keyframeRegistry, parseKeyframeStops } from '../keyframeRegistry';

describe('keyframeRegistry', () => {
  beforeEach(() => {
    keyframeRegistry.clear();
  });

  afterEach(() => {
    keyframeRegistry.clear();
  });

  describe('register', () => {
    test('registers keyframes and returns unique ID', () => {
      const keyframes = {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      };

      const id = keyframeRegistry.register(keyframes);

      expect(typeof id).toBe('string');
      expect(id.startsWith('keyframe_')).toBe(true);
    });

    test('returns different IDs for different registrations', () => {
      const keyframes1 = { '0%': { opacity: 0 }, '100%': { opacity: 1 } };
      const keyframes2 = { from: { scale: 1 }, to: { scale: 2 } };

      const id1 = keyframeRegistry.register(keyframes1);
      const id2 = keyframeRegistry.register(keyframes2);

      expect(id1).not.toBe(id2);
    });

    test('handles empty keyframes object', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const id = keyframeRegistry.register({});

      expect(typeof id).toBe('string');
      expect(id.startsWith('keyframe_')).toBe(true);

      console.warn.mockRestore();
    });

    test('handles null keyframes', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const id = keyframeRegistry.register(null);

      expect(typeof id).toBe('string');
      expect(id.startsWith('keyframe_')).toBe(true);

      console.warn.mockRestore();
    });
  });

  describe('resolve', () => {
    test('returns null for unregistered keyframes', () => {
      const result = keyframeRegistry.resolve('nonexistent');
      expect(result).toBe(null);
    });

    test('returns registered keyframe definition', () => {
      const keyframes = {
        '0%': { opacity: 0 },
        '50%': { opacity: 0.5 },
        '100%': { opacity: 1 }
      };

      const id = keyframeRegistry.register(keyframes);
      const resolved = keyframeRegistry.resolve(id);

      expect(resolved).toBeTruthy();
      expect(resolved?.keyframes).toEqual(keyframes);
      expect(resolved?.id).toBe(id);
    });
  });

  describe('clear', () => {
    test('removes all registered keyframes', () => {
      const keyframes = { '0%': { opacity: 0 }, '100%': { opacity: 1 } };
      const id = keyframeRegistry.register(keyframes);

      expect(keyframeRegistry.resolve(id)).toBeTruthy();

      keyframeRegistry.clear();

      expect(keyframeRegistry.resolve(id)).toBe(null);
    });
  });

  describe('parseKeyframeStops', () => {
    test('parses valid percentage keyframes', () => {
      const keyframes = {
        '0%': { opacity: 0 },
        '50%': { opacity: 0.5 },
        '100%': { opacity: 1 }
      };

      const stops = parseKeyframeStops(keyframes);

      expect(stops).toEqual([
        { percentage: '0%', value: 0 },
        { percentage: '50%', value: 0.5 },
        { percentage: '100%', value: 1 }
      ]);
    });

    test('ignores invalid percentage strings', () => {
      const keyframes = {
        '0%': { opacity: 0 },
        invalid: { opacity: 0.5 },
        'another-invalid': { opacity: 0.7 },
        '100%': { opacity: 1 }
      };

      const stops = parseKeyframeStops(keyframes);

      expect(stops).toEqual([
        { percentage: '0%', value: 0 },
        { percentage: '100%', value: 1 }
      ]);
    });

    test('handles from and to keywords', () => {
      const keyframes = {
        from: { opacity: 0 },
        to: { opacity: 1 }
      };

      const stops = parseKeyframeStops(keyframes);

      expect(stops).toEqual([
        { percentage: 'from', value: 0 },
        { percentage: 'to', value: 1 }
      ]);
    });

    test('handles decimal percentage values', () => {
      const keyframes = {
        '0%': { opacity: 0 },
        '33.33%': { opacity: 0.33 },
        '66.67%': { opacity: 0.67 },
        '100%': { opacity: 1 }
      };

      const stops = parseKeyframeStops(keyframes);

      expect(stops).toHaveLength(4);
      expect(stops[0]).toEqual({ percentage: '0%', value: 0 });
      expect(stops[1]).toEqual({ percentage: '33.33%', value: 0.3333 });
      expect(stops[2].percentage).toBe('66.67%');
      expect(stops[2].value).toBeCloseTo(0.6667);
      expect(stops[3]).toEqual({ percentage: '100%', value: 1 });
    });

    test('clamps percentage values to 0-1 range and ignores invalid ones', () => {
      const keyframes = {
        '-10%': { opacity: 0 }, // Should be ignored (invalid format)
        '0%': { opacity: 0 },
        '120%': { opacity: 1 }, // Should be clamped to 1
        '100%': { opacity: 1 },
        'invalid%': { opacity: 0.5 } // Should be ignored
      };

      const stops = parseKeyframeStops(keyframes);

      // Should have 3 valid stops (0%, 100%, 120%)
      expect(stops).toHaveLength(3);
      expect(stops.find((s) => s.percentage === '0%')).toEqual({
        percentage: '0%',
        value: 0
      });
      expect(stops.find((s) => s.percentage === '100%')).toEqual({
        percentage: '100%',
        value: 1
      });
      expect(stops.find((s) => s.percentage === '120%')).toEqual({
        percentage: '120%',
        value: 1
      }); // clamped
    });

    test('handles percentage with no decimal part', () => {
      const keyframes = {
        '25%': { opacity: 0.25 },
        '75%': { opacity: 0.75 }
      };

      const stops = parseKeyframeStops(keyframes);

      expect(stops).toEqual([
        { percentage: '25%', value: 0.25 },
        { percentage: '75%', value: 0.75 }
      ]);
    });
  });
});
