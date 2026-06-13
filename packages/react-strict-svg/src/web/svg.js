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
import { defaultStyles } from './runtime';

/**
 * "circle"
 */
export const circle: component(
  ref?: React.RefSetter<SVGCircleElement>,
  ...StrictReactDOMCircleProps
) = createStrictSvg<SVGCircleElement, StrictReactDOMCircleProps>('circle');

/**
 * "clipPath"
 */
export const clipPath: component(
  ref?: React.RefSetter<SVGClipPathElement>,
  ...StrictReactDOMClipPathProps
) = createStrictSvg<SVGClipPathElement, StrictReactDOMClipPathProps>(
  'clipPath'
);

/**
 * "defs"
 */
export const defs: component(
  ref?: React.RefSetter<SVGDefsElement>,
  ...StrictReactDOMDefsProps
) = createStrictSvg<SVGDefsElement, StrictReactDOMDefsProps>('defs');

/**
 * "ellipse"
 */
export const ellipse: component(
  ref?: React.RefSetter<SVGEllipseElement>,
  ...StrictReactDOMEllipseProps
) = createStrictSvg<SVGEllipseElement, StrictReactDOMEllipseProps>('ellipse');

/**
 * "feBlend"
 */
export const feBlend: component(
  ref?: React.RefSetter<SVGFEBlendElement>,
  ...StrictReactDOMFeBlendProps
) = createStrictSvg<SVGFEBlendElement, StrictReactDOMFeBlendProps>('feBlend');

/**
 * "feColorMatrix"
 */
export const feColorMatrix: component(
  ref?: React.RefSetter<SVGFEColorMatrixElement>,
  ...StrictReactDOMFeColorMatrixProps
) = createStrictSvg<SVGFEColorMatrixElement, StrictReactDOMFeColorMatrixProps>(
  'feColorMatrix'
);

/**
 * "feComponentTransfer"
 */
export const feComponentTransfer: component(
  ref?: React.RefSetter<SVGFEComponentTransferElement>,
  ...StrictReactDOMFeComponentTransferProps
) = createStrictSvg<
  SVGFEComponentTransferElement,
  StrictReactDOMFeComponentTransferProps
>('feComponentTransfer');

/**
 * "feFuncA"
 */
export const feFuncA: component(
  ref?: React.RefSetter<SVGFEFuncAElement>,
  ...StrictReactDOMFeFuncAProps
) = createStrictSvg<SVGFEFuncAElement, StrictReactDOMFeFuncAProps>('feFuncA');

/**
 * "feFuncB"
 */
export const feFuncB: component(
  ref?: React.RefSetter<SVGFEFuncBElement>,
  ...StrictReactDOMFeFuncBProps
) = createStrictSvg<SVGFEFuncBElement, StrictReactDOMFeFuncBProps>('feFuncB');

/**
 * "feFuncG"
 */
export const feFuncG: component(
  ref?: React.RefSetter<SVGFEFuncGElement>,
  ...StrictReactDOMFeFuncGProps
) = createStrictSvg<SVGFEFuncGElement, StrictReactDOMFeFuncGProps>('feFuncG');

/**
 * "feFuncR"
 */
export const feFuncR: component(
  ref?: React.RefSetter<SVGFEFuncRElement>,
  ...StrictReactDOMFeFuncRProps
) = createStrictSvg<SVGFEFuncRElement, StrictReactDOMFeFuncRProps>('feFuncR');

/**
 * "feComposite"
 */
export const feComposite: component(
  ref?: React.RefSetter<SVGFECompositeElement>,
  ...StrictReactDOMFeCompositeProps
) = createStrictSvg<SVGFECompositeElement, StrictReactDOMFeCompositeProps>(
  'feComposite'
);

/**
 * "feConvolveMatrix"
 */
export const feConvolveMatrix: component(
  ref?: React.RefSetter<SVGFEComponentTransferElement>,
  ...StrictReactDOMFeConvolveMatrixProps
) = createStrictSvg<
  SVGFEConvolveMatrixElement,
  StrictReactDOMFeConvolveMatrixProps
>('feConvolveMatrix');

/**
 * "feDiffuseLighting"
 */
export const feDiffuseLighting: component(
  ref?: React.RefSetter<SVGFEDiffuseLightingElement>,
  ...StrictReactDOMFeDiffuseLightingProps
) = createStrictSvg<
  SVGFEDiffuseLightingElement,
  StrictReactDOMFeDiffuseLightingProps
>('feDiffuseLighting');

/**
 * "feDisplacementMap"
 */
export const feDisplacementMap: component(
  ref?: React.RefSetter<SVGFEDisplacementMapElement>,
  ...StrictReactDOMFeDisplacementMapProps
) = createStrictSvg<
  SVGFEDisplacementMapElement,
  StrictReactDOMFeDisplacementMapProps
>('feDisplacementMap');

/**
 * "feDistantLight"
 */
