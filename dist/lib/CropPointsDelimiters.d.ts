import React from 'react';
import type { CropPoints, PreviewDimensions } from '../types';
declare const CropPointsDelimiters: ({ cropPoints, previewDims, lineWidth, lineColor, pointSize, displayGrid, }: {
    cropPoints: CropPoints;
    previewDims: PreviewDimensions;
    lineWidth?: number | undefined;
    lineColor?: string | undefined;
    pointSize: number;
    displayGrid?: boolean | undefined;
}) => React.JSX.Element;
export default CropPointsDelimiters;
