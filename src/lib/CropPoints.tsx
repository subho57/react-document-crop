import React from 'react';

import type * as Types from '../types';
import CropPoint from './CropPoint';

interface ICropPointsProps {
  pointSize: number;
  pointBgColor?: string;
  pointBorder?: string;
  cropPoints: Types.CropPoints;
  previewDims: Types.PreviewDimensions;
  onDrag: (position: Types.Point, area: keyof Types.CropPoints) => void;
  onStop: (position: Types.Point, area: keyof Types.CropPoints, cropPoints: Types.CropPoints) => void;
  bounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

const CropPoints: React.FC<ICropPointsProps> = (props) => {
  const { previewDims, ...otherProps } = props;
  return (
    <React.Fragment>
      <CropPoint pointArea="left-top" defaultPosition={{ x: 0, y: 0 }} {...otherProps} />
      <CropPoint pointArea="right-top" defaultPosition={{ x: previewDims.width, y: 0 }} {...otherProps} />
      <CropPoint pointArea="right-bottom" defaultPosition={{ x: 0, y: previewDims.height }} {...otherProps} />
      <CropPoint
        pointArea="left-bottom"
        defaultPosition={{
          x: previewDims.width,
          y: previewDims.height,
        }}
        {...otherProps}
      />
    </React.Fragment>
  );
};

export default CropPoints;
