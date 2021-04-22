import React from 'react';
import { Text } from '@chatui/core';

const System = ({ msg }) => {
  const { text } = msg.content;
  return (
    <Text
      style={{
        color: '#7c7c7c',
        textAlign: 'center'
      }}
    >
      {text}
    </Text>
  )
}

export default System;