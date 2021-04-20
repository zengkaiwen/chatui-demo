import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';

import 'babel-polyfill/dist/polyfill';

import '@chatui/core/es/styles/index.less';
import '@chatui/core/dist/index.css';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
