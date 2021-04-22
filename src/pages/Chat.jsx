import React from 'react';
import { useCallback, useState, useRef, useEffect } from 'react';
import Chat, { useMessages, Empty } from '@chatui/core';

import {
  Text, Image, System, Audio, File, EmojiList,
  Divider, Video, Card, List, Progress, Composer
} from '../components';

import { emojiZh2En } from '../common/emoji';
import useBridge from '../hooks/useBridge'
import { guid } from '../common/utils';

import EmotionPng from '../assets/emotion.png';
import VideoPng from '../assets/video.png';
import PicturePng from '../assets/picture.png';


const msgTypeMap = {
  text: Text,
  image: Image,
  list: List,
  card: Card,
  system: System,
  audio: Audio,
  file: File,
  divider: Divider,
  video: Video,
  progress: Progress,
}

// 接到新消息的事件方法可能返回多条相同消息，采用Map避免展示列表的消息重复
const MSG_ID_MAP = {}; // 消息展示列表
const MSG_FILE_ARR = [] // 文件类型的消息，如图片、视频, [{id， type}], type: image, video
const ua = window.navigator.userAgent;
const isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1;

const ChatApp = () => {
  const composerRef = useRef(null);
  const messageRef = useRef(null);
  const inputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');

  const { messages, appendMsg, updateMsg, prependMsgs } = useMessages([]);

  useEffect(() => {
    document.documentElement.style.height = window.innerHeight + 'px';
  }, [])

  const xgimi = useBridge((xgimi) => {
    // console.log('初始化Bridge');
    setIsLoading(false);

    xgimi.addBridgeListener('onLoad', ({ pageSizeInfo }) => {
      // console.log('页面信息', pageSizeInfo);
      // setPageSizeInfo(pageSizeInfo);
    });
    xgimi.addBridgeListener('CUSTOMSRV_ONLINE', () => {
      // console.log('客服上线');
    });
    xgimi.addBridgeListener('CUSTOMSRV_OFFLINE', () => {
      // console.log('客服下线');
    });
    xgimi.addBridgeListener('CUSTOMSRV_QUEUENUM', (num) => {
      // console.log('当前排队人数', num);
    });
    xgimi.addBridgeListener('CUSTOMSRV_FINISH', () => {
      // console.log('结束会话');
      appendMsg({
        type: 'system',
        content: {
          text: '客服已离开',
        },
        position: 'center'
      });
    });
    xgimi.addBridgeListener('KEYBOARD_HEIGHT_CHANGE', (height) => {
      console.log('高度变化', height);

      if (isAndroid) {
        console.log('安卓')
        // document.documentElement.style.height = window.innerHeight + 'px';
      }

      if (height === 0 && inputRef) {
        inputRef.current.blur && inputRef.current.blur();
      }
      if (height > 0 && messageRef) {
        messageRef.current?.scrollToEnd();
      }
    })

    // 接收到消息
    xgimi.addBridgeListener('MESSAGE_RECEIVED', (msg) => {
      console.log('接受到消息', msg);
      if (!msg ) return;

      // 设置全部未读消息为已读
      xgimi.resetAllUnRead();

      msg.createdAt = parseInt(msg.createdAt)
      if (msg.position === 'left') {
        msg.user = {
          avatar: 'https://file02.xgimi.com/super-app/e3d171e9e964ad7e10b3231460d9e707'
        }
      }
      if (msg.position === 'center' && msg.type === 'text') {
        msg.type = 'system';
      }
      if (msg.type === 'withdrawMessage') {
        msg.position = 'center';
        msg.type = 'system';
        msg.content.text = '对方撤回一条消息';
      }
      if (msg.type === 'file') {
        if (/\.(mp4|mov)$/i.test(msg.content.fileName)) {
          msg.type = 'video';
        }
        if (/\.(jpg|png|gif)$/i.test(msg.content.fileName)) {
          msg.type = 'image';
          msg.content.picUrl = msg.content.fileUrl;
        }
        const firstIndex = MSG_FILE_ARR.findIndex((item) => item.type === 'file');
        if (firstIndex !== -1) {
          updateMsg(MSG_FILE_ARR[firstIndex].id, msg);
          MSG_ID_MAP[msg._id] = msg;
          MSG_FILE_ARR.splice(firstIndex, 1);
          return;
        }
      }
      if (msg.type === 'image') {
        if (!msg.content || !msg.content.picUrl) return;
        const firstImgIndex = MSG_FILE_ARR.findIndex((item) => item.type === 'image');
        if (firstImgIndex !== -1) {
          updateMsg(MSG_FILE_ARR[firstImgIndex].id, msg);
          MSG_ID_MAP[msg._id] = msg;
          MSG_FILE_ARR.splice(firstImgIndex, 1);
          return;
        }
      }
      if (msg.type === 'audio') {
        if (!msg.content || !msg.content.audioUrl) return;
        const firstImgIndex = MSG_FILE_ARR.findIndex((item) => item.type === 'audio');
        if (firstImgIndex !== -1) {
          updateMsg(MSG_FILE_ARR[firstImgIndex].id, msg);
          MSG_ID_MAP[msg._id] = msg;
          MSG_FILE_ARR.splice(firstImgIndex, 1);
          return;
        }
      }
      if (MSG_ID_MAP[msg._id]) {
        updateMsg(msg._id, msg);
      } else {
        MSG_ID_MAP[msg._id] = msg;
        appendMsg(msg);
      }
    });
    // 客服撤回消息通知
    xgimi.addBridgeListener('MESSAGE_WITHDRAW', (msg) => {
      // console.log('对方撤回消息', msg);
      const customMsg = {
        ...msg,
        _id: msg.id,
        type: 'system',
        content: {
          text: '对方撤回一条消息',
        },
        position: 'center',
        createdAt: +new Date(),
      };
      updateMsg(msg.id, customMsg);
    });

    xgimi.addBridgeListener('RECORD_START', () => {
      // console.log('录音功能开启');
    });
    // 监听录音结束
    xgimi.addBridgeListener('RECORD_COMPLETE', (data) => {
      const tempId = guid();
      appendMsg({
        _id: tempId,
        type: 'progress',
        position: 'right',
        content: {
          progress: 0,
        }
      })
      MSG_FILE_ARR.push({
        id: tempId,
        type: 'audio'
      });
      xgimi.sendQimoMsg({
        type: 'audio',
        content: data,
      });
    });

    // 监听录音取消
    xgimi.addBridgeListener('RECORD_CANCEL', () => {
      // console.log('录音功能已取消');
    });

    // 获取历史消息记录
    xgimi.getChatLists(200).then((messages) => {
      // console.log(messages);
      if (messages.list && messages.list.length > 0) {
        // 设置全部未读消息为已读
        xgimi.resetAllUnRead();

        const msgs = messages.list;
        const newMsgs = msgs.filter((msg) => {
          if (MSG_ID_MAP[msg._id]) return false;
          MSG_ID_MAP[msg._id] = msg;
          msg.createdAt = +msg.createdAt;
          msg.hasTime = false;
          if (msg.type === 'withdrawMessage') {
            console.log('撤回的消息', msg);
            msg.position = 'center';
            msg.type = 'system';
          }
          if (msg.position === 'left') {
            msg.user = {
              avatar: 'https://file02.xgimi.com/super-app/e3d171e9e964ad7e10b3231460d9e707'
            }
          }
          if (msg.type === 'file') {
            if (/\.(mp4|mov)$/i.test(msg.content.fileName)) {
              msg.type = 'video'
            }
            if (/\.(jpg|png|gif)$/i.test(msg.content.fileName)) {
              msg.type = 'image';
              msg.content.picUrl = msg.content.fileUrl;
            }
          }
          return true;
        });
        if (newMsgs.length < 1) {
          return;
        }
        newMsgs[newMsgs.length - 1].hasTime = true;
        prependMsgs(newMsgs.reverse())
        appendMsg({
          content: { text: '以上是历史消息' },
          position: 'center',
          type: 'divider',
          hasTime: false,
        })
      }
    })
  })


  const handleInputChange = useCallback((value) => {
    setInputValue(value);
  }, [setInputValue]);

  const handleMediaLoaded = useCallback(() => {
    if (messageRef.current) {
      messageRef.current.scrollToEnd();
    }
  }, [messageRef]);

  /**
   * 发送消息
   */
  const handleSend = useCallback((type, val) => {
    // console.log('发送');
    xgimi.hideKeyboard();
    let msg = {
      type,
      content: {
        text: val,
      },
      position: 'right',
    };
    // 文本消息
    if (type === 'text' && val.trim()) {
      // 将文本内的中文表情标识转换成英文标识
      msg.content.text = emojiZh2En(msg.content.text);
      xgimi.sendQimoMsg(msg);
    }
    // 图片消息
    else if (type === 'image' && val) {
      msg.content = {
        picUrl: val,
      }
      const tempId = guid();
      appendMsg({
        _id: tempId,
        type: 'progress',
        position: 'right',
        content: {
          progress: 0,
        }
      })
      MSG_FILE_ARR.push({
        id: tempId,
        type: 'image'
      });
      xgimi.sendQimoMsg(msg);
    } else if (type === 'file' && val) {
      // console.log('发送文件', val);
      val.filePath = val.fileName;
      msg.content = val
      // console.log(msg);
      // TODO: 上传文件的进度
      const tempId = guid();
      appendMsg({
        _id: tempId,
        type: 'progress',
        position: 'right',
        content: {
          progress: 0,
        }
      })
      MSG_FILE_ARR.push({
        id: tempId,
        type: 'file'
      });

      xgimi.sendQimoMsg(msg);
    }
    composerRef.current.setText('');
    setInputValue('');
  }, [xgimi, composerRef, appendMsg])

  function renderMessageContent(msg) {
    let { type } = msg
    if (type === 'text' && msg.content) {
      try {
        const innerMsg = JSON.parse(msg.content.text);
        // console.log('innerMsg', innerMsg);
        if (innerMsg.type) {
          msg = innerMsg;
          type = msg.type;
        }
      } catch (error) {}
    }
    if (type && msgTypeMap[type]) {
      const Comp = msgTypeMap[type]
      return <Comp msg={msg} onSend={handleSend} onMediaLoaded={handleMediaLoaded} />
    }
    return null
  }

  const recorder = {
    canRecord: true,
    onStart() {
      // console.log('开始录音')
      xgimi.startAudioRecord({
        maxDuration: 60,
      });
    },
    onEnd() {
      // console.log('停止录音')
      xgimi.stopAudioRecord();
    },
    onCancel() {
      // console.log('取消录音')
      xgimi.cancelAudioRecord();
    }
  }
  /**
   * 响应点击工具栏操作
   */
  const handleToolbarClick = useCallback((item) => {
    if (item.type === 'picture') {
      xgimi.chooseImage(null).then(res => {
        // console.log(res);
        const fileUrl = res.tempImages[0].path;
        handleSend('image', fileUrl);
      })
    }
    if (item.type === 'video') {
      xgimi.chooseVideo(null).then(res => {
        // console.log(res);
        const msg = res.tempVideos[0];
        handleSend('file', msg);
      })
    }
    if (item.type === 'emoji') {
      composerRef.current?.setInputType('text');
    }
  }, [xgimi, handleSend])

  /**
   * 加载历史记录
   */
  const handleLoadHistory = useCallback(() => {
    // console.log('加载历史信息');
    xgimi.getChatLists(100).then((messages) => {
      // console.log(messages);
      if (messages.list && messages.list.length > 0) {
        const msgs = messages.list;
        const newMsgs = msgs.filter((msg) => {
          if (MSG_ID_MAP[msg._id]) return false;
          MSG_ID_MAP[msg._id] = msg;
          msg.createdAt = +msg.createdAt;
          msg.hasTime = false;
          if (msg.position === 'left') {
            msg.user = {
              avatar: 'https://file02.xgimi.com/super-app/e3d171e9e964ad7e10b3231460d9e707'
            }
          }
          if (msg.position === 'center' && msg.type === 'text') {
            msg.type = 'system';
          }
          if (msg.type === 'withdrawMessage') {
            msg.type = 'system';
          }
          if (msg.type === 'file') {
            if (/\.(mp4|mov)$/i.test(msg.content.fileName)) {
              msg.type = 'video'
            }
          }
          return true;
        });
        if (newMsgs.length < 1) {
          xgimi.toast({
            title: '没有更多历史消息'
          });
          return;
        }
        prependMsgs(newMsgs.reverse())
      }
    })
  }, [xgimi, prependMsgs]);

  const handleToolbarToggle = useCallback(() => {
    if (messageRef.current) {
      messageRef.current.scrollToEnd();
    }
  }, [messageRef]);

  const handleFocus = useCallback(
    (e) => {
      inputRef.current = e.target;
    },
    [inputRef],
  );

  const handleInputTypeChange = useCallback(
    (type) => {
      if (type === 'voice') {
        // 因为inputType不会引起Chat组件的默认输入方式改变，如果有更好的方式可以切换
        const inputTypeBtn = document.getElementsByClassName('Composer-inputTypeBtn')[0];
        xgimi.requestMicrophonePermission(null).then((isPermission) => {
          console.log('请求授权');
          if (!isPermission) {
            inputTypeBtn.click();
          }
        });
      }
    },
    [xgimi],
  );

  const toolbar = [{
    type: 'picture',
    img: PicturePng,
    title: '图片'
  }, {
    type: 'video',
    img: VideoPng,
    title: '视频'
  }, {
    type: 'emoji',
    img: EmotionPng,
    title: '表情',
    render: <EmojiList
      composerRef={composerRef}
      inputValue={inputValue}
    />
  }]

  return (
    <>
      { 
        !xgimi && !isLoading ? <Empty className="empty_default" type="error" tip="oops...加载失败" /> : null
      }
      {
        xgimi && <Chat
          onInputTypeChange={handleInputTypeChange}
          onClick={() => console.log('click chat')}
          placeholder="请输入您要咨询的内容"
          messages={messages}
          messagesRef={messageRef}
          renderMessageContent={renderMessageContent}
          onSend={handleSend}
          loadMoreText="查看更多"
          recorder={recorder}
          toolbar={toolbar}
          onToolbarClick={handleToolbarClick}
          composerRef={composerRef}
          onRefresh={handleLoadHistory}
          onInputChange={handleInputChange}
          onInputFocus={handleFocus}
          onAccessoryToggle={handleToolbarToggle}
          Composer={Composer}
        />
      }
    </>
  )
}

export default ChatApp;
