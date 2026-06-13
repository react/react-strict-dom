/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {
  StrictReactDOMCircleProps,
  StrictReactDOMClipPathProps,
  StrictReactDOMDefsProps,
  StrictReactDOMEllipseProps,
  StrictReactDOMFeBlendProps,
  StrictReactDOMFeColorMatrixProps,
  StrictReactDOMFeComponentTransferProps,
  StrictReactDOMFeCompositeProps,
  StrictReactDOMFeConvolveMatrixProps,
  StrictReactDOMFeDiffuseLightingProps,
  StrictReactDOMFeDisplacementMapProps,
  StrictReactDOMFeDistantLightProps,
  StrictReactDOMFeDropShadowProps,
  StrictReactDOMFeFloodProps,
  StrictReactDOMFeFuncAProps,
  StrictReactDOMFeFuncBProps,
  StrictReactDOMFeFuncGProps,
  StrictReactDOMFeFuncRProps,
  StrictReactDOMFeGaussianBlurProps,
  StrictReactDOMFeImageProps,
  StrictReactDOMFeMergeNodeProps,
  StrictReactDOMFeMergeProps,
  StrictReactDOMFeMorphologyProps,
  StrictReactDOMFeOffsetProps,
  StrictReactDOMFePointLightProps,
  StrictReactDOMFeSpecularLightingProps,
  StrictReactDOMFeSpotLightProps,
  StrictReactDOMFeTileProps,
  StrictReactDOMFeTurbulenceProps,
  StrictReactDOMFilterProps,
  StrictReactDOMForeignObjectProps,
  StrictReactDOMGProps,
  StrictReactDOMImageProps,
  StrictReactDOMLinearGradientProps,
  StrictReactDOMLineProps,
  StrictReactDOMMarkerProps,
  StrictReactDOMMaskProps,
  StrictReactDOMPathProps,
  StrictReactDOMPatternProps,
  StrictReactDOMPolygonProps,
  StrictReactDOMPolylineProps,
  StrictReactDOMRadialGradientProps,
  StrictReactDOMRectProps,
  StrictReactDOMStopProps,
  StrictReactDOMSvgProps,
  StrictReactDOMSymbolProps,
  StrictReactDOMTextPathProps,
  StrictReactDOMTextProps,
  StrictReactDOMTSpanProps,
  StrictReactDOMUseProps
} from '../types/StrictReactDOMSvgProps';

// $FlowFixMe[nonstrict-import]
import { createStrictDOMSvgComponent as createStrictSvg } from './modules/createStrictDOMSvgComponent';

/**
 * "circle"
 */
export const circle: component(
  ref?: React.RefSetter<SVGCircleElement>,
  ...StrictReactDOMCircleProps
) = createStrictSvg('circle') as $FlowFixMe;

/**
 * "clipPath"
 */
export const clipPath: component(
  ref?: React.RefSetter<SVGClipPathElement>,
  ...StrictReactDOMClipPathProps
) = createStrictSvg('clipPath') as $FlowFixMe;

/**
 * "defs"
 */
export const defs: component(
  ref?: React.RefSetter<SVGDefsElement>,
  ...StrictReactDOMDefsProps
) = createStrictSvg('defs') as $FlowFixMe;

/**
 * "ellipse"
 */
export const ellipse: component(
  ref?: React.RefSetter<SVGEllipseElement>,
  ...StrictReactDOMEllipseProps
) = createStrictSvg('ellipse') as $FlowFixMe;

/**
 * "feBlend"
 */
export const feBlend: component(
  ref?: React.RefSetter<SVGFEBlendElement>,
  ...StrictReactDOMFeBlendProps
) = createStrictSvg('feBlend') as $FlowFixMe;

/**
 * "feColorMatrix"
 */
export const feColorMatrix: component(
  ref?: React.RefSetter<SVGFEColorMatrixElement>,
  ...StrictReactDOMFeColorMatrixProps
) = createStrictSvg('feColorMatrix') as $FlowFixMe;

/**
 * "feComponentTransfer"
 */
export const feComponentTransfer: component(
  ref?: React.RefSetter<SVGFEComponentTransferElement>,
  ...StrictReactDOMFeComponentTransferProps
) = createStrictSvg('feComponentTransfer') as $FlowFixMe;

/**
 * "feFuncA"
 */
export const feFuncA: component(
  ref?: React.RefSetter<SVGFEFuncAElement>,
  ...StrictReactDOMFeFuncAProps
) = createStrictSvg('feFuncA') as $FlowFixMe;

/**
 * "feFuncB"
 */
export const feFuncB: component(
  ref?: React.RefSetter<SVGFEFuncBElement>,
  ...StrictReactDOMFeFuncBProps
) = createStrictSvg('feFuncB') as $FlowFixMe;

/**
 * "feFuncG"
 */