export const feDistantLight: component(
  ref?: React.RefSetter<SVGFEDistantLightElement>,
  ...StrictReactDOMFeDistantLightProps
) = createStrictSvg<
  SVGFEDistantLightElement,
  StrictReactDOMFeDistantLightProps
>('feDistantLight');

/**
 * "feDropShadow"
 */
export const feDropShadow: component(
  ref?: React.RefSetter<SVGFEDropShadowElement>,
  ...StrictReactDOMFeDropShadowProps
) = createStrictSvg<SVGFEDropShadowElement, StrictReactDOMFeDropShadowProps>(
  'feDropShadow'
);

/**
 * "feFlood"
 */
export const feFlood: component(
  ref?: React.RefSetter<SVGFEFloodElement>,
  ...StrictReactDOMFeFloodProps
) = createStrictSvg<SVGFEFloodElement, StrictReactDOMFeFloodProps>('feFlood');

/**
 * "feGaussianBlur"
 */
export const feGaussianBlur: component(
  ref?: React.RefSetter<SVGFEGaussianBlurElement>,
  ...StrictReactDOMFeGaussianBlurProps
) = createStrictSvg<
  SVGFEGaussianBlurElement,
  StrictReactDOMFeGaussianBlurProps
>('feGaussianBlur');

/**
 * "feImage"
 */
export const feImage: component(
  ref?: React.RefSetter<SVGFEImageElement>,
  ...StrictReactDOMFeImageProps
) = createStrictSvg<SVGFEImageElement, StrictReactDOMFeImageProps>('feImage');

/**
 * "feMerge"
 */
export const feMerge: component(
  ref?: React.RefSetter<SVGFEMergeElement>,
  ...StrictReactDOMFeMergeProps
) = createStrictSvg<SVGFEMergeElement, StrictReactDOMFeMergeProps>('feMerge');

/**
 * "feMergeNode"
 */
export const feMergeNode: component(
  ref?: React.RefSetter<SVGFEMergeNodeElement>,
  ...StrictReactDOMFeMergeNodeProps
) = createStrictSvg<SVGFEMergeNodeElement, StrictReactDOMFeMergeNodeProps>(
  'feMergeNode'
);

/**
 * "feMorphology"
 */
export const feMorphology: component(
  ref?: React.RefSetter<SVGFEMorphologyElement>,
  ...StrictReactDOMFeMorphologyProps
) = createStrictSvg<SVGFEMorphologyElement, StrictReactDOMFeMorphologyProps>(
  'feMorphology'
);

/**
 * "feOffset"
 */
export const feOffset: component(
  ref?: React.RefSetter<SVGFEOffsetElement>,
  ...StrictReactDOMFeOffsetProps
) = createStrictSvg<SVGFEOffsetElement, StrictReactDOMFeOffsetProps>(
  'feOffset'
);

/**
 * "fePointLight"
 */
export const fePointLight: component(
  ref?: React.RefSetter<SVGFEPointLightElement>,
  ...StrictReactDOMFePointLightProps
) = createStrictSvg<SVGFEPointLightElement, StrictReactDOMFePointLightProps>(
  'fePointLight'
);

/**
 * "feSpecularLighting"
 */
export const feSpecularLighting: component(
  ref?: React.RefSetter<SVGFESpecularLightingElement>,
  ...StrictReactDOMFeSpecularLightingProps
) = createStrictSvg<
  SVGFESpecularLightingElement,
  StrictReactDOMFeSpecularLightingProps
>('feSpecularLighting');

/**
 * "feSpotLight"
 */
export const feSpotLight: component(
  ref?: React.RefSetter<SVGFESpotLightElement>,
  ...StrictReactDOMFeSpotLightProps
) = createStrictSvg<SVGFESpotLightElement, StrictReactDOMFeSpotLightProps>(
  'feSpotLight'
);

/**
 * "feTile"
 */
export const feTile: component(
  ref?: React.RefSetter<SVGFETileElement>,
  ...StrictReactDOMFeTileProps
) = createStrictSvg<SVGFETileElement, StrictReactDOMFeTileProps>('feTile');

/**
 * "feTurbulence"
 */
export const feTurbulence: component(
  ref?: React.RefSetter<SVGFETurbulenceElement>,
  ...StrictReactDOMFeTurbulenceProps
) = createStrictSvg<SVGFETurbulenceElement, StrictReactDOMFeTurbulenceProps>(
  'feTurbulence'
);

/**
 * "filter"
 */
export const filter: component(
  ref?: React.RefSetter<SVGFilterElement>,
  ...StrictReactDOMFilterProps
) = createStrictSvg<SVGFilterElement, StrictReactDOMFilterProps>('filter');

/**
 * "foreignObject"
 */
export const foreignObject: component(
  ref?: React.RefSetter<SVGForeignObjectElement>,
  ...StrictReactDOMForeignObjectProps
) = createStrictSvg<SVGForeignObjectElement, StrictReactDOMForeignObjectProps>(
  'foreignObject'
);

