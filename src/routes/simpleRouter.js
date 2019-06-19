import React, { Component } from 'react';
import { MemoryRouter, Route, Switch, withRouter } from 'react-router-dom';
import Login from '../components/ballot/Login/Login';
import Main from "../components/ballot/Main/Main";
import VotingWrapper from '../components/ballot/VotingWrapper';
import Users from '../components/ballot/Users';

class SimpleRouter extends Component {
  render() {
    return ( 
      <MemoryRouter>
        <Switch>
          <Route path='/' exact component={withRouter(Login)}/>
          <Route path='/questions' exact component={withRouter(Main)}/>
          <Route path='/votings' exact component={withRouter(VotingWrapper)}/>
          <Route path='/users' exact component={withRouter(Users)}/>
        </Switch>
      </MemoryRouter>
     );
  }
  
}
 
export default SimpleRouter;