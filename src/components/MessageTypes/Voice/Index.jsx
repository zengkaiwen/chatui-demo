import React, { useCallback, useState } from 'react';
import { Bubble } from '@chatui/core';
import Sound from 'react-sound';

import voice_left_png from '../../../assets/voice_left.png';
import voice_left_gif from '../../../assets/voice_left.gif';
import voice_right_png from '../../../assets/voice_right.png';
import voice_right_gif from '../../../assets/voice_right.gif';
import './style.css';

const VOICE_IMG_MAP = {
  voice_left_png,
  voice_left_gif,
  voice_right_png,
  voice_right_gif,
}

const Voice = ({ msg }) => {
  const {
    position,
    content: {
      audioUrl,
    }
  } = msg;
  const duration = Math.floor(msg.content.duration);
  const [playStatus, setPlayStatus] = useState('STOPPED');

  const getBubbleWidth = useCallback(() => {
    if (duration > 30) {
      return '160px';
    } else if (duration > 10) {
      return '100px';
    } else {
      return ''
    }
  }, [duration]);

  const handleTogglePlay = useCallback(() => {
    if (playStatus === 'PLAYING') {
      setPlayStatus('STOPPED')
    } else {
      setPlayStatus('PLAYING')
    }
  }, [playStatus, setPlayStatus]);

  const handleSoundFinished = useCallback(() => {
    setPlayStatus('STOPPED');
  }, [setPlayStatus]);

  return (
    <Bubble>
      <Sound
        url={audioUrl}
        playStatus={playStatus}
        onFinishedPlaying={handleSoundFinished}
        onStop={handleSoundFinished}
        volume={100}
      />
      <div className={`voice_buble ${position}`} onClick={handleTogglePlay} style={{
        width: getBubbleWidth()
      }}>
        {
          position === 'left' &&
            <img className="icon icon_left" src={VOICE_IMG_MAP[`voice_left_${playStatus === 'PLAYING' ? 'gif' : 'png'}`]} alt="voice" />
        }
        <div className="duration_text">{duration}"</div>
        {
          position === 'right' &&
            <img className="icon icon_right" src={VOICE_IMG_MAP[`voice_right_${playStatus === 'PLAYING' ? 'gif' : 'png'}`]} alt="voice" />
        }
      </div>
    </Bubble>
  )
}

export default Voice;