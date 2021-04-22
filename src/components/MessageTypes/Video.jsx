import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Bubble, Icon } from '@chatui/core';

const Video = (props) => {
  const {
    content: {
      fileUrl,
    },
    position,
  } = props.msg;
  const videoRef = useRef(null);

  const [cover, setCover] = useState('');
  const [play, setPlay] = useState(false);  

  useEffect(() => {
    if (fileUrl) {
      const urls = fileUrl.split('?');
      const coverUrl = urls[0] + '?vframe/jpg/offset/1';
      setCover(coverUrl);
    }
  }, [fileUrl]);

  const handleCoverLoad = useCallback(() => {
    if (typeof props.onMediaLoaded === 'function') {
      props.onMediaLoaded();
    }
  }, [props]);

  const handlePlay = useCallback(
    () => {
      setPlay(true);
      if (videoRef.current) {
        videoRef.current.play();
      }
    },
    [videoRef, setPlay],
  )

  return (
    <>
      {
        fileUrl && cover ? (
          <Bubble type="image">
            <video
              ref={videoRef}
              style={{ maxWidth: 160, maxHeight: 320, display: play ? 'block' : 'none' }}
              playsinline="true"
              webkit-playsinline="true"
              x5-video-player-type="h5"
              src={fileUrl}
              controls
            />
            <div style={{ position: 'relative', display: !play ? 'block' : 'none' }} onClick={handlePlay}>
              <img
                style={{ maxWidth: 160, maxHeight: 320 }}
                src={cover}
                onLoad={handleCoverLoad}
                alt="视频封面图"
              />
              <img
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                alt="按钮图片"
                width="36"
                height="36"
                src="https://file02.xgimi.com/super-app/89fcfd0936c04b521033609f1b0554c9"
              />
            </div>
          </Bubble>
        ) : (
          <div style={{ width: 160, textAlign: position }}>
            <Icon style={{ fontSize: 24, color: '#7c7c7c' }} type='spinner' spin />
          </div>
        )
      }
    </>
  )
}

export default Video;
