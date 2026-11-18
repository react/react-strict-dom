/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import { mediaQuery } from '../mediaQuery';

describe('mediaQuery.parse()', function () {
  test('should parse media queries without expressions', function () {
    expect(mediaQuery.parse('screen')).toEqual([
      {
        inverse: false,
        type: 'screen',
        expressions: []
      }
    ]);

    expect(mediaQuery.parse('not screen')).toEqual([
      {
        inverse: true,
        type: 'screen',
        expressions: []
      }
    ]);
  });

  test('should parse common retina media query list', function () {
    const parsed = mediaQuery.parse(
      'only screen and (-webkit-min-device-pixel-ratio: 2),\n' +
        'only screen and (min--moz-device-pixel-ratio: 2),\n' +
        'only screen and (-o-min-device-pixel-ratio: 2/1),\n' +
        'only screen and (min-device-pixel-ratio: 2),\n' +
        'only screen and (min-resolution: 192dpi),\n' +
        'only screen and (min-resolution: 2dppx)'
    );

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(6);
    expect(parsed[0].expressions[0].feature).toEqual(
      '-webkit-min-device-pixel-ratio'
    );
    expect(parsed[1].expressions[0].modifier).toEqual('min');
  });

  test('should throw a SyntaxError when a media query is invalid', function () {
    function parse(query) {
      return function () {
        mediaQuery.parse(query);
      };
    }

    expect(parse('some crap')).toThrow(SyntaxError);
    expect(parse('48em')).toThrow(SyntaxError);
    expect(parse('screen and crap')).toThrow(SyntaxError);
    expect(parse('screen and (48em)')).toThrow(SyntaxError);
    expect(parse('screen and (foo:)')).toThrow(SyntaxError);
    expect(parse('()')).toThrow(SyntaxError);
    expect(parse('(foo) (bar)')).toThrow(SyntaxError);
    expect(parse('(foo:) and (bar)')).toThrow(SyntaxError);
  });
  test('should parse range syntax', function () {
    expect(mediaQuery.parse('(width >= 600px)')[0].expressions).toEqual([
      { modifier: 'min', feature: 'width', value: '600px' }
    ]);
    expect(mediaQuery.parse('(600px < width)')[0].expressions).toEqual([
      { modifier: 'gt', feature: 'width', value: '600px' }
    ]);
    expect(
      mediaQuery.parse('screen and (400px <= width < 800px)')[0].expressions
    ).toEqual([
      { modifier: 'min', feature: 'width', value: '400px' },
      { modifier: 'lt', feature: 'width', value: '800px' }
    ]);
    expect(
      mediaQuery.parse(
        '(800px > height >= 400px) and (orientation: portrait)'
      )[0].expressions
    ).toEqual([
      { modifier: 'lt', feature: 'height', value: '800px' },
      { modifier: 'min', feature: 'height', value: '400px' },
      { modifier: undefined, feature: 'orientation', value: 'portrait' }
    ]);
    expect(mediaQuery.parse('(width = 600px)')[0].expressions).toEqual([
      { modifier: undefined, feature: 'width', value: '600px' }
    ]);
  });

  test('should throw a SyntaxError for invalid range syntax', function () {
    function parse(query) {
      return function () {
        mediaQuery.parse(query);
      };
    }

    expect(parse('(min-width >= 600px)')).toThrow(SyntaxError);
    expect(parse('(400px < width > 800px)')).toThrow(SyntaxError);
    expect(parse('(width >= )')).toThrow(SyntaxError);
    expect(parse('(>= 600px)')).toThrow(SyntaxError);
    expect(parse('(400px < 800px)')).toThrow(SyntaxError);
  });
});

