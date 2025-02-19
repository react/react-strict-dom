/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { StrictReactDOMProps } from './StrictReactDOMProps';
import type { Styles } from './styles';

type Units = 'userSpaceOnUse' | 'objectBoundingBox';

type FontProps = Readonly<{
  fontFamily?: string,
  fontSize?: string | number,
  fontStyle?: 'normal' | 'italic' | 'oblique',
  fontVariant?: 'normal' | 'small-caps',
  fontWeight?: string | number,
  kerning?: string | number,
  letterSpacing?: string | number,
  textAnchor?: 'start' | 'middle' | 'end',
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through' | 'blink',
  wordSpacing?: string | number
}>;

type TransformProps = Readonly<{
  transform?: string,
  transformOrigin?: string,
  x?: string | number,
  y?: string | number
}>;

type PathProps = Readonly<{
  ...TransformProps,
  ...Pick<StrictReactDOMProps, 'aria-label' | 'data-testid'>,
  clipPath?: string,
  clipRule?: 'evenodd' | 'nonzero',
  color?: string,
  fill?: string,
  fillOpacity?: string | number,
  fillRule?: 'evenodd' | 'nonzero',
  filter?: string,
  id?: ?string,
  marker?: string,
  markerEnd?: string,
  markerMid?: string,
  markerStart?: string,
  mask?: string,
  stroke?: string,
  strokeDasharray?: string | number,
  strokeDashoffset?: string | number,
  strokeLinecap?: 'butt' | 'square' | 'round',
  strokeLinejoin?: 'miter' | 'bevel' | 'round',
  strokeMiterlimit?: string | number,
  strokeOpacity?: string | number,
  strokeWidth?: string | number,
  vectorEffect?: 'none' | 'non-scaling-stroke' | 'default' | 'inherit' | 'uri'
}>;

type TextProps = Readonly<{
  ...PathProps,
  ...FontProps,
  alignmentBaseline?:
    | 'baseline'
    | 'before-edge'
    | 'text-before-edge'
    | 'middle'
    | 'central'
    | 'after-edge'
    | 'text-after-edge'
    | 'ideographic'
    | 'alphabetic'
    | 'hanging'
    | 'mathematical',
  baselineShift?: string | number,
  fontFeatureSettings?: string,
  lengthAdjust?: 'spacing' | 'spacingAndGlyphs',
  textLength?: string | number,
  verticalAlign?: string | number
}>;

export type StrictReactDOMSvgProps = Readonly<{
  ...StrictReactDOMProps,
  ...StrictReactDOMGProps,
  height?: string | number,
  preserveAspectRatio?: string,
  title?: string,
  viewBox?: string,
  width?: string | number,
  xmlns?: string,
  xmlnsXlink?: string
}>;

export type StrictReactDOMCircleProps = Readonly<{
  ...PathProps,
  cx?: string | number,
  cy?: string | number,
  opacity?: string | number,
  r?: string | number
}>;

export type StrictReactDOMClipPathProps = Readonly<{
  children?: React.Node,
  id?: ?string
}>;

export type StrictReactDOMDefsProps = Readonly<{
  children?: React.Node,
  id?: ?string
}>;

export type StrictReactDOMEllipseProps = Readonly<{
  ...PathProps,
  cx?: string | number,
  cy?: string | number,
  opacity?: string | number,
  rx?: string | number,
  ry?: string | number
}>;

export type StrictReactDOMForeignObjectProps = Readonly<{
  children?: React.Node,
  height?: string | number,
  width?: string | number,
  x?: string | number,
  y?: string | number
}>;

export type StrictReactDOMGProps = Readonly<{
  ...PathProps,
  ...FontProps,
  children?: React.Node,
  opacity?: string | number
}>;

export type StrictReactDOMImageProps = Readonly<{
  ...PathProps,
  height?: string | number,
  href?: string,
  onLoad?: $FlowFixMe,
  opacity?: string | number,
  preserveAspectRatio?: string,
  width?: string | number,
  x?: string | number,
  xlinkHref?: string,
  y?: string | number
}>;

export type StrictReactDOMLineProps = Readonly<{
  ...PathProps,
  opacity?: string | number,
  x1?: string | number,
  x2?: string | number,
  y1?: string | number,
  y2?: string | number
}>;

export type StrictReactDOMLinearGradientProps = Readonly<{
  children?: React.Node,
  gradientTransform?: string,
  gradientUnits?: Units,
  id?: ?string,
  x1?: string | number,
  x2?: string | number,
  y1?: string | number,
  y2?: string | number
}>;

