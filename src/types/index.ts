export type Point = {
  x: number;
  y: number;
};

export type OpenCVFilterProps = {
  blur: boolean;
  th: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thMode: any;
  thMeanCorrection: number;
  thBlockSize: number;
  thMax: number;
  grayScale: boolean;
};

export type CropPoints = {
  'left-top': Point;
  'right-top': Point;
  'left-bottom': Point;
  'right-bottom': Point;
};

export type ClickCropOptions = {
  preview: boolean;
  filterCvParams: Partial<OpenCVFilterProps>;
};

export type PreviewDimensions = {
  width: number;
  height: number;
  ratio: number;
};

export type CropperState =
  | {
      loading: boolean;
    }
  | CropPoints;

export type CropperRef = {
  backToCrop: () => void;
  done: (opts?: Partial<ClickCropOptions>) => Promise<Blob>;
};
