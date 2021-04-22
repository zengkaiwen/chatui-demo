import React from 'react';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';

import Chat from './pages/Chat';
import Test from './pages/Test';

const App = () => (
  <HashRouter>
    <Switch>
      <Route path="/chat" component={Chat} />
      <Route path="/test" component={Test} />
      <Redirect path="/" to="/chat" />
    </Switch>
  </HashRouter>
);

export default App;
