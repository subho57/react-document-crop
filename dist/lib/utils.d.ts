export declare const readFile: (file: File | string) => Promise<string | null>;
export declare const calcDims: (width: number, height: number, externalMaxWidth?: number | undefined, externalMaxHeight?: number | undefined) => {
    width: number;
    height: number;
    ratio: number;
};
export declare function isCrossOriginURL(url: string): boolean;