describe('mediaQuery.match()', function () {
  describe('equality check', function () {
    test('Orientation: should return true for a correct match (===)', function () {
      expect(
        mediaQuery.match('(orientation: portrait)', { orientation: 'portrait' })
      ).toBe(true);
    });

    test('orientation: should return false for an incorrect match (===)', function () {
      expect(
        mediaQuery.match('(orientation: landscape)', {
          orientation: 'portrait'
        })
      ).toBe(false);
    });

    test('prefers-reduced-motion: should return true for a correct match (===)', function () {
      expect(
        mediaQuery.match('(prefers-reduced-motion: reduce)', {
          'prefers-reduced-motion': 'reduce'
        })
      ).toBe(true);
    });

    test('prefers-reduced-motion: should return false for an incorrect match (===)', function () {
      expect(
        mediaQuery.match('(prefers-reduced-motion: reduce)', {
          'prefers-reduced-motion': 'no-preference'
        })
      ).toBe(false);
    });

    test('prefers-reduced-motion: should return true for matched default', function () {
      expect(
        mediaQuery.match('(prefers-reduced-motion)', {
          'prefers-reduced-motion': 'reduce'
        })
      ).toBe(true);
    });

    test('prefers-reduced-motion: should return false for not matching default', function () {
      expect(
        mediaQuery.match('(prefers-reduced-motion)', {
          'prefers-reduced-motion': 'no-preference'
        })
      ).toBe(false);
    });

    test('scan: should return true for a correct match (===)', function () {
      expect(
        mediaQuery.match('(scan: progressive)', { scan: 'progressive' })
      ).toBe(true);
    });

    test('scan: should return false for an incorrect match (===)', function () {
      expect(
        mediaQuery.match('(scan: progressive)', { scan: 'interlace' })
      ).toBe(false);
    });

    test('width: should return true for a correct match', function () {
      expect(mediaQuery.match('(width: 800px)', { width: 800 })).toBe(true);
    });

    test('width: should return false for an incorrect match', function () {
      expect(mediaQuery.match('(width: 800px)', { width: 900 })).toBe(false);
    });
  });

  describe('length check', function () {
    describe('width', function () {
      test('should return true for a width higher than a min-width', function () {
        expect(mediaQuery.match('(min-width: 48em)', { width: '80em' })).toBe(
          true
        );
      });

      test('should return false for a width lower than a min-width', function () {
        expect(mediaQuery.match('(min-width: 48em)', { width: '20em' })).toBe(
          false
        );
      });

      test('should return false when no width value is specified', function () {
        expect(mediaQuery.match('(min-width: 48em)', { resolution: 72 })).toBe(
          false
        );
      });
    });

    describe('different units', function () {
      test('should work with ems', function () {
        expect(mediaQuery.match('(min-width: 500px)', { width: '48em' })).toBe(
          true
        );
      });

      test('should work with rems', function () {
        expect(mediaQuery.match('(min-width: 500px)', { width: '48rem' })).toBe(
          true
        );
      });

      test('should work with cm', function () {
        expect(
          mediaQuery.match('(max-height: 1000px)', { height: '20cm' })
        ).toBe(true);
      });

      test('should work with mm', function () {
        expect(
          mediaQuery.match('(max-height: 1000px)', { height: '200mm' })
        ).toBe(true);
      });

      test('should work with inch', function () {
        expect(
          mediaQuery.match('(max-height: 1000px)', { height: '20in' })
        ).toBe(false);
      });

      test('should work with pt', function () {
        expect(
          mediaQuery.match('(max-height: 1000px)', { height: '850pt' })
        ).toBe(false);
      });

      test('should work with pc', function () {
        expect(
          mediaQuery.match('(max-height: 1000px)', { height: '60pc' })
        ).toBe(true);
      });
    });
  });

  describe('range syntax', function () {
    test('should match width ranges', function () {
      expect(mediaQuery.match('(width >= 600px)', { width: 600 })).toBe(true);
      expect(mediaQuery.match('(width >= 600px)', { width: 599 })).toBe(false);
      expect(mediaQuery.match('(width > 600px)', { width: 600 })).toBe(false);
      expect(mediaQuery.match('(width > 600px)', { width: 601 })).toBe(true);
      expect(mediaQuery.match('(width <= 600px)', { width: 600 })).toBe(true);
      expect(mediaQuery.match('(width < 600px)', { width: 600 })).toBe(false);
      expect(mediaQuery.match('(600px <= width)', { width: 600 })).toBe(true);
      expect(mediaQuery.match('(600px < width)', { width: 600 })).toBe(false);
      expect(mediaQuery.match('(width = 600px)', { width: 600 })).toBe(true);
    });

    test('should match interval ranges', function () {
      const query = '(400px <= width < 800px)';
      expect(mediaQuery.match(query, { width: 399 })).toBe(false);
      expect(mediaQuery.match(query, { width: 400 })).toBe(true);
      expect(mediaQuery.match(query, { width: 799 })).toBe(true);
      expect(mediaQuery.match(query, { width: 800 })).toBe(false);
      expect(
        mediaQuery.match('(800px > height > 400px)', { height: 500 })
      ).toBe(true);
    });

    test('should convert units and ratios', function () {
      expect(mediaQuery.match('(width >= 40em)', { width: 640 })).toBe(true);
      expect(
        mediaQuery.match('(aspect-ratio > 16/9)', { 'aspect-ratio': 2 })
      ).toBe(true);
      expect(
        mediaQuery.match('not screen and (width >= 600px)', { width: 500 })
      ).toBe(true);
    });
  });

  describe('resolution check', function () {
    test('should return true for a resolution match', function () {
      expect(mediaQuery.match('(resolution: 50dpi)', { resolution: 50 })).toBe(
        true
      );
    });

    test('should return true for a resolution higher than a min-resolution', function () {
      expect(
        mediaQuery.match('(min-resolution: 50dpi)', { resolution: 72 })
      ).toBe(true);
    });

    test('should return false for a resolution higher than a max-resolution', function () {
      expect(
        mediaQuery.match('(max-resolution: 72dpi)', { resolution: 300 })
      ).toBe(false);
    });

    test('should return false if resolution isnt passed in', function () {
      expect(mediaQuery.match('(min-resolution: 72dpi)', { width: 300 })).toBe(
        false
      );
    });

    test('should convert units properly', function () {
      expect(
        mediaQuery.match('(min-resolution: 72dpi)', { resolution: '75dpcm' })
      ).toBe(false);

      expect(
        mediaQuery.match('(resolution: 192dpi)', { resolution: '2dppx' })
      ).toBe(true);
    });
  });

  describe('aspect-ratio check', function () {
    test('should return true for an aspect-ratio higher than a min-aspect-ratio', function () {
      expect(
        mediaQuery.match('(min-aspect-ratio: 4/3)', {
          'aspect-ratio': '16 / 9'
        })
      ).toBe(true);
    });

    test('should return false for an aspect-ratio higher than a max-aspect-ratio', function () {
      expect(
        mediaQuery.match('(max-aspect-ratio: 4/3)', { 'aspect-ratio': '16/9' })
      ).toBe(false);
    });

    test('should return false if aspect-ratio isnt passed in', function () {
      expect(
        mediaQuery.match('(max-aspect-ratio: 72dpi)', { width: 300 })
      ).toBe(false);
    });

    test('should work numbers', function () {
      expect(
        mediaQuery.match('(min-aspect-ratio: 2560/1440)', {
          'aspect-ratio': 4 / 3
        })
      ).toBe(false);
    });
  });

  describe('grid/color/color-index/monochrome', function () {
    test('should return true for a correct match', function () {
      expect(mediaQuery.match('(grid)', { grid: 1 })).toBe(true);

      expect(mediaQuery.match('(color)', { color: 1 })).toBe(true);

      expect(mediaQuery.match('(color-index: 3)', { 'color-index': 3 })).toBe(
        true
      );

      expect(mediaQuery.match('(monochrome)', { monochrome: 1 })).toBe(true);
    });

    test('should return false for an incorrect match', function () {
      expect(mediaQuery.match('(grid)', { grid: 0 })).toBe(false);

      expect(mediaQuery.match('(color)', { color: 0 })).toBe(false);

      expect(mediaQuery.match('(color-index: 3)', { 'color-index': 2 })).toBe(
        false
      );

      expect(mediaQuery.match('(monochrome)', { monochrome: 0 })).toBe(false);

      expect(mediaQuery.match('(monochrome)', { monochrome: 'foo' })).toBe(
        false
      );
    });
  });

  describe('type', function () {
    test('should return true for a correct match', function () {
      expect(mediaQuery.match('screen', { type: 'screen' })).toBe(true);
    });

    test('should return false for an incorrect match', function () {
      expect(
        mediaQuery.match('screen and (color:1)', {
          type: 'tv',
          color: 1
        })
      ).toBe(false);
    });

    test('should return false for a media query without a type when type is specified in the value object', function () {
      expect(mediaQuery.match('(min-width: 500px)', { type: 'screen' })).toBe(
        false
      );
    });

    test('should return true for a media query without a type when type is not specified in the value object', function () {
      expect(mediaQuery.match('(min-width: 500px)', { width: 700 })).toBe(true);
    });
  });

  describe('not', function () {
    test('should return false when theres a match on a `not` query', function () {
      expect(
        mediaQuery.match('not screen and (color)', {
          type: 'screen',
          color: 1
        })
      ).toBe(false);
    });

    test('should not disrupt an OR query', function () {
      expect(
        mediaQuery.match(
          'not screen and (color), screen and (min-height: 48em)',
          {
            type: 'screen',
            height: 1000
          }
        )
      ).toBe(true);
    });

    test('should return false for when type === all', function () {
      expect(
        mediaQuery.match('not all and (min-width: 48em)', {
          type: 'all',
          width: 1000
        })
      ).toBe(false);
    });

    test('should return true for inverted value', function () {
      expect(
        mediaQuery.match('not screen and (min-width: 48em)', { width: '24em' })
      ).toBe(true);
    });
  });

  describe('mediaQuery.match() Integration Tests', function () {
    describe('real world use cases (mostly AND)', function () {
      test('should return true because of width and type match', function () {
        expect(
          mediaQuery.match('screen and (min-width: 767px)', {
            type: 'screen',
            width: 980
          })
        ).toBe(true);
      });

      test('should return true because of width is within bounds', function () {
        expect(
          mediaQuery.match(
            'screen and (min-width: 767px) and (max-width: 979px)',
            {
              type: 'screen',
              width: 800
            }
          )
        ).toBe(true);
      });

      test('should return false because width is out of bounds', function () {
        expect(
          mediaQuery.match(
            'screen and (min-width: 767px) and (max-width: 979px)',
            {
              type: 'screen',
              width: 980
            }
          )
        ).toBe(false);
      });

      test('should return false since monochrome is not specified', function () {
        expect(
          mediaQuery.match('screen and (monochrome)', { width: 980 })
        ).toBe(false);
      });

      test('should return true since color > 0', function () {
        expect(
          mediaQuery.match('screen and (color)', {
            type: 'screen',
            color: 1
          })
        ).toBe(true);
      });

      test('should return false since color = 0', function () {
        expect(
          mediaQuery.match('screen and (color)', {
            type: 'screen',
            color: 0
          })
        ).toBe(false);
      });
    });

    describe('grouped media queries (OR)', function () {
      test('should return true because of color', function () {
        expect(
          mediaQuery.match(
            'screen and (min-width: 767px), screen and (color)',
            {
              type: 'screen',
              color: 1
            }
          )
        ).toBe(true);
      });

      test('should return true because of width and type', function () {
        expect(
          mediaQuery.match(
            'screen and (max-width: 1200px), handheld and (monochrome)',
            {
              type: 'screen',
              width: 1100
            }
          )
        ).toBe(true);
      });

      test('should return false because of monochrome mis-match', function () {
        expect(
          mediaQuery.match(
            'screen and (max-width: 1200px), handheld and (monochrome)',
            {
              type: 'screen',
              monochrome: 0
            }
          )
        ).toBe(false);
      });
    });
  });
});
