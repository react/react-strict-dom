/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

// This type allows Meta (and other users) to define data-*
// props used by their components to work around Flow's current
// lack of support for typing arbitrary data-* props.
declare type ReactStrictDOMDataProps = {
  'data-testid'?: ?string
};

// This type allows Meta to internally override it with an
// internationalization type which is a string at runtime…
// but Flow doesn't know that.
declare type Stringish = string;

declare type SVGCircleElement = {};
declare type SVGClipPathElement = {};
declare type SVGDefsElement = {};
declare type SVGEllipseElement = {};
declare type SVGFEBlendElement = {};
declare type SVGFEColorMatrixElement = {};
declare type SVGFEComponentTransferElement = {};
declare type SVGFECompositeElement = {};
declare type SVGFEConvolveMatrixElement = {};
declare type SVGFEDiffuseLightingElement = {};
declare type SVGFEDisplacementMapElement = {};
declare type SVGFEDistantLightElement = {};
declare type SVGFEDropShadowElement = {};
declare type SVGFEFloodElement = {};
declare type SVGFEFuncAElement = {};
declare type SVGFEFuncBElement = {};
declare type SVGFEFuncGElement = {};
declare type SVGFEFuncRElement = {};
declare type SVGFEGaussianBlurElement = {};
declare type SVGFEImageElement = {};
declare type SVGFEMergeElement = {};
declare type SVGFEMergeNodeElement = {};
declare type SVGFEMorphologyElement = {};
declare type SVGFEOffsetElement = {};
declare type SVGFEPointLightElement = {};
declare type SVGFESpecularLightingElement = {};
declare type SVGFESpotLightElement = {};
declare type SVGFETileElement = {};
declare type SVGFETurbulenceElement = {};
declare type SVGFilterElement = {};
declare type SVGForeignObjectElement = {};
declare type SVGGElement = {};
declare type SVGImageElement = {};
declare type SVGLineElement = {};
declare type SVGLinearGradientElement = {};
declare type SVGMarkerElement = {};
declare type SVGMaskElement = {};
declare type SVGPathElement = {};
declare type SVGPatternElement = {};
declare type SVGPolygonElement = {};
declare type SVGPolylineElement = {};
declare type SVGRadialGradientElement = {};
declare type SVGRectElement = {};
declare type SVGStopElement = {};
declare type SVGSVGElement = {};
declare type SVGSymbolElement = {};
declare type SVGTextElement = {};
declare type SVGTextPathElement = {};
declare type SVGTSpanElement = {};
declare type SVGUseElement = {};