export type StrictReactDOMMarkerProps = Readonly<{
  children?: React.Node,
  id?: ?string,
  markerHeight?: string | number,
  markerUnits?: 'strokeWidth' | 'userSpaceOnUse',
  markerWidth?: string | number,
  orient?: string | number,
  preserveAspectRatio?: string,
  refX?: string | number,
  refY?: string | number,
  viewBox?: string
}>;

export type StrictReactDOMMaskProps = Readonly<{
  ...PathProps,
  children?: React.Node,
  height?: string | number,
  id?: ?string,
  maskContentUnits?: Units,
  maskType?: string | number,
  maskUnits?: Units,
  style?: ?Styles,
  width?: string | number,
  x?: string | number,
  y?: string | number
}>;

export type StrictReactDOMPathProps = Readonly<{
  ...PathProps,
  d?: string,
  opacity?: string | number
}>;

export type StrictReactDOMPatternProps = Readonly<{
  ...TransformProps,
  children?: React.Node,
  height?: string | number,
  id?: ?string,
  patternContentUnits?: Units,
  patternTransform?: string,
  patternUnits?: Units,
  preserveAspectRatio?: string,
  viewBox?: string,
  width?: string | number,
  x?: string | number,
  y?: string | number
}>;

export type StrictReactDOMPolygonProps = Readonly<{
  ...PathProps,
  opacity?: string | number,
  points?: string
}>;

export type StrictReactDOMPolylineProps = Readonly<{
  ...PathProps,
  opacity?: string | number,
  points?: string
}>;

export type StrictReactDOMRadialGradientProps = Readonly<{
  children?: React.Node,
  cx?: string | number,
  cy?: string | number,
  fx?: string | number,
  fy?: string | number,
  gradientTransform?: string,
  gradientUnits?: Units,
  id?: ?string,
  r?: string | number,
  rx?: string | number,
  ry?: string | number
}>;

export type StrictReactDOMRectProps = Readonly<{
  ...PathProps,
  height?: string | number,
  opacity?: string | number,
  rx?: string | number,
  ry?: string | number,
  width?: string | number,
  x?: string | number,
  y?: string | number
}>;

export type StrictReactDOMStopProps = Readonly<{
  offset?: string | number,
  stopColor?: string,
  stopOpacity?: string | number
}>;

export type StrictReactDOMSymbolProps = Readonly<{
  children?: React.Node,
  id?: ?string,
  opacity?: string | number,
  preserveAspectRatio?: string,
  viewBox?: string
}>;

export type StrictReactDOMTSpanProps = Readonly<{
  ...PathProps,
  ...FontProps,
  children?: React.Node,
  dx?: string | number,
  dy?: string | number,
  inlineSize?: string | number,
  rotate?: string | number,
  x?: string | number,
  y?: string | number
}>;

export type StrictReactDOMTextProps = Readonly<{
  ...TextProps,
  children?: React.Node,
  dx?: string | number,
  dy?: string | number,
  inlineSize?: string | number,
  opacity?: string | number,
  rotate?: string | number,
  style?: ?Styles,
  x?: string | number,
  y?: string | number
}>;

export type StrictReactDOMTextPathProps = Readonly<{
  ...TextProps,
  children?: React.Node,
  href?: string,
  method?: 'align' | 'stretch',
  midLine?: 'sharp' | 'smooth',
  side?: string,
  spacing?: 'auto' | 'exact',
  startOffset?: string | number,
  xlinkHref?: string
}>;

export type StrictReactDOMUseProps = Readonly<{
  ...PathProps,
  children?: React.Node,
  height?: string | number,
  href?: string,
  opacity?: string | number,
  width?: string | number,
  x?: string | number,
  xlinkHref?: string,
  y?: string | number
}>;

export type StrictReactDOMFeBlendProps = Readonly<{
  in?: string,
  in2?: string,
  mode?: 'normal' | 'multiply' | 'screen' | 'darken' | 'lighten'
}>;

export type StrictReactDOMFeColorMatrixProps = Readonly<{
  in?: string,
  type?: 'matrix' | 'saturate' | 'hueRotate' | 'luminanceToAlpha',
  values?: string
}>;

export type StrictReactDOMFeComponentTransferProps = Readonly<{
  children?: React.Node,
  in?: string
}>;

