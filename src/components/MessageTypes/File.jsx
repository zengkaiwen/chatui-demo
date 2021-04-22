import React, { useCallback } from 'react';
import { FileCard } from '@chatui/core';

const getSizeByStr = (str) => {
  // console.log(str);
  if (!str) return 0;
  if (str.indexOf('&') !== -1) {
    str = str.split('&')[0];
  }
  // console.log(str);
  if (str.indexOf('MB') !== -1) {
    const num = str.substring(0, str.indexOf('MB'));
    // console.log(num);
    return parseFloat(num) * 1024 * 1024;
  }
  if (str.indexOf('KB') !== -1) {
    const num = str.substring(0, str.indexOf('KB'));
    return parseFloat(num) * 1024;
  }
  if (str.indexOf('B') !== -1) {
    const num = str.substring(0, str.indexOf('B'));
    return parseFloat(num);
  }
  return 0;
}

const File = (props) => {
  const { msg } = props;
  let {
    position,
    content,
  } = msg;

  if (!content.fileName) {
    content = {
      fileName: '文件不存在',
      fileUrl: '#',
      fileSize: 0
    };
  }

  const file = {
    name: content.fileName,
    size: getSizeByStr(content.fileSize),
  }

  const handleDownload = useCallback(() => {
    // console.log('点击文件卡片', encodeURI(content.fileUrl));
    if (position === 'left') {
      window.xgimi.navigateURL('page://outWeb?url=' + encodeURI(content.fileUrl));
    }
  }, [content, position]);

  return (
    <div onClick={handleDownload}>
      <FileCard file={file} style={{ maxWidth: '160px' }}></FileCard>
    </div>
  )
}

export default File;