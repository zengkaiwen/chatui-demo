/* eslint-disable no-cond-assign */
import React, { useCallback } from 'react';
import { Bubble } from '@chatui/core';
import { emoji, emojiRegex } from '../../../common/emoji';

import './style.css';

const Text = ({ msg }) => {
  const { content = { text: '暂无回复' } } = msg;
  const { text } = content;

  const replace = useCallback(() => {
    let match, lastIndex = 0, ret = [], i = 0, key;
    while(match = emojiRegex.exec(text)) {
      if (match.index !== lastIndex) {
        ret.push(
          <span key={i++}>{text.slice(lastIndex, match.index)}</span>
        )
      }
      key = match[0].substr(1, match[0].length - 2);
      if (emoji[key]) {
        ret.push(
          <img key={i++} className="emoji_icon" src={emoji[key][1]} alt={key} />
        );
      } else {
        ret.push(
          <span key={i++}>{text.slice(match.index, match.index + key.length + 2)}</span>
        );
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex !== text.length) {
      ret.push(
        <span key={i++}>{text.slice(lastIndex)}</span>
      )
    }
    return ret;
  }, [text])

  return (
    <Bubble>
      { replace() }
    </Bubble>
  )
}

export default Text;
