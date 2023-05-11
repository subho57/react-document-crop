import { OpenCvProvider } from 'opencv-react';
import React from 'react';

import type { ICropperRef } from '../lib/Canvas';
import Canvas from '../lib/Canvas';
import type { CropperRef } from '../types';

// eslint-disable-next-line react/display-name
const Cropper = React.forwardRef<CropperRef, ICropperRef>((props, ref) => {
  if (!props.image) {
    return null;
  }

  return (
    <OpenCvProvider openCvPath={props.openCvPath}>
      <Canvas {...props} cropperRef={ref} />
    </OpenCvProvider>
  );
});

export default Cropper;
