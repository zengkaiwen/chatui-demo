import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import clsx from 'clsx';

import { Flex, Icon, useLocale } from '@chatui/core';

import { canUse } from '../../common/utils';

import './style.less';
const passive = canUse('passiveListener') ? { passive: false } : false;
const MOVE_INTERVAL = 80;

const btnTextMap = {
  inited: 'hold2talk',
  recording: 'release2send',
  willCancel: 'release2send',
};

let ts = 0;
let startY = 0;


const Recorder = React.forwardRef((props, ref) => {
  const { volume, onStart, onEnd, onCancel } = props;
  const [status, setStatus] = useState('inited');
  const btnRef = useRef(null);
  const { trans } = useLocale('Recorder');

  function doEnd() {
    const duration = Date.now() - ts;
    if (onEnd) {
      onEnd({ duration });
    }
  }

  useImperativeHandle(ref, () => ({
    stop() {
      setStatus('inited');
      doEnd();
      ts = 0;
    },
  }));

  useEffect(() => {
    const wrapper = btnRef.current;
    if (!wrapper) return;

    function handleTouchStart(e) {
      if (e.cancelable) {
        e.preventDefault();
      }
      const touch0 = e.touches[0];
      startY = touch0.pageY;
      ts = Date.now();
      setStatus('recording');

      if (onStart) {
        onStart();
      }
    }

    function handleTouchMove(e) {
      if (!ts) return;
      const nowY = e.touches[0].pageY;
      const isCancel = startY - nowY > MOVE_INTERVAL;
      setStatus(isCancel ? 'willCancel' : 'recording');
    }

    function handleTouchEnd(e) {
      if (!ts) return;
      const endY = e.changedTouches[0].pageY;
      const isRecording = startY - endY < MOVE_INTERVAL;

      setStatus('inited');

      if (isRecording) {
        doEnd();
      } else if (onCancel) {
        onCancel();
      }
    }

    wrapper.addEventListener('touchstart', handleTouchStart);
    wrapper.addEventListener('touchmove', handleTouchMove, passive);
    wrapper.addEventListener('touchend', handleTouchEnd);
    wrapper.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      wrapper.removeEventListener('touchstart', handleTouchStart);
      wrapper.removeEventListener('touchmove', handleTouchMove);
      wrapper.removeEventListener('touchend', handleTouchEnd);
      wrapper.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  const isCancel = status === 'willCancel';
  const wavesStyle = { transform: `scale(${(volume || 1) / 100 + 1})` };

  return (
    <div className={clsx('Recorder', { 'Recorder--cancel': isCancel })} ref={btnRef}>
      {status !== 'inited' && (
        <Flex className="RecorderToast" direction="column" center>
          <div className="RecorderToast-waves" hidden={status !== 'recording'} style={wavesStyle}>
            <Icon className="RecorderToast-wave-1" type="hexagon" />
            <Icon className="RecorderToast-wave-2" type="hexagon" />
            <Icon className="RecorderToast-wave-3" type="hexagon" />
          </div>
          <Icon className="RecorderToast-icon" type={isCancel ? 'cancel' : 'mic'} />
          <span>{trans(isCancel ? 'release2cancel' : 'releaseOrSwipe')}</span>
        </Flex>
      )}
      <div className="Recorder-btn" role="button" aria-label={trans('hold2talk')}>
        <span>{trans(btnTextMap[status])}</span>
      </div>
    </div>
  );
});

export default Recorder;
