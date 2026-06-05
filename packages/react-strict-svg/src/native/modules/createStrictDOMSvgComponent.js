/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { StrictSvgProps } from '../../types/StrictSvgProps';

import * as React from 'react';
import { Animated } from 'react-native';
import {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  FeBlend,
  FeColorMatrix,
  FeComponentTransfer,
  FeComposite,
  FeConvolveMatrix,
  FeDiffuseLighting,
  FeDisplacementMap,
  FeDistantLight,
  FeDropShadow,
  FeFlood,
  FeFuncA,
  FeFuncB,
  FeFuncG,
  FeFuncR,
  FeGaussianBlur,
  FeImage,
  FeMerge,
  FeMergeNode,
  FeMorphology,
  FeOffset,
  FePointLight,
  FeSpecularLighting,
  FeSpotLight,
  FeTile,
  FeTurbulence,
  Filter,
  ForeignObject,
  G,
  Image,
  Line,
  LinearGradient,
  Marker,
  Mask,
  Path,
  Pattern,
  Polygon,
  Polyline,
  RadialGradient,
  Rect,
  Stop,
  Svg,
  Symbol,
  Text,
  TextPath,
  TSpan,
  Use
} from 'react-native-svg';
import {
  css,
  useNativeProps_DO_NOT_USE as useNativeProps,
  useStrictDOMElement_DO_NOT_USE as useStrictDOMElement
} from 'react-strict-dom';

const RE_CAPTURE_VAR_NAME = /^var\(--(.*)\)$/;

const nativeComponents: Readonly<{
  [string]: component(ref: React.RefSetter<unknown>)
}> = {
  circle: Circle,
  clipPath: ClipPath,
  defs: Defs,
  ellipse: Ellipse,
  feBlend: FeBlend,
  feColorMatrix: FeColorMatrix,
  feComponentTransfer: FeComponentTransfer,
  feComposite: FeComposite,
  feConvolveMatrix: FeConvolveMatrix,
  feDiffuseLighting: FeDiffuseLighting,
  feDisplacementMap: FeDisplacementMap,
  feDistantLight: FeDistantLight,
  feDropShadow: FeDropShadow,
  feFlood: FeFlood,
  feFuncA: FeFuncA,
  feFuncB: FeFuncB,
  feFuncG: FeFuncG,
  feFuncR: FeFuncR,
  feGaussianBlur: FeGaussianBlur,
  feImage: FeImage,
  feMerge: FeMerge,
  feMergeNode: FeMergeNode,
  feMorphology: FeMorphology,
  feOffset: FeOffset,
  fePointLight: FePointLight,
  feSpecularLighting: FeSpecularLighting,
  feSpotLight: FeSpotLight,
  feTile: FeTile,
  feTurbulence: FeTurbulence,
  filter: Filter,
  foreignObject: ForeignObject,
  g: G,
  image: Image,
  line: Line,
  linearGradient: LinearGradient,
  marker: Marker,
  mask: Mask,
  path: Path,
  pattern: Pattern,
  polygon: Polygon,
  polyline: Polyline,
  radialGradient: RadialGradient,
  rect: Rect,
  stop: Stop,
  svg: Svg,
  symbol: Symbol,
  text: Text,
  textPath: TextPath,
  tspan: TSpan,
  use: Use
};

export function createStrictDOMSvgComponent<P extends StrictSvgProps, T>(
  tagName: string,
  _defaultProps?: P
): component(ref?: React.RefSetter<T>, ...P) {
  component Component(ref: React.RefSetter<T>, ...props: P) {
    let NativeComponent = nativeComponents[tagName];
    const elementRef = useStrictDOMElement<T>(ref, { tagName });

    const {
      alignmentBaseline,
      amplitude,
      azimuth,
      baseFrequency,
      baselineShift,
      bias,
      clipPath,
      clipRule,
      color,
      crossOrigin,
      cx,
      cy,
      d,
      diffuseConstant,
      divisor,
      dx,
      dy,
      edgeMode,
      elevation,
      exponent,
      fill,
      fillOpacity,
      fillRule,
      filter,
      filterUnits,
      floodColor,
      floodOpacity,
      fontFamily,
      fontFeatureSettings,
      fontSize,
      fontStyle,
      fontVariant,
      fontWeight,
      fx,
      fy,
      gradientTransform,
      gradientUnits,
      height,
      in: _in,
      in2,
      inlineSize,
      intercept,
      k1,
      k2,
      k3,
      k4,
      kernelMatrix,
      kernelUnitLength,
      kerning,
      lengthAdjust,
      letterSpacing,
      limitingConeAngle,
      marker,
      markerEnd,
      markerHeight,
      markerMid,
      markerStart,
      markerUnits,
      markerWidth,
      mask,
      maskContentUnits,
      maskType,
      maskUnits,
      method,
      midLine,
      mode,
      numOctaves,
      offset,
      onLoad,
      opacity,
      operator,
      order,
      orient,
      patternContentUnits,
      patternTransform,
      patternUnits,
      points,
      pointsAtX,
      pointsAtY,
      pointsAtZ,
      preserveAlpha,
      preserveAspectRatio,
      primitiveUnits,
      r,
      radius,
      refX,
      refY,
      rotate,
      rx,
      ry,
      scale,
      seed,
      side,
      slope,
      spacing,
      specularConstant,
      specularExponent,
      startOffset,
      stdDeviation,
      stitchTiles,
      stopColor,
      stopOpacity,
      stroke,
      strokeDasharray,
      strokeDashoffset,
      strokeLinecap,
      strokeLinejoin,
      strokeMiterlimit,
      strokeOpacity,
      strokeWidth,
      surfaceScale,
      tableValues,
      targetX,
      targetY,
      textAnchor,
      textDecoration,
      textLength,
      title,
      transform,
      transformOrigin,
      values,
      vectorEffect,
      verticalAlign,
      viewBox,
      width,
      wordSpacing,
      x,
      x1,
      x2,
      xChannelSelector,
      xlinkHref,
      xmlns,
      xmlnsXlink,
      y,
      y1,
      y2,
      yChannelSelector,
      z
    } = props;

    /**
     * Resolve global SVG and style props
     */

    const defaultProps = {
      style: [
        _defaultProps?.style,
        typeof height === 'number' &&
          typeof width === 'number' &&
          styles.aspectRatio(width, height)
      ]
    };

    const { customProperties, nativeProps } = useNativeProps(
      defaultProps,
      props as $FlowFixMe,
      {
        provideInheritableStyle: false,
        withInheritedStyle: false,
        withTextStyle: false
      }
    );

    // Tag-specific props

    if (alignmentBaseline != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.alignmentBaseline = alignmentBaseline;
    }
    if (amplitude != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.amplitude = amplitude;
    }
    if (azimuth != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.azimuth = azimuth;
    }
    if (baseFrequency != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.baseFrequency = baseFrequency;
    }
    if (baselineShift != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.baselineShift = baselineShift;
    }
    if (bias != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.bias = bias;
    }
    if (clipPath != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.clipPath = clipPath;
    }
    if (clipRule != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.clipRule = clipRule;
    }
    if (color != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.color = color.startsWith('var(')
        ? customProperties?.[color.replace(RE_CAPTURE_VAR_NAME, '$1')]
        : color;
    }
    if (crossOrigin != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.crossOrigin = crossOrigin;
    }
    if (cx != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.cx = cx;
    }
    if (cy != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.cy = cy;
    }
    if (d != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.d = d;
    }
    if (diffuseConstant != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.diffuseConstant = diffuseConstant;
    }
    if (divisor != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.divisor = divisor;
    }
    if (dx != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.dx = dx;
    }
    if (dy != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.dy = dy;
    }
    if (edgeMode != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.edgeMode = edgeMode;
    }
    if (elevation != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.elevation = elevation;
    }
    if (exponent != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.exponent = exponent;
    }
    if (fill != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.fill = fill.startsWith('var(')
        ? customProperties?.[fill.replace(RE_CAPTURE_VAR_NAME, '$1')]
        : fill;
    }
    if (fillOpacity != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.fillOpacity = fillOpacity;
    }
    if (fillRule != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.fillRule = fillRule;
    }
    if (filter != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.filter = filter;
    }
    if (filterUnits != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.filterUnits = filterUnits;
    }
    if (floodColor != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.floodColor = floodColor;
    }
    if (floodOpacity != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.floodOpacity = floodOpacity;
    }
    if (fontFamily != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.fontFamily = fontFamily;
    }
    if (fontFeatureSettings != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.fontFeatureSettings = fontFeatureSettings;
    }
    if (fontSize != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.fontSize = fontSize;
    }
    if (fontStyle != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.fontStyle = fontStyle;
    }
    if (fontVariant != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.fontVariant = fontVariant;
    }
    if (fontWeight != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.fontWeight = fontWeight;
    }
    if (fx != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.fx = fx;
    }
    if (fy != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.fy = fy;
    }
    if (gradientTransform != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.gradientTransform = gradientTransform;
    }
    if (gradientUnits != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.gradientUnits = gradientUnits;
    }
    if (height != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.height = height;
    }
    if (_in != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.in = _in;
    }
    if (in2 != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.in2 = in2;
    }
    if (inlineSize != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.inlineSize = inlineSize;
    }
    if (intercept != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.intercept = intercept;
    }
    if (k1 != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.k1 = k1;
    }
    if (k2 != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.k2 = k2;
    }
    if (k3 != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.k3 = k3;
    }
    if (k4 != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.k4 = k4;
    }
    if (kernelMatrix != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.kernelMatrix = kernelMatrix;
    }
    if (kernelUnitLength != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.kernelUnitLength = kernelUnitLength;
    }
    if (kerning != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.kerning = kerning;
    }
    if (lengthAdjust != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.lengthAdjust = lengthAdjust;
    }
    if (letterSpacing != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.letterSpacing = letterSpacing;
    }
    if (limitingConeAngle != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.limitingConeAngle = limitingConeAngle;
    }
    if (marker != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.marker = marker;
    }
    if (markerEnd != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.markerEnd = markerEnd;
    }
    if (markerHeight != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.markerHeight = markerHeight;
    }
    if (markerMid != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.markerMid = markerMid;
    }
    if (markerStart != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.markerStart = markerStart;
    }
    if (markerUnits != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.markerUnits = markerUnits;
    }
    if (markerWidth != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.markerWidth = markerWidth;
    }
    if (mask != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.mask = mask;
    }
    if (maskContentUnits != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.maskContentUnits = maskContentUnits;
    }
    if (maskType != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.maskType = maskType;
    }
    if (maskUnits != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.maskUnits = maskUnits;
    }
    if (method != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.method = method;
    }
    if (midLine != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.midLine = midLine;
    }
    if (mode != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.mode = mode;
    }
    if (numOctaves != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.numOctaves = numOctaves;
    }
    if (offset != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.offset = offset;
    }
    if (onLoad != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.onLoad = onLoad;
    }
    if (opacity != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.opacity = opacity;
    }
    if (operator != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.operator = operator;
    }
    if (order != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.order = order;
    }
    if (orient != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.orient = orient;
    }
    if (patternContentUnits != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.patternContentUnits = patternContentUnits;
    }
    if (patternTransform != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.patternTransform = patternTransform;
    }
    if (patternUnits != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.patternUnits = patternUnits;
    }
    if (points != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.points = points;
    }
    if (pointsAtX != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.pointsAtX = pointsAtX;
    }
    if (pointsAtY != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.pointsAtY = pointsAtY;
    }
    if (pointsAtZ != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.pointsAtZ = pointsAtZ;
    }
    if (preserveAlpha != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.preserveAlpha = preserveAlpha;
    }
    if (preserveAspectRatio != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.preserveAspectRatio = preserveAspectRatio;
    }
    if (primitiveUnits != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.primitiveUnits = primitiveUnits;
    }
    if (r != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.r = r;
    }
    if (radius != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.radius = radius;
    }
    if (refX != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.refX = refX;
    }
    if (refY != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.refY = refY;
    }
    if (rotate != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.rotate = rotate;
    }
    if (rx != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.rx = rx;
    }
    if (ry != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.ry = ry;
    }
    if (scale != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.scale = scale;
    }
    if (seed != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.seed = seed;
    }
    if (side != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.side = side;
    }
    if (slope != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.slope = slope;
    }
    if (spacing != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.spacing = spacing;
    }
    if (specularConstant != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.specularConstant = specularConstant;
    }
    if (specularExponent != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.specularExponent = specularExponent;
    }
    if (startOffset != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.startOffset = startOffset;
    }
    if (stdDeviation != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.stdDeviation = stdDeviation;
    }
    if (stitchTiles != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.stitchTiles = stitchTiles;
    }
    if (stopColor != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.stopColor = stopColor;
    }
    if (stopOpacity != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.stopOpacity = stopOpacity;
    }
    if (stroke != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.stroke = stroke.startsWith('var(')
        ? customProperties?.[stroke.replace(RE_CAPTURE_VAR_NAME, '$1')]
        : stroke;
    }
    if (strokeDasharray != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.strokeDasharray = strokeDasharray;
    }
    if (strokeDashoffset != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.strokeDashoffset = strokeDashoffset;
    }
    if (strokeLinecap != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.strokeLinecap = strokeLinecap;
    }
    if (strokeLinejoin != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.strokeLinejoin = strokeLinejoin;
    }
    if (strokeMiterlimit != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.strokeMiterlimit = strokeMiterlimit;
    }
    if (strokeOpacity != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.strokeOpacity = strokeOpacity;
    }
    if (strokeWidth != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.strokeWidth = strokeWidth;
    }
    if (surfaceScale != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.surfaceScale = surfaceScale;
    }
    if (tableValues != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.tableValues = tableValues;
    }
    if (targetX != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.targetX = targetX;
    }
    if (targetY != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.targetY = targetY;
    }
    if (textAnchor != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.textAnchor = textAnchor;
    }
    if (textDecoration != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.textDecoration = textDecoration;
    }
    if (textLength != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.textLength = textLength;
    }
    if (title != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.title = title;
    }
    if (transform != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.transform = transform;
    }
    if (transformOrigin != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.origin = transformOrigin;
    }
    if (values != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.values = values;
    }
    if (vectorEffect != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.vectorEffect = vectorEffect;
    }
    if (verticalAlign != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.verticalAlign = verticalAlign;
    }
    if (viewBox != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.viewBox = viewBox;
    }
    if (width != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.width = width;
    }
    if (wordSpacing != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.wordSpacing = wordSpacing;
    }
    if (x != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.x = x;
    }
    if (x1 != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.x1 = x1;
    }
    if (x2 != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.x2 = x2;
    }
    if (xChannelSelector != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.xChannelSelector = xChannelSelector;
    }
    if (xlinkHref != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.xlinkHref = xlinkHref;
    }
    if (xmlns != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.xmlns = xmlns;
    }
    if (xmlnsXlink != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.xmlnsXlink = xmlnsXlink;
    }
    if (y != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.y = y;
    }
    if (y1 != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.y1 = y1;
    }
    if (y2 != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.y2 = y2;
    }
    if (yChannelSelector != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.yChannelSelector = yChannelSelector;
    }
    if (z != null) {
      // $FlowFixMe[react-rule-hook-mutation]
      nativeProps.z = z;
    }

    // Component-specific props

    // $FlowFixMe[react-rule-hook-mutation]
    nativeProps.ref = elementRef;

    // Use Animated components if necessary
    if (nativeProps.animated === true) {
      NativeComponent = Animated.createAnimatedComponent(NativeComponent);
    }

    const element: React.Node =
      typeof props.children === 'function' ? (
        props.children(nativeProps)
      ) : (
        // $FlowFixMe[incompatible-type]
        <NativeComponent {...nativeProps} />
      );

    return element;
  }

  // eslint-disable-next-line no-unreachable
  Component.displayName = `svg.${tagName}`;
  return Component;
}

const styles = css.create({
  aspectRatio: (width: number, height: number) => ({
    aspectRatio: width / height,
    width,
    height
  })
});
