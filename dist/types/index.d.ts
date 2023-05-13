export declare type Point = {
    x: number;
    y: number;
};
export declare type OpenCVFilterProps = {
    blur: boolean;
    th: boolean;
    thMode: any;
    thMeanCorrection: number;
    thBlockSize: number;
    thMax: number;
    grayScale: boolean;
};
export declare type CropPoints = {
    top: Point;
    left: Point;
    bottom: Point;
    right: Point;
    'left-top': Point;
    'right-top': Point;
    'left-bottom': Point;
    'right-bottom': Point;
};
export declare type ClickCropOptions = {
    preview: boolean;
    filterCvParams: Partial<OpenCVFilterProps>;
};
export declare type PreviewDimensions = {
    width: number;
    height: number;
    ratio: number;
};
export declare type CropperState = CropPoints & {
    loading?: boolean;
};
export declare type CropperRef = {
    backToCrop: () => void;
    mirror: (horizontal: boolean) => void;
    rotate: (angle: 90 | 180 | 270) => void;
    done: (opts?: Partial<ClickCropOptions>) => Promise<Blob>;
};
