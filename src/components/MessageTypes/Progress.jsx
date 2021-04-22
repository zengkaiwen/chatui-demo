import React from 'react';
import { Icon } from '@chatui/core';

const Progress = (props) => {
  console.log('progress')
  const { msg: { content } } = props;

  return (
    <div>
      <Icon style={{ fontSize: 24, color: '#7c7c7c' }} type='spinner' spin />
      {/* <div>{content.progress}%</div> */}
    </div>
  )
}

export default Progress;
