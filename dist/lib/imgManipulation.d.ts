import type { CV } from 'opencv-react';
import type { CropPoints, OpenCVFilterProps } from '../types';
export declare const transform: (cv: CV, docCanvas: HTMLCanvasElement, cropPoints: CropPoints, imageResizeRatio: number, setPreviewPaneDimensions: () => void) => void;
export declare const applyFilter: (cv: CV, docCanvas: HTMLCanvasElement, filterCvParams?: Partial<OpenCVFilterProps> | undefined) => Promise<void>;
