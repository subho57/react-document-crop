import React from 'react';
import type { CropPoints, Point } from '../types';
declare const CropPoint: ({ cropPoints, pointArea, defaultPosition, pointSize, pointBgColor, pointBorder, onStop: externalOnStop, onDrag: externalOnDrag, bounds, }: {
    cropPoints: CropPoints;
    pointArea: keyof CropPoints;
    defaultPosition: Point;
    pointSize: number;
    pointBgColor: string;
    pointBorder: string;
    onStop: (position: Point, area: keyof CropPoints, cropPoints: CropPoints) => void;
    onDrag: (position: Point, area: keyof CropPoints, cropPoints: CropPoints) => void;
    bounds: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
}) => React.JSX.Element;
export default CropPoint;
