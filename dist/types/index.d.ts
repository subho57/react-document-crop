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
export declare type CropperState = {
    loading: boolean;
} & CropPoints;
export declare type CropperRef = {
    backToCrop: () => void;
    done: (opts?: Partial<ClickCropOptions>) => Promise<Blob>;
};
