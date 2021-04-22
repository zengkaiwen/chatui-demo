import React, { useCallback } from 'react';
import { Icon, Bubble } from '@chatui/core';

const ImageComp = (props) => {
  const { msg, onMediaLoaded } = props;
  const { content: { picUrl }, position } = msg;

  const previewImage = useCallback(() => {
    // console.log(picUrl);
    window.xgimi.previewImage({
      current: 0,
      urls: [picUrl + '?imageslim']
    })
  }, [picUrl])

  const handleLoaded = useCallback(() => {
    if (typeof onMediaLoaded === 'function') {
      onMediaLoaded();
    }
  }, [onMediaLoaded]);

  return (
    <>
      {
        picUrl
        ? (
          <Bubble type="image">
            <img
              onClick={previewImage}
              style={{ maxWidth: 160, maxHeight: 320 }}
              src={picUrl + '?imageslim'}
              alt=""
              onLoad={handleLoaded}
            />
          </Bubble>
        )
        : (
          <div style={{ width: 160, textAlign: position }}>
            <Icon style={{ fontSize: 24, color: '#7c7c7c' }} type='spinner' spin />
          </div>
        )
      }
    </>
  )
};

export default ImageComp;
