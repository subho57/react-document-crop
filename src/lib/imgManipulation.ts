/* eslint-disable no-param-reassign */
import type { CV } from 'opencv-react';

import type { CropPoints, OpenCVFilterProps } from '../types';

export const transform = (
  cv: CV,
  docCanvas: HTMLCanvasElement,
  cropPoints: CropPoints,
  imageResizeRatio: number,
  setPreviewPaneDimensions: () => void
) => {
  const dst = cv.imread(docCanvas);

  const bR = cropPoints['right-bottom'];
  const bL = cropPoints['left-bottom'];
  const tR = cropPoints['right-top'];
  const tL = cropPoints['left-top'];

  // create source coordinates matrix
  const sourceCoordinates = [tL, tR, bR, bL].map((point) => [point.x / imageResizeRatio, point.y / imageResizeRatio]);

  // get max width
  const maxWidth = Math.max(bR.x - bL.x, tR.x - tL.x) / imageResizeRatio;
  // get max height
  const maxHeight = Math.max(bL.y - tL.y, bR.y - tR.y) / imageResizeRatio;

  // create dest coordinates matrix
  const destCoordinates = [
    [0, 0],
    [maxWidth - 1, 0],
    [maxWidth - 1, maxHeight - 1],
    [0, maxHeight - 1],
  ];

  // convert to open cv matrix objects
  const Ms = cv.matFromArray(4, 1, cv.CV_32FC2, ([] as number[]).concat(...sourceCoordinates));
  const Md = cv.matFromArray(4, 1, cv.CV_32FC2, ([] as number[]).concat(...destCoordinates));
  const transformMatrix = cv.getPerspectiveTransform(Ms, Md);
  // set new image size
  const dsize = new cv.Size(maxWidth, maxHeight);
  // perform warp
  cv.warpPerspective(dst, dst, transformMatrix, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
  cv.imshow(docCanvas, dst);

  dst.delete();
  Ms.delete();
  Md.delete();
  transformMatrix.delete();

  setPreviewPaneDimensions();
};

export const applyFilter = (cv: CV, docCanvas: HTMLCanvasElement, filterCvParams?: Partial<OpenCVFilterProps>) => {
  // default options
  const options = {
    blur: false,
    th: false,
    thMode: cv.ADAPTIVE_THRESH_MEAN_C,
    thMeanCorrection: 15,
    thBlockSize: 25,
    thMax: 255,
    grayScale: false,
    ...filterCvParams,
  };
  const dst = cv.imread(docCanvas);

  if (options.grayScale) {
    cv.cvtColor(dst, dst, cv.COLOR_RGBA2GRAY, 0);
  }
  if (options.blur) {
    const ksize = new cv.Size(5, 5);
    cv.GaussianBlur(dst, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
  }
  if (options.th) {
    if (options.grayScale) {
      cv.adaptiveThreshold(dst, dst, options.thMax, options.thMode, cv.THRESH_BINARY, options.thBlockSize, options.thMeanCorrection);
    } else {
      dst.convertTo(dst, -1, 1, 60);
      cv.threshold(dst, dst, 170, 255, cv.THRESH_BINARY);
    }
  }
  cv.imshow(docCanvas, dst);
  dst.delete();
};

export const rotate = (cv: CV, docCanvas: HTMLCanvasElement, angle: 90 | 180 | 270) => {
  const dst = cv.imread(docCanvas);
  const ROT_LABELS = {
    90: cv.ROTATE_90_CLOCKWISE,
    180: cv.ROTATE_180,
    270: cv.ROTATE_90_COUNTERCLOCKWISE,
  };
  if (ROT_LABELS[angle] !== undefined) {
    cv.rotate(dst, dst, ROT_LABELS[angle]);
    if (angle === 90 || angle === 270) {
      const { width, height } = docCanvas;
      docCanvas.width = height;
      docCanvas.height = width;
    }
  }
  cv.imshow(docCanvas, dst);
  dst.delete();
};

export const mirror = (cv: CV, docCanvas: HTMLCanvasElement, horizontal: boolean) => {
  const dst = cv.imread(docCanvas);
  const flipCode = horizontal ? 1 : 0;
  cv.flip(dst, dst, flipCode);
  cv.imshow(docCanvas, dst);
  dst.delete();
};