export const feFuncG: component(
  ref?: React.RefSetter<SVGFEFuncGElement>,
  ...StrictReactDOMFeFuncGProps
) = createStrictSvg('feFuncG') as $FlowFixMe;

/**
 * "feFuncR"
 */
export const feFuncR: component(
  ref?: React.RefSetter<SVGFEFuncRElement>,
  ...StrictReactDOMFeFuncRProps
) = createStrictSvg('feFuncR') as $FlowFixMe;

/**
 * "feComposite"
 */
export const feComposite: component(
  ref?: React.RefSetter<SVGFECompositeElement>,
  ...StrictReactDOMFeCompositeProps
) = createStrictSvg('feComposite') as $FlowFixMe;

/**
 * "feConvolveMatrix"
 */
export const feConvolveMatrix: component(
  ref?: React.RefSetter<SVGFEComponentTransferElement>,
  ...StrictReactDOMFeConvolveMatrixProps
) = createStrictSvg('feConvolveMatrix') as $FlowFixMe;

/**
 * "feDiffuseLighting"
 */
export const feDiffuseLighting: component(
  ref?: React.RefSetter<SVGFEDiffuseLightingElement>,
  ...StrictReactDOMFeDiffuseLightingProps
) = createStrictSvg('feDiffuseLighting') as $FlowFixMe;

/**
 * "feDisplacementMap"
 */
export const feDisplacementMap: component(
  ref?: React.RefSetter<SVGFEDisplacementMapElement>,
  ...StrictReactDOMFeDisplacementMapProps
) = createStrictSvg('feDisplacementMap') as $FlowFixMe;

/**
 * "feDistantLight"
 */
export const feDistantLight: component(
  ref?: React.RefSetter<SVGFEDistantLightElement>,
  ...StrictReactDOMFeDistantLightProps
) = createStrictSvg('feDistantLight') as $FlowFixMe;

/**
 * "feDropShadow"
 */
export const feDropShadow: component(
  ref?: React.RefSetter<SVGFEDropShadowElement>,
  ...StrictReactDOMFeDropShadowProps
) = createStrictSvg('feDropShadow') as $FlowFixMe;

/**
 * "feFlood"
 */
export const feFlood: component(
  ref?: React.RefSetter<SVGFEFloodElement>,
  ...StrictReactDOMFeFloodProps
) = createStrictSvg('feFlood') as $FlowFixMe;

/**
 * "feGaussianBlur"
 */
export const feGaussianBlur: component(
  ref?: React.RefSetter<SVGFEGaussianBlurElement>,
  ...StrictReactDOMFeGaussianBlurProps
) = createStrictSvg('feGaussianBlur') as $FlowFixMe;

/**
 * "feImage"
 */
export const feImage: component(
  ref?: React.RefSetter<SVGFEImageElement>,
  ...StrictReactDOMFeImageProps
) = createStrictSvg('feImage') as $FlowFixMe;

/**
 * "feMerge"
 */
export const feMerge: component(
  ref?: React.RefSetter<SVGFEMergeElement>,
  ...StrictReactDOMFeMergeProps
) = createStrictSvg('feMerge') as $FlowFixMe;

/**
 * "feMergeNode"
 */
export const feMergeNode: component(
  ref?: React.RefSetter<SVGFEMergeNodeElement>,
  ...StrictReactDOMFeMergeNodeProps
) = createStrictSvg('feMergeNode') as $FlowFixMe;

/**
 * "feMorphology"
 */
export const feMorphology: component(
  ref?: React.RefSetter<SVGFEMorphologyElement>,
  ...StrictReactDOMFeMorphologyProps
) = createStrictSvg('feMorphology') as $FlowFixMe;

/**
 * "feOffset"
 */
export const feOffset: component(
  ref?: React.RefSetter<SVGFEOffsetElement>,
  ...StrictReactDOMFeOffsetProps
) = createStrictSvg('feOffset') as $FlowFixMe;

/**
 * "fePointLight"
 */
export const fePointLight: component(
  ref?: React.RefSetter<SVGFEPointLightElement>,
  ...StrictReactDOMFePointLightProps
) = createStrictSvg('fePointLight') as $FlowFixMe;

/**
 * "feSpecularLighting"
 */
export const feSpecularLighting: component(
  ref?: React.RefSetter<SVGFESpecularLightingElement>,
  ...StrictReactDOMFeSpecularLightingProps
) = createStrictSvg('feSpecularLighting') as $FlowFixMe;

/**
 * "feSpotLight"
 */
export const feSpotLight: component(
  ref?: React.RefSetter<SVGFESpotLightElement>,
  ...StrictReactDOMFeSpotLightProps
) = createStrictSvg('feSpotLight') as $FlowFixMe;

/**
 * "feTile"
 */
export const feTile: component(
  ref?: React.RefSetter<SVGFETileElement>,
  ...StrictReactDOMFeTileProps
) = createStrictSvg('feTile') as $FlowFixMe;

/**
 * "feTurbulence"
 */
