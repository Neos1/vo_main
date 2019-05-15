import React, { Component } from 'react';
import { MemoryRouter, Route, Switch, withRouter } from 'react-router-dom';
import Login from '../components/ballot/Login/Login';
import Main from "../components/ballot/Main/Main";


class SimpleRouter extends Component {
  render() {
    return ( 
      <MemoryRouter>
        <Switch>
          <Route path='/' exact component={withRouter(Login)}/>
          <Route path='/questions' exact component={withRouter(Main)}/>
        </Switch>
      </MemoryRouter>
     );
  }
  
}
 
export default SimpleRouter;