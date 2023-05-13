import React, { useCallback, useRef, useState } from 'react';
import { Button, Spin, Upload } from 'antd';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  DownloadOutlined,
  PlusOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import Cropper from 'react-document-crop';
import './App.css';
import Header from './components/Header';

const { Dragger } = Upload;
const App = () => {
  const [cropState, setCropState] = useState();
  const [img, setImg] = useState();
  const [croppedImg, setCroppedImg] = useState();
  const cropperRef = useRef();

  const onDragStop = useCallback((s) => setCropState(s), []);
  const onChange = useCallback((s) => setCropState(s), []);

  const doSomething = async () => {
    console.log('CropState', cropState);
    try {
      const res = await cropperRef.current.done({
        preview: true,
      });
      setCroppedImg(res);
      console.log('Cropped and filtered image', res);
    } catch (e) {
      console.log('error', e);
    }
  };

  const onImgSelection = async (e) => {
    if (e.fileList && e.fileList.length > 0) {
      // it can also be a http or base64 string for example
      setImg(e.fileList[0].originFileObj);
    }
  };

  const draggerProps = {
    name: 'file',
    multiple: false,
    onChange: onImgSelection,
    accept: 'image/*',
  };

  return (
    <div className="root-container">
      <Header />
      <div className="content-container">
        {img && cropState?.loading === false && (
          <div className="buttons-container">
            {croppedImg ? (
              <>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => {
                    cropperRef.current.backToCrop();
                    setCroppedImg(undefined);
                  }}
                >
                  Back
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = img.name;
                    link.href = URL.createObjectURL(croppedImg);
                    link.click();
                  }}
                >
                  Download
                </Button>
              </>
            ) : (
              <>
                <Button onClick={doSomething} icon={<CheckOutlined />}>
                  Done
                </Button>
                <Button
                  icon={<RotateLeftOutlined />}
                  onClick={() => {
                    cropperRef.current.rotate(270);
                  }}
                >
                  Rotate CCW
                </Button>
                <Button
                  icon={<RotateRightOutlined />}
                  onClick={() => {
                    cropperRef.current.rotate(90);
                  }}
                >
                  Rotate CW
                </Button>
                <Button
                  onClick={() => {
                    cropperRef.current.mirror(true);
                  }}
                >
                  Flip Horizontal
                </Button>
                <Button
                  onClick={() => {
                    cropperRef.current.mirror();
                  }}
                >
                  Flip Vertical
                </Button>
              </>
            )}
            <Button
              icon={<SyncOutlined />}
              onClick={() => {
                setImg(undefined);
                setCroppedImg(undefined);
                setCropState();
              }}
            >
              Reset
            </Button>
          </div>
        )}
        {img && (
          <Cropper
            // openCvPath="./opencv/opencv.js"
            ref={cropperRef}
            image={img}
            onChange={onChange}
            onDragStop={onDragStop}
            maxWidth={window.innerWidth - 10}
          />
        )}
        {cropState?.loading && <Spin />}
        {!img && (
          <Dragger {...draggerProps}>
            <p>
              <PlusOutlined />
            </p>
            <p>Upload</p>
          </Dragger>
        )}
      </div>
    </div>
  );
};

export default App;
