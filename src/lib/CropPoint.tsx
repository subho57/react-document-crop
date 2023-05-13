/* eslint-disable no-nested-ternary */
import React, { useCallback } from 'react';
import type { DraggableEventHandler } from 'react-draggable';
import Draggable from 'react-draggable';

import type { CropPoints, Point } from '../types';

const buildCropPointVertexStyle = (size: number, pointBgColor: string, pointBorder: string): React.CSSProperties => ({
  width: size,
  height: size,
  backgroundColor: pointBgColor,
  border: pointBorder,
  borderRadius: '100%',
  position: 'absolute' as const,
  zIndex: 1001,
  cursor: 'pointer',
});

const buildCropPointEdgeStyle = (size: number, pointBgColor: string, pointBorder: string, flip: boolean): React.CSSProperties => ({
  width: flip ? size / 2 : size,
  height: flip ? size : size / 2,
  backgroundColor: pointBgColor,
  border: pointBorder,
  marginTop: flip ? undefined : size / 4,
  marginLeft: flip ? size / 4 : undefined,
  position: 'absolute' as const,
  zIndex: 1001,
  cursor: 'pointer',
});

const CropPoint = ({
  cropPoints,
  pointArea,
  defaultPosition,
  pointSize,
  pointBgColor,
  pointBorder,
  onStop: externalOnStop,
  onDrag: externalOnDrag,
  bounds,
}: {
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
}) => {
  const onDrag: DraggableEventHandler = useCallback(
    (_, position) => {
      externalOnDrag(
        {
          ...position,
          x: position.x + pointSize / 2,
          y: position.y + pointSize / 2,
        },
        pointArea,
        cropPoints
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
      axis={pointArea === 'top' || pointArea === 'bottom' ? 'y' : pointArea === 'left' || pointArea === 'right' ? 'x' : 'both'}
    >
      <div
        style={
          ['top', 'bottom', 'left', 'right'].includes(pointArea)
            ? buildCropPointEdgeStyle(pointSize, pointBgColor, pointBorder, pointArea === 'left' || pointArea === 'right')
            : buildCropPointVertexStyle(pointSize, pointBgColor, pointBorder)
        }
      />
    </Draggable>
  );
};

export default CropPoint;