export type StrictReactDOMFeFuncAProps = Readonly<{
  amplitude?: string | number,
  exponent?: string | number,
  intercept?: string | number,
  offset?: string | number,
  slope?: string | number,
  tableValues?: string | number,
  type?: 'identity' | 'table' | 'discrete' | 'linear' | 'gamma'
}>;

export type StrictReactDOMFeFuncBProps = StrictReactDOMFeFuncAProps;

export type StrictReactDOMFeFuncGProps = StrictReactDOMFeFuncAProps;

export type StrictReactDOMFeFuncRProps = StrictReactDOMFeFuncAProps;

export type StrictReactDOMFeCompositeProps = Readonly<{
  in?: string,
  in2?: string,
  k1?: string | number,
  k2?: string | number,
  k3?: string | number,
  k4?: string | number,
  operator?: 'over' | 'in' | 'out' | 'atop' | 'xor' | 'arithmetic'
}>;

export type StrictReactDOMFeConvolveMatrixProps = Readonly<{
  bias?: string | number,
  divisor?: string | number,
  edgeMode?: 'duplicate' | 'wrap' | 'none',
  in?: string,
  kernelMatrix?: string | number,
  kernelUnitLength?: string | number,
  order?: string | number,
  preserveAlpha?: boolean | 'true' | 'false',
  targetX?: string | number,
  targetY?: string | number
}>;

export type StrictReactDOMFeDiffuseLightingProps = Readonly<{
  diffuseConstant?: string | number,
  in?: string,
  kernelUnitLength?: string | number,
  surfaceScale?: string | number
}>;

export type StrictReactDOMFeDisplacementMapProps = Readonly<{
  in?: string,
  in2?: string,
  scale?: string | number,
  xChannelSelector?: 'R' | 'G' | 'B' | 'A',
  yChannelSelector?: 'R' | 'G' | 'B' | 'A'
}>;

export type StrictReactDOMFeDistantLightProps = Readonly<{
  azimuth?: string | number,
  elevation?: string | number
}>;

export type StrictReactDOMFeDropShadowProps = Readonly<{
  dx?: string | number,
  dy?: string | number,
  floodColor?: string,
  floodOpacity?: string | number,
  in?: string,
  stdDeviation?: string | number
}>;

export type StrictReactDOMFeFloodProps = Readonly<{
  floodColor?: string,
  floodOpacity?: string | number,
  in?: string
}>;

export type StrictReactDOMFeGaussianBlurProps = Readonly<{
  edgeMode?: 'duplicate' | 'wrap' | 'none',
  in?: string,
  stdDeviation?: string | number
}>;

export type StrictReactDOMFeImageProps = Readonly<{
  crossOrigin?: 'anonymous' | 'use-credentials' | '',
  href?: string,
  preserveAspectRatio?: string
}>;

export type StrictReactDOMFeMergeProps = Readonly<{
  children?: React.Node
}>;

export type StrictReactDOMFeMergeNodeProps = Readonly<{
  in?: string
}>;

export type StrictReactDOMFeMorphologyProps = Readonly<{
  in?: string,
  operator?: 'erode' | 'dilate',
  radius?: string | number
}>;

export type StrictReactDOMFeOffsetProps = Readonly<{
  dx?: string | number,
  dy?: string | number,
  in?: string
}>;

export type StrictReactDOMFePointLightProps = Readonly<{
  x?: string | number,
  y?: string | number,
  z?: string | number
}>;

export type StrictReactDOMFeSpecularLightingProps = Readonly<{
  in?: string,
  kernelUnitLength?: string | number,
  specularConstant?: string | number,
  specularExponent?: string | number,
  surfaceScale?: string | number
}>;

export type StrictReactDOMFeSpotLightProps = Readonly<{
  limitingConeAngle?: string | number,
  pointsAtX?: string | number,
  pointsAtY?: string | number,
  pointsAtZ?: string | number,
  specularExponent?: string | number,
  x?: string | number,
  y?: string | number,
  z?: string | number
}>;

export type StrictReactDOMFeTileProps = Readonly<{
  in?: string
}>;

export type StrictReactDOMFeTurbulenceProps = Readonly<{
  baseFrequency?: string | number,
  numOctaves?: string | number,
  seed?: string | number,
  stitchTiles?: 'stitch' | 'noStitch',
  type?: 'fractalNoise' | 'turbulence'
}>;

export type StrictReactDOMFilterProps = Readonly<{
  children?: React.Node,
  filterUnits?: Units,
  height?: string | number,
  id?: ?string,
  primitiveUnits?: Units,
  width?: string | number,
  x?: string | number,
  y?: string | number
}>;
