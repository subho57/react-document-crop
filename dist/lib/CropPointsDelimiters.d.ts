import React from 'react';
import type { CropPoints, PreviewDimensions } from '../types';
declare const CropPointsDelimiters: ({ cropPoints, previewDims, lineWidth, lineColor, pointSize, }: {
    cropPoints: CropPoints;
    previewDims: PreviewDimensions;
    lineWidth?: number | undefined;
    lineColor?: string | undefined;
    pointSize: number;
}) => React.JSX.Element;
export default CropPointsDelimiters;
