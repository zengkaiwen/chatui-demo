import React, { useState, useRef, useImperativeHandle, useEffect } from 'react';
import clsx from 'clsx';
import { Input, Toolbar, ClickOutside } from '@chatui/core';

// 导入自定义方法或组件
import { toggleClass } from '../../common/utils';
import Action from './Action';
import Recorder from '../Recorder';
import riseInput from './riseInput';

import './style.less';

// 模块内常量
const NO_HOME_BAR = 'S--noHomeBar';

// 输入组件
const Composer = React.forwardRef((props, ref) => {
  const {
    text: initialText = '',
    inputType: initialInputType = 'text',
    wideBreakpoint,
    placeholder = '请输入...',
    recorder = {},
    onInputTypeChange,
    onFocus,
    onBlur,
    onChange,
    onSend,
    onImageSend,
    onAccessoryToggle,
    toolbar = [],
    onToolbarClick,
    rightAction,
  } = props;

  // Ref
  const composerRef = useRef(null);
  const inputRef = useRef(null);
  const focused = useRef(false);
  const blurTimer = useRef();
  const popoverTarget = useRef();
  const isMountRef = useRef(false);

  // State
  const [text, setText] = useState(initialText);
  const [inputType, setInputType] = useState(initialInputType);
  const [isAccessoryOpen, setAccessoryOpen] = useState(false);
  const [accessoryContent, setAccessoryContent] = useState('');

  // Variant
  const isInputText = inputType === 'text';
  const inputTypeIcon = isInputText ? 'mic' : 'keyboard';
  const hasToolbar = toolbar.length > 0;

  useEffect(() => {
    isMountRef.current = true;
    riseInput(inputRef.current, composerRef.current);
  }, []);

  useEffect(() => {
    if (isMountRef.current && onAccessoryToggle) {
      onAccessoryToggle(isAccessoryOpen);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAccessoryOpen]);

  useImperativeHandle(ref, () => ({
    setText(val) {
      setText(val);
    },
    setInputType(val) {
      setInputType(val);
    },
  }));

  function handleAccessoryToggle() {
    setAccessoryOpen(!isAccessoryOpen);
  }

  function handleToolbarClick(item, e) {
    if (onToolbarClick) {
      onToolbarClick(item, e);
    }
    if (item.render) {
      popoverTarget.current = e.currentTarget;
      setAccessoryContent(item.render);
    }
  }

  function handleAccessoryBlur() {
    setTimeout(() => {
      setAccessoryOpen(false);
      setAccessoryContent('');
    });
  }

  function handleInputTypeChange() {
    const isVoice = inputType === 'voice';
    const nextType = isVoice ? 'text' : 'voice';
    setInputType(nextType);

    if (isVoice) {
      const input = inputRef.current;
      input.focus();
      input.selectionStart = input.selectionEnd = input.value.length;
    }
    if (onInputTypeChange) {
      onInputTypeChange(nextType);
    }
  }

  // 输入框聚焦
  function handleInputFocus(e) {
    clearTimeout(blurTimer.current);
    toggleClass(NO_HOME_BAR, true);
    focused.current = true;

    if (onFocus) {
      onFocus(e);
    }
  }
  // 输入框失焦
  function handleInputBlur(e) {
    blurTimer.current = setTimeout(() => {
      toggleClass(NO_HOME_BAR, false);
      focused.current = false;
    }, 0);

    if (onBlur) {
      onBlur(e);
    }
  }

  // 发送文本消息
  function send() {
    onSend('text', text);
    setText('');

    if (focused.current) {
      inputRef.current.focus();
    }
  }
  // 输入法点击回车，发送消息
  function handleInputKeyDown(e) {
    if (!e.shiftKey && e.keyCode === 13) {
      send();
      e.preventDefault();
    }
  }
  // 点击发送按钮
  function handleSendBtnClick(e) {
    send();
    e.preventDefault();
  }

  function handleTextChange(value, e) {
    setText(value);

    if (onChange) {
      onChange(value, e);
    }
  }

  function renderExtra() {
    const accessory = accessoryContent || <Toolbar items={toolbar} onClick={handleToolbarClick} />;
    return <ClickOutside onClick={handleAccessoryBlur}>{accessory}</ClickOutside>;
  }

  const renderInput = () => (
    <div className={clsx({ 'S--invisible': !isInputText })}>
      <Input
        className="Composer-input"
        value={text}
        rows={1}
        autoSize
        ref={inputRef}
        placeholder={placeholder}
        enterKeyHint="send"
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        onChange={handleTextChange}
      />
    </div>
  );

  return (
    <>
      <div className="Composer" ref={composerRef}>
        {recorder.canRecord && (
          <Action
            className="Composer-inputTypeBtn"
            data-icon={inputTypeIcon}
            icon={inputTypeIcon}
            onClick={handleInputTypeChange}
            aria-label={isInputText ? '切换到语音输入' : '切换到键盘输入'}
          />
        )}
        <div className="Composer-inputWrap">
          {renderInput()}
          {text && inputType === 'text' && (
            <Action
              className="Composer-sendBtn"
              icon="paper-plane"
              color="primary"
              onMouseDown={handleSendBtnClick}
              aria-label="发送"
            />
          )}
          {!isInputText && <Recorder {...recorder} />}
        </div>
        {!text && rightAction && <Action {...rightAction} />}
        {hasToolbar && (
          <Action
            className={clsx('Composer-toggleBtn', {
              active: isAccessoryOpen,
            })}
            icon="plus"
            onClick={handleAccessoryToggle}
            aria-label={isAccessoryOpen ? '关闭工具栏' : '展开工具栏'}
          />
        )}
      </div>
      {isAccessoryOpen && renderExtra()}
    </>
  );
});

export default Composer;