export const feTurbulence: component(
  ref?: React.RefSetter<SVGFETurbulenceElement>,
  ...StrictReactDOMFeTurbulenceProps
) = createStrictSvg('feTurbulence') as $FlowFixMe;

/**
 * "filter"
 */
export const filter: component(
  ref?: React.RefSetter<SVGFilterElement>,
  ...StrictReactDOMFilterProps
) = createStrictSvg('filter') as $FlowFixMe;

/**
 * "foreignObject"
 */
export const foreignObject: component(
  ref?: React.RefSetter<SVGForeignObjectElement>,
  ...StrictReactDOMForeignObjectProps
) = createStrictSvg('foreignObject') as $FlowFixMe;

/**
 * "g"
 */
export const g: component(
  ref?: React.RefSetter<SVGGElement>,
  ...StrictReactDOMGProps
) = createStrictSvg('g') as $FlowFixMe;

/**
 * "image"
 */
export const image: component(
  ref?: React.RefSetter<SVGImageElement>,
  ...StrictReactDOMImageProps
) = createStrictSvg('image') as $FlowFixMe;

/**
 * "line"
 */
export const line: component(
  ref?: React.RefSetter<SVGLineElement>,
  ...StrictReactDOMLineProps
) = createStrictSvg('line') as $FlowFixMe;

/**
 * "linearGradient"
 */
export const linearGradient: component(
  ref?: React.RefSetter<SVGLinearGradientElement>,
  ...StrictReactDOMLinearGradientProps
) = createStrictSvg('linearGradient') as $FlowFixMe;

/**
 * "marker"
 */
export const marker: component(
  ref?: React.RefSetter<SVGMarkerElement>,
  ...StrictReactDOMMarkerProps
) = createStrictSvg('marker') as $FlowFixMe;

/**
 * "mask"
 */
export const mask: component(
  ref?: React.RefSetter<SVGMaskElement>,
  ...StrictReactDOMMaskProps
) = createStrictSvg('mask') as $FlowFixMe;

/**
 * "path"
 */
export const path: component(
  ref?: React.RefSetter<SVGPathElement>,
  ...StrictReactDOMPathProps
) = createStrictSvg('path') as $FlowFixMe;

/**
 * "pattern"
 */
export const pattern: component(
  ref?: React.RefSetter<SVGPatternElement>,
  ...StrictReactDOMPatternProps
) = createStrictSvg('pattern') as $FlowFixMe;

/**
 * "polygon"
 */
export const polygon: component(
  ref?: React.RefSetter<SVGPolygonElement>,
  ...StrictReactDOMPolygonProps
) = createStrictSvg('polygon') as $FlowFixMe;

/**
 * "polyline"
 */
export const polyline: component(
  ref?: React.RefSetter<SVGPolylineElement>,
  ...StrictReactDOMPolylineProps
) = createStrictSvg('polyline') as $FlowFixMe;

/**
 * "radialGradient"
 */
export const radialGradient: component(
  ref?: React.RefSetter<SVGRadialGradientElement>,
  ...StrictReactDOMRadialGradientProps
) = createStrictSvg('radialGradient') as $FlowFixMe;

/**
 * "rect"
 */
export const rect: component(
  ref?: React.RefSetter<SVGRectElement>,
  ...StrictReactDOMRectProps
) = createStrictSvg('rect') as $FlowFixMe;

/**
 * "stop"
 */
export const stop: component(
  ref?: React.RefSetter<SVGStopElement>,
  ...StrictReactDOMStopProps
) = createStrictSvg('stop') as $FlowFixMe;

/**
 * "svg" (inline)
 */
export const svg: component(
  ref?: React.RefSetter<HTMLElement>,
  ...StrictReactDOMSvgProps
) = createStrictSvg('svg') as $FlowFixMe;

/**
 * "symbol"
 */
export const symbol: component(
  ref?: React.RefSetter<SVGSymbolElement>,
  ...StrictReactDOMSymbolProps
) = createStrictSvg('symbol') as $FlowFixMe;

/**
 * "tspan"
 */
export const tspan: component(
  ref?: React.RefSetter<SVGTSpanElement>,
  ...StrictReactDOMTSpanProps
) = createStrictSvg('tSpan') as $FlowFixMe;

/**
 * "text"
 */
export const text: component(
  ref?: React.RefSetter<SVGTextElement>,
  ...StrictReactDOMTextProps
) = createStrictSvg('text') as $FlowFixMe;

/**
 * "textPath"
 */
export const textPath: component(
  ref?: React.RefSetter<SVGTextPathElement>,
  ...StrictReactDOMTextPathProps
) = createStrictSvg('textPath') as $FlowFixMe;

/**
 * "use"
 */
export const use: component(
  ref?: React.RefSetter<SVGUseElement>,
  ...StrictReactDOMUseProps
) = createStrictSvg('use') as $FlowFixMe;
