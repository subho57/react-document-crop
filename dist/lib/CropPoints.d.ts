import React from 'react';
import type * as Types from '../types';
interface ICropPointsProps {
    pointSize: number;
    pointBgColor?: string;
    pointBorder?: string;
    cropPoints: Types.CropPoints;
    previewDims: Types.PreviewDimensions;
    onDrag: (position: Types.Point, area: keyof Types.CropPoints, cropPoints: Types.CropPoints) => void;
    onStop: (position: Types.Point, area: keyof Types.CropPoints, cropPoints: Types.CropPoints) => void;
    bounds: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
}
declare const CropPoints: React.FC<ICropPointsProps>;
export default CropPoints;
