import React from 'react';
import { IconButton } from '@chatui/core';

const Action = (props) => (
  <div className="Composer-actions" data-action-icon={props.icon}>
    <IconButton {...props} />
  </div>
);

export default Action;
