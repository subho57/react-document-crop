import React, { useCallback } from 'react';
import type { DraggableEventHandler } from 'react-draggable';
import Draggable from 'react-draggable';

import type { CropPoints, Point } from '../types';

const buildCropPointStyle = (size: number, pointBgColor: string, pointBorder: string) => ({
  width: size,
  height: size,
  backgroundColor: pointBgColor,
  border: pointBorder,
  borderRadius: '100%',
  position: 'absolute' as const,
  zIndex: 1001,
});

const CropPoint = ({
  cropPoints,
  pointArea,
  defaultPosition,
  pointSize,
  pointBgColor = 'transparent',
  pointBorder = '4px solid #3cabe2',
  onStop: externalOnStop,
  onDrag: externalOnDrag,
  bounds,
}: {
  cropPoints: CropPoints;
  pointArea: keyof CropPoints;
  defaultPosition: Point;
  pointSize: number;
  pointBgColor?: string;
  pointBorder?: string;
  onStop: (position: Point, area: keyof CropPoints, cropPoints: CropPoints) => void;
  onDrag: (position: Point, area: keyof CropPoints) => void;
  bounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}) => {
  const onDrag: DraggableEventHandler = useCallback(
    (_, position) => {
      externalOnDrag(
        {
          ...position,
          x: position.x + pointSize / 2,
          y: position.y + pointSize / 2,
        },
        pointArea
      );
    },
    [externalOnDrag]
  );

  const onStop: DraggableEventHandler = useCallback(
    (_, position) => {
      externalOnStop(
        {
          ...position,
          x: position.x + pointSize / 2,
          y: position.y + pointSize / 2,
        },
        pointArea,
        cropPoints
      );
    },
    [externalOnDrag, cropPoints]
  );

  return (
    <Draggable
      bounds={bounds}
      defaultPosition={defaultPosition}
      position={{
        x: cropPoints[pointArea].x - pointSize / 2,
        y: cropPoints[pointArea].y - pointSize / 2,
      }}
      onDrag={onDrag}
      onStop={onStop}
    >
      <div style={buildCropPointStyle(pointSize, pointBgColor, pointBorder)} />
    </Draggable>
  );
};

export default CropPoint;
