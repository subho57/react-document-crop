/* eslint-disable no-param-reassign */
import type { Rect } from 'opencv-react';
import { useOpenCv } from 'opencv-react';
import React, { Fragment, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import type * as Types from '../types';
import CropPoints from './CropPoints';
import CropPointsDelimiters from './CropPointsDelimiters';
import { applyFilter, transform } from './imgManipulation';
import { calcDims, isCrossOriginURL, readFile } from './utils';

const buildImgContainerStyle = (previewDims: Types.PreviewDimensions) => ({
  width: previewDims.width,
  height: previewDims.height,
});

let imageResizeRatio = 1;

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
  openCvPath?: string;
}

const Canvas: React.FC<ICropperRef> = ({
  image,
  onDragStop,
  onChange,
  cropperRef,
  pointSize = 30,
  lineWidth,
  pointBgColor,
  pointBorder,
  lineColor,
  maxWidth,
  maxHeight,
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

  useImperativeHandle(cropperRef, () => ({
    backToCrop: () => {
      setMode('crop');
    },
    done: async (opts = {}) => {
      return new Promise((resolve, reject) => {
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

  const showPreview = () => {
    if (!cv || !canvasRef.current || !previewCanvasRef.current) return;
    const src = cv.imread(canvasRef.current);
    const dst = new cv.Mat();
    const dsize = new cv.Size(0, 0);
    cv.resize(src, dst, dsize, imageResizeRatio, imageResizeRatio, cv.INTER_AREA);
    cv.imshow(previewCanvasRef.current, dst);
    src.delete();
    dst.delete();
  };

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

  const clearMagnifier = () => {
    if (!magnifierCanvasRef.current) return;
    const magnCtx = magnifierCanvasRef.current.getContext('2d', { alpha: true, willReadFrequently: true }) as CanvasRenderingContext2D;
    magnCtx?.clearRect(0, 0, magnifierCanvasRef.current.width, magnifierCanvasRef.current.height);
  };

  useEffect(() => {
    if (onChange) {
      onChange({ ...cropPoints, loading });
    }
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

  const onDrag = useCallback((position: Types.Point, area: keyof Types.CropPoints) => {
    const { x, y } = position;

    const magnCtx = magnifierCanvasRef.current?.getContext('2d', { alpha: true, willReadFrequently: true }) as CanvasRenderingContext2D;
    clearMagnifier();

    if (!previewCanvasRef.current) return;

    // TODO we should make those 5, 10 and 20 values proportionate
    // to the point size
    magnCtx?.drawImage(
      previewCanvasRef.current,
      x - (pointSize - 10),
      y - (pointSize - 10),
      pointSize + 5,
      pointSize + 5,
      x + 10,
      y - 90,
      pointSize + 20,
      pointSize + 20
    );

    setCropPoints((cPs) => ({ ...cPs, [area]: { x, y } } as Types.CropPoints));
  }, []);

  const onStop = useCallback((position: Types.Point, area: keyof Types.CropPoints, cp: Types.CropPoints) => {
    const { x, y } = position;
    clearMagnifier();
    setCropPoints((cPs) => ({ ...cPs, [area]: { x, y } } as Types.CropPoints));
    if (onDragStop) {
      onDragStop({ ...cp, [area]: { x, y } });
    }
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
            previewDims={previewDims}
            cropPoints={cropPoints}
            lineWidth={lineWidth}
            lineColor={lineColor}
            pointSize={pointSize}
          />
          <canvas
            style={{
              position: 'absolute',
              zIndex: 5,
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
