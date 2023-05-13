/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-param-reassign */
import type { Mat, Rect } from 'opencv-react-ts';
import { useOpenCv } from 'opencv-react-ts';
import React, { Fragment, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import type * as Types from '../types';
import CropPoints from './CropPoints';
import CropPointsDelimiters from './CropPointsDelimiters';
import { applyFilter, mirror, rotate, transform } from './imgManipulation';
import { calcDims, calculateMidpoint, isCrossOriginURL, readFile } from './utils';

const buildImgContainerStyle = (previewDims: Types.PreviewDimensions) => ({
  width: previewDims.width,
  height: previewDims.height,
});

let imageResizeRatio = 0;

export interface ICropperRef {
  image: File | string;
  onDragStop?: (s: Types.CropperState) => void;
  onChange?: (s: Types.CropperState) => void;
  cropperRef?: React.ForwardedRef<Types.CropperRef>;
  pointSize?: number;
  lineWidth?: number;
  pointBgColor?: string;
  pointBorder?: string;
  lineColor?: string;
  maxWidth?: number;
  maxHeight?: number;
  displayGrid?: boolean;
  openCvPath?: string;
  magnification?: number;
}

const Canvas: React.FC<ICropperRef> = ({
  image,
  onDragStop,
  onChange,
  cropperRef,
  maxWidth,
  maxHeight,
  lineWidth = 3,
  pointSize = 30,
  magnification = 3,
  displayGrid = true,
  lineColor = '#3cabe2',
  pointBgColor = 'transparent',
  pointBorder = '4px solid #3cabe2',
}) => {
  const { loaded: cvLoaded, cv } = useOpenCv();
  const canvasRef = useRef<HTMLCanvasElement>();
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null);
  const [previewDims, setPreviewDims] = useState<Types.PreviewDimensions>();
  const [cropPoints, setCropPoints] = useState<Types.CropPoints>();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'crop' | 'preview'>('crop');

  const setPreviewPaneDimensions = () => {
    if (!canvasRef.current) return;
    // set preview pane dimensions
    const newPreviewDims = calcDims(canvasRef.current.width, canvasRef.current.height, maxWidth, maxHeight);
    setPreviewDims(newPreviewDims);

    if (!previewCanvasRef.current) return;
    previewCanvasRef.current.width = newPreviewDims.width;
    previewCanvasRef.current.height = newPreviewDims.height;

    imageResizeRatio = newPreviewDims.width / canvasRef.current.width;
  };

  const showPreview = (imageMat?: Mat) => {
    if (!cv || !canvasRef.current || !previewCanvasRef.current) return;
    const src = imageMat || cv.imread(canvasRef.current);
    const dst = new cv.Mat();
    const dsize = new cv.Size(0, 0);
    cv.resize(src, dst, dsize, imageResizeRatio, imageResizeRatio, cv.INTER_AREA);
    cv.imshow(previewCanvasRef.current, dst);
    src.delete();
    dst.delete();
  };

  const detectContours = () => {
    if (!cv || !canvasRef.current) return;
    const dst = cv.imread(canvasRef.current);
    const ksize = new cv.Size(5, 5);
    // convert the image to grayscale, blur it, and find edges in the image
    cv.cvtColor(dst, dst, cv.COLOR_RGBA2GRAY, 0);
    cv.GaussianBlur(dst, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
    cv.Canny(dst, dst, 75, 200);
    // find contours
    cv.threshold(dst, dst, 120, 200, cv.THRESH_BINARY);
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    const rect = cv.boundingRect(dst);
    dst.delete();
    hierarchy.delete();
    contours.delete();
    // transform the rectangle into a set of points
    Object.keys(rect).forEach((key) => {
      rect[key as keyof Rect] *= imageResizeRatio;
    });

    const contourCoordinates = {
      top: { x: rect.x + rect.width / 2, y: rect.y },
      bottom: { x: rect.x + rect.width / 2, y: rect.y + rect.height },
      left: { x: rect.x, y: rect.y + rect.height / 2 },
      right: { x: rect.x + rect.width, y: rect.y + rect.height / 2 },
      'left-top': { x: rect.x, y: rect.y },
      'right-top': { x: rect.x + rect.width, y: rect.y },
      'right-bottom': {
        x: rect.x + rect.width,
        y: rect.y + rect.height,
      },
      'left-bottom': { x: rect.x, y: rect.y + rect.height },
    };

    setCropPoints(contourCoordinates);
  };

  useImperativeHandle(cropperRef, () => ({
    backToCrop: () => {
      setMode('crop');
    },
    mirror: (horizontal: boolean) => {
      if (!cv || !canvasRef.current) return;
      mirror(cv, canvasRef.current, horizontal);
      setPreviewPaneDimensions();
      showPreview();
      detectContours();
    },
    rotate: (angle: 90 | 180 | 270) => {
      if (!cv || !canvasRef.current) return;
      rotate(cv, canvasRef.current, angle);
      setPreviewPaneDimensions();
      showPreview();
      detectContours();
    },
    done: async (opts = {}) => {
      return new Promise<Blob>((resolve, reject) => {
        setLoading(true);
        if (!cv || !canvasRef.current || !cropPoints) {
          reject(new Error('OpenCV not loaded or canvas not initialized'));
          return;
        }

        transform(cv, canvasRef.current, cropPoints, imageResizeRatio, setPreviewPaneDimensions);
        applyFilter(cv, canvasRef.current, opts.filterCvParams);
        if (opts.preview) {
          setMode('preview');
        }
        canvasRef.current.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
            } else {
              resolve(blob);
            }
            setLoading(false);
          },
          image instanceof File ? image.type : 'image/png'
        );
      });
    },
  }));

  useEffect(() => {
    if (mode === 'preview') {
      showPreview();
    }
  }, [mode]);

  const createCanvas = async (src: string) => {
    return new Promise<void>((resolve) => {
      const img = document.createElement('img');
      img.onload = async () => {
        // set edited image canvas and dimensions
        canvasRef.current = document.createElement('canvas');
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        const ctx = canvasRef.current.getContext('2d', { alpha: true, willReadFrequently: true }) as CanvasRenderingContext2D;
        ctx?.drawImage(img, 0, 0);
        setPreviewPaneDimensions();
        resolve();
      };
      if (isCrossOriginURL(src)) img.crossOrigin = 'anonymous';
      img.src = src;
    });
  };

  const clearMagnifier = () => {
    if (!magnifierCanvasRef.current) return;
    const magnCtx = magnifierCanvasRef.current.getContext('2d', { alpha: true, willReadFrequently: true }) as CanvasRenderingContext2D;
    magnCtx?.clearRect(0, 0, magnifierCanvasRef.current.width, magnifierCanvasRef.current.height);
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onChange?.({ ...cropPoints!, loading });
  }, [cropPoints, loading]);

  useEffect(() => {
    const bootstrap = async () => {
      const src = await readFile(image);
      if (!src) return;
      await createCanvas(src);
      showPreview();
      detectContours();
      setLoading(false);
    };

    if (image && previewCanvasRef.current && cvLoaded && mode === 'crop') {
      bootstrap();
    } else {
      setLoading(true);
    }
  }, [image, previewCanvasRef.current, cvLoaded, mode]);

  const updateCropPoints = (position: Types.Point, area: keyof Types.CropPoints, cp: Types.CropPoints) => {
    const { x, y } = position;

    if (area.includes('-')) {
      cp[area] = { x, y };
      if (area.includes('left')) {
        cp.left = calculateMidpoint(cp['left-top'], cp['left-bottom']);
      }
      if (area.includes('right')) {
        cp.right = calculateMidpoint(cp['right-top'], cp['right-bottom']);
      }
      if (area.includes('top')) {
        cp.top = calculateMidpoint(cp['left-top'], cp['right-top']);
      }
      if (area.includes('bottom')) {
        cp.bottom = calculateMidpoint(cp['left-bottom'], cp['right-bottom']);
      }
    } else {
      const dx = x - cp[area].x;
      const dy = y - cp[area].y;
      if (area === 'left') {
        cp['left-top'] = { x, y: cp['left-top'].y + dy };
        cp['left-bottom'] = { x, y: cp['left-bottom'].y + dy };
        cp.left = calculateMidpoint(cp['left-top'], cp['left-bottom']);
        cp.top = calculateMidpoint(cp['left-top'], cp['right-top']);
        cp.bottom = calculateMidpoint(cp['left-bottom'], cp['right-bottom']);
      } else if (area === 'right') {
        cp['right-top'] = { x, y: cp['right-top'].y + dy };
        cp['right-bottom'] = { x, y: cp['right-bottom'].y + dy };
        cp.right = calculateMidpoint(cp['right-top'], cp['right-bottom']);
        cp.top = calculateMidpoint(cp['left-top'], cp['right-top']);
        cp.bottom = calculateMidpoint(cp['left-bottom'], cp['right-bottom']);
      } else if (area === 'top') {
        cp['left-top'] = { x: cp['left-top'].x + dx, y };
        cp['right-top'] = { x: cp['right-top'].x + dx, y };
        cp.top = calculateMidpoint(cp['left-top'], cp['right-top']);
        cp.left = calculateMidpoint(cp['left-top'], cp['left-bottom']);
        cp.right = calculateMidpoint(cp['right-top'], cp['right-bottom']);
      } else if (area === 'bottom') {
        cp['left-bottom'] = { x: cp['left-bottom'].x + dx, y };
        cp['right-bottom'] = { x: cp['right-bottom'].x + dx, y };
        cp.bottom = calculateMidpoint(cp['left-bottom'], cp['right-bottom']);
        cp.left = calculateMidpoint(cp['left-top'], cp['left-bottom']);
        cp.right = calculateMidpoint(cp['right-top'], cp['right-bottom']);
      }
    }
    setCropPoints((prev) => ({ ...prev, ...cp } as Types.CropPoints));
  };

  const onDrag = useCallback((position: Types.Point, area: keyof Types.CropPoints, cp: Types.CropPoints) => {
    const { x, y } = position;
    clearMagnifier();

    // Display the magnifier only when the user is dragging the vertices.
    if (area.includes('-')) {
      const magnCtx = magnifierCanvasRef.current?.getContext('2d', { alpha: true, willReadFrequently: true }) as CanvasRenderingContext2D;
      if (!magnCtx) return;
      magnCtx.lineWidth = lineWidth * 1.5;
      magnCtx.strokeStyle = lineColor;

      if (!previewCanvasRef.current) return;
      const pointRadius = pointSize / 2;

      magnCtx.save();
      magnCtx.beginPath();
      magnCtx.arc(x, y, pointRadius * magnification, 0, 2 * Math.PI);
      magnCtx.closePath();
      magnCtx.stroke();
      magnCtx.clip();

      magnCtx.drawImage(
        previewCanvasRef.current,
        x - pointRadius,
        y - pointRadius,
        pointSize,
        pointSize,
        x - pointRadius * magnification,
        y - pointRadius * magnification,
        pointSize * magnification,
        pointSize * magnification
      );

      magnCtx.beginPath();
      magnCtx.arc(0, 0, pointRadius * magnification, 0, Math.PI * 2, true);
      magnCtx.clip();
      magnCtx.closePath();
      magnCtx.restore();

      if (displayGrid) {
        magnCtx.beginPath();
        magnCtx.lineWidth = lineWidth;
        magnCtx.moveTo(x - pointRadius * magnification, y);
        magnCtx.lineTo(x + pointRadius * magnification, y);
        magnCtx.moveTo(x, y - pointRadius * magnification);
        magnCtx.lineTo(x, y + pointRadius * magnification);
        magnCtx.closePath();
        magnCtx.stroke();
      }
    }
    updateCropPoints(position, area, cp);
  }, []);

  const onStop = useCallback((position: Types.Point, area: keyof Types.CropPoints, cp: Types.CropPoints) => {
    const { x, y } = position;
    clearMagnifier();
    updateCropPoints(position, area, cp);
    onDragStop?.({ ...cp, [area]: { x, y } });
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        ...(previewDims && buildImgContainerStyle(previewDims)),
      }}
    >
      {previewDims && mode === 'crop' && cropPoints && previewCanvasRef.current && (
        <Fragment>
          <CropPoints
            pointSize={pointSize}
            pointBgColor={pointBgColor}
            pointBorder={pointBorder}
            cropPoints={cropPoints}
            previewDims={previewDims}
            onDrag={onDrag}
            onStop={onStop}
            bounds={{
              left: previewCanvasRef.current.offsetLeft - pointSize / 2,
              top: previewCanvasRef.current.offsetTop - pointSize / 2,
              right: previewCanvasRef.current.offsetLeft - pointSize / 2 + previewCanvasRef.current.offsetWidth,
              bottom: previewCanvasRef.current.offsetTop - pointSize / 2 + previewCanvasRef.current.offsetHeight,
            }}
          />
          <CropPointsDelimiters
            displayGrid={displayGrid}
            previewDims={previewDims}
            cropPoints={cropPoints}
            lineWidth={lineWidth}
            lineColor={lineColor}
            pointSize={pointSize}
          />
          <canvas
            style={{
              position: 'absolute',
              zIndex: 1002,
              pointerEvents: 'none',
            }}
            width={previewDims.width}
            height={previewDims.height}
            ref={magnifierCanvasRef}
          />
        </Fragment>
      )}

      <canvas style={{ zIndex: 5, pointerEvents: 'none' }} ref={previewCanvasRef} />
    </div>
  );
};

export default Canvas;
