import type { CV } from 'opencv-react';
import type { CropPoints, OpenCVFilterProps } from '../types';
export declare const transform: (cv: CV, docCanvas: HTMLCanvasElement, cropPoints: CropPoints, imageResizeRatio: number, setPreviewPaneDimensions: () => void) => void;
export declare const applyFilter: (cv: CV, docCanvas: HTMLCanvasElement, filterCvParams?: Partial<OpenCVFilterProps> | undefined) => void;
export declare const rotate: (cv: CV, docCanvas: HTMLCanvasElement, angle: 90 | 180 | 270) => void;
export declare const mirror: (cv: CV, docCanvas: HTMLCanvasElement, horizontal: boolean) => void;