/**
 * "g"
 */
export const g: component(
  ref?: React.RefSetter<SVGGElement>,
  ...StrictReactDOMGProps
) = createStrictSvg<SVGGElement, StrictReactDOMGProps>('g');

/**
 * "image"
 */
export const image: component(
  ref?: React.RefSetter<SVGImageElement>,
  ...StrictReactDOMImageProps
) = createStrictSvg<SVGImageElement, StrictReactDOMImageProps>('image');

/**
 * "line"
 */
export const line: component(
  ref?: React.RefSetter<SVGLineElement>,
  ...StrictReactDOMLineProps
) = createStrictSvg<SVGLineElement, StrictReactDOMLineProps>('line');

/**
 * "linearGradient"
 */
export const linearGradient: component(
  ref?: React.RefSetter<SVGLinearGradientElement>,
  ...StrictReactDOMLinearGradientProps
) = createStrictSvg<
  SVGLinearGradientElement,
  StrictReactDOMLinearGradientProps
>('linearGradient');

/**
 * "marker"
 */
export const marker: component(
  ref?: React.RefSetter<SVGMarkerElement>,
  ...StrictReactDOMMarkerProps
) = createStrictSvg<SVGMarkerElement, StrictReactDOMMarkerProps>('marker');

/**
 * "mask"
 */
export const mask: component(
  ref?: React.RefSetter<SVGMaskElement>,
  ...StrictReactDOMMaskProps
) = createStrictSvg<SVGMaskElement, StrictReactDOMMaskProps>('mask');

/**
 * "path"
 */
export const path: component(
  ref?: React.RefSetter<SVGPathElement>,
  ...StrictReactDOMPathProps
) = createStrictSvg<SVGPathElement, StrictReactDOMPathProps>('path');

/**
 * "pattern"
 */
export const pattern: component(
  ref?: React.RefSetter<SVGPatternElement>,
  ...StrictReactDOMPatternProps
) = createStrictSvg<SVGPatternElement, StrictReactDOMPatternProps>('pattern');

/**
 * "polygon"
 */
export const polygon: component(
  ref?: React.RefSetter<SVGPolygonElement>,
  ...StrictReactDOMPolygonProps
) = createStrictSvg<SVGPolygonElement, StrictReactDOMPolygonProps>('polygon');

/**
 * "polyline"
 */
export const polyline: component(
  ref?: React.RefSetter<SVGPolylineElement>,
  ...StrictReactDOMPolylineProps
) = createStrictSvg<SVGPolylineElement, StrictReactDOMPolylineProps>(
  'polyline'
);

/**
 * "radialGradient"
 */
export const radialGradient: component(
  ref?: React.RefSetter<SVGRadialGradientElement>,
  ...StrictReactDOMRadialGradientProps
) = createStrictSvg<
  SVGRadialGradientElement,
  StrictReactDOMRadialGradientProps
>('radialGradient');

/**
 * "rect"
 */
export const rect: component(
  ref?: React.RefSetter<SVGRectElement>,
  ...StrictReactDOMRectProps
) = createStrictSvg<SVGRectElement, StrictReactDOMRectProps>('rect');

/**
 * "stop"
 */
export const stop: component(
  ref?: React.RefSetter<SVGStopElement>,
  ...StrictReactDOMStopProps
) = createStrictSvg<SVGStopElement, StrictReactDOMStopProps>('stop');

/**
 * "svg" (inline)
 */
export const svg: component(
  ref?: React.RefSetter<SVGSVGElement>,
  ...StrictReactDOMSvgProps
) = createStrictSvg<SVGSVGElement, StrictReactDOMSvgProps>(
  'svg',
  defaultStyles.svg
);

/**
 * "symbol"
 */
export const symbol: component(
  ref?: React.RefSetter<SVGSymbolElement>,
  ...StrictReactDOMSymbolProps
) = createStrictSvg<SVGSymbolElement, StrictReactDOMSymbolProps>('symbol');

/**
 * "tspan"
 */
export const tspan: component(
  ref?: React.RefSetter<SVGTSpanElement>,
  ...StrictReactDOMTSpanProps
) = createStrictSvg<SVGTSpanElement, StrictReactDOMTSpanProps>('tSpan');

/**
 * "text"
 */
export const text: component(
  ref?: React.RefSetter<SVGTextElement>,
  ...StrictReactDOMTextProps
) = createStrictSvg<SVGTextElement, StrictReactDOMTextProps>('text');

/**
 * "textPath"
 */
export const textPath: component(
  ref?: React.RefSetter<SVGTextPathElement>,
  ...StrictReactDOMTextPathProps
) = createStrictSvg<SVGTextPathElement, StrictReactDOMTextPathProps>(
  'textPath'
);

/**
 * "use"
 */
export const use: component(
  ref?: React.RefSetter<SVGUseElement>,
  ...StrictReactDOMUseProps
) = createStrictSvg<SVGUseElement, StrictReactDOMUseProps>('use');
