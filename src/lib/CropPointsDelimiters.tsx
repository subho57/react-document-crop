import React, { useCallback, useEffect, useRef } from 'react';

import type { CropPoints, PreviewDimensions } from '../types';

const CropPointsDelimiters = ({
  cropPoints,
  previewDims,
  lineWidth = 3,
  lineColor = '#3cabe2',
  pointSize,
  displayGrid = true,
}: {
  cropPoints: CropPoints;
  previewDims: PreviewDimensions;
  lineWidth?: number;
  lineColor?: string;
  pointSize: number;
  displayGrid?: boolean;
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);

  const clearCanvas = useCallback(() => {
    const ctx = canvas.current?.getContext('2d', { alpha: true, willReadFrequently: true }) as CanvasRenderingContext2D;
    ctx?.clearRect(0, 0, previewDims.width, previewDims.height);
  }, [canvas.current, previewDims]);

  const drawShape = useCallback(() => {
    const {
      'left-top': leftTop,
      'right-top': rightTop,
      'right-bottom': rightBottom,
      'left-bottom': leftBottom,
      left,
      top,
      right,
      bottom,
    } = cropPoints;
    const ctx = canvas.current?.getContext('2d', { alpha: true, willReadFrequently: true }) as CanvasRenderingContext2D;
    if (!ctx) return;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;

    const pointRadius = pointSize / 2;

    ctx.beginPath();
    ctx.moveTo(leftTop.x + pointRadius, leftTop.y);
    ctx.lineTo(rightTop.x - pointRadius, rightTop.y);

    ctx.moveTo(rightTop.x, rightTop.y + pointRadius);
    ctx.lineTo(rightBottom.x, rightBottom.y - pointRadius);

    ctx.moveTo(rightBottom.x - pointRadius, rightBottom.y);
    ctx.lineTo(leftBottom.x + pointRadius, leftBottom.y);

    ctx.moveTo(leftBottom.x, leftBottom.y - pointRadius);
    ctx.lineTo(leftTop.x, leftTop.y + pointRadius);

    ctx.closePath();
    ctx.stroke();

    ctx.clearRect(top.x - pointRadius, top.y - pointRadius, pointSize, pointSize);
    ctx.clearRect(right.x - pointRadius, right.y - pointRadius, pointSize, pointSize);
    ctx.clearRect(bottom.x - pointRadius, bottom.y - pointRadius, pointSize, pointSize);
    ctx.clearRect(left.x - pointRadius, left.y - pointRadius, pointSize, pointSize);

    if (displayGrid) {
      ctx.lineWidth = lineWidth / 2;

      ctx.beginPath();
      ctx.moveTo(leftTop.x - pointRadius, leftTop.y);
      ctx.lineTo(leftTop.x + pointRadius, leftTop.y);
      ctx.moveTo(leftTop.x, leftTop.y + pointRadius);
      ctx.lineTo(leftTop.x, leftTop.y - pointRadius);

      ctx.moveTo(rightTop.x - pointRadius, rightTop.y);
      ctx.lineTo(rightTop.x + pointRadius, rightTop.y);
      ctx.moveTo(rightTop.x, rightTop.y + pointRadius);
      ctx.lineTo(rightTop.x, rightTop.y - pointRadius);

      ctx.moveTo(rightBottom.x - pointRadius, rightBottom.y);
      ctx.lineTo(rightBottom.x + pointRadius, rightBottom.y);
      ctx.moveTo(rightBottom.x, rightBottom.y + pointRadius);
      ctx.lineTo(rightBottom.x, rightBottom.y - pointRadius);

      ctx.moveTo(leftBottom.x - pointRadius, leftBottom.y);
      ctx.lineTo(leftBottom.x + pointRadius, leftBottom.y);
      ctx.moveTo(leftBottom.x, leftBottom.y + pointRadius);
      ctx.lineTo(leftBottom.x, leftBottom.y - pointRadius);

      ctx.closePath();
      ctx.stroke();
    }
  }, [cropPoints, canvas.current]);

  useEffect(() => {
    if (cropPoints && canvas.current) {
      clearCanvas();
      drawShape();
    }
  }, [cropPoints, canvas.current]);

  return (
    <canvas
      ref={canvas}
      style={{
        position: 'absolute',
        zIndex: 5,
      }}
      width={previewDims.width}
      height={previewDims.height}
    />
  );
};

export default CropPointsDelimiters;
