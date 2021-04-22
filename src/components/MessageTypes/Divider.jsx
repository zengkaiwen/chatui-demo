import React from 'react';
import { Divider as Divi } from '@chatui/core';

const Divider = (props) => {
  const { content: { text } } = props.msg;

  return (
    <div style={{ width: '100%' }}>
      <Divi>{text}</Divi>
    </div>
  )
}

export default Divider;