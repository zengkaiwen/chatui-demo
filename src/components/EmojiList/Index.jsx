import React, { useCallback, useState, useEffect } from 'react';

import { emoji, emojiZhRegex } from '../../common/emoji';

import DeleteIcon from '../../assets/icon_delete_emoji.png';
import './style.css';

const EmojiList = (props) => {
  const { composerRef, inputValue } = props;
  const [emojiText, setEmojiText] = useState('');
  const [emojiWidth, setEmojiWidth] = useState(0);

  useEffect(() => {
    const emojiWrapEl = document.querySelector('.emoji_wrap').getBoundingClientRect();
    setEmojiWidth(emojiWrapEl.width / 8);
  }, [])

  const handleEmojiClick = useCallback((e, emojiValue) => {
    e.preventDefault();
    // console.log('点击了表情', emojiValue, composerRef, inputValue);
    if (composerRef && composerRef.current) {
      const text = emojiText + `[${emoji[emojiValue][2]}]`;
      setEmojiText(text);
      const newValue = inputValue + text;
      composerRef.current.setText(newValue);
    }
  }, [inputValue, composerRef, setEmojiText, emojiText]);

  const handleDelete = useCallback((e) => {
    e.preventDefault();
    if (composerRef && composerRef.current) {
      const match = emojiText.match(emojiZhRegex);
      let text = emojiText;
      if (match && match.length > 0) {
        const len = match[match.length - 1].length;
        text = emojiText.substr(0, emojiText.length - len);
      }
      setEmojiText(text);
      const newValue = inputValue + text;
      composerRef.current.setText(newValue);
    }
  }, [inputValue, composerRef, setEmojiText, emojiText]);

  const emojiWrapStyle = {
    height: `${emojiWidth * 5}px`,
  };
  const emojiDivStyle = {
    width: `${emojiWidth}px`,
    height: `${emojiWidth}px`,
    fontSize: `${emojiWidth}px`,
  };
  const emojiImgStyle = {
    width: `${emojiWidth * 0.55}px`,
    height: `${emojiWidth * 0.55}px`
  };
  const emojiDelStyle = {
    width: `${emojiWidth * 0.6}px`,
    fontSize: `${emojiWidth * 0.6}px`
  }

  return (
    <div style={emojiWrapStyle} className="emoji_wrap">
      {/* <Text>最近使用</Text>
      <div className="emoji_list">

      </div>
      <Text>所有表情</Text> */}
      <div className="emoji_list">
        {
          Object.keys(emoji).map((key) => (
            <div style={emojiDivStyle} key={key} className="emoji" onClick={(e) => handleEmojiClick(e, key)}>
              {/* {emoji[key][0]} */}
              <img style={emojiImgStyle} src={emoji[key][1]} alt="emojiName"/>
            </div>
          ))
        }
        <div style={emojiDivStyle} className="emoji" onClick={handleDelete}>
          <img style={emojiDelStyle} src={DeleteIcon} alt="删除"/>
        </div>
      </div>
    </div>
  )
}

export default EmojiList;