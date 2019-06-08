import React, { Fragment } from 'react';
import {
  CssBaseline,
} from '@material-ui/core';

import AppHeader from './components/AppHeader';
import EventEntryPage from './pages/EventEntryPage';
import Home from './pages/Home';
import './App.scss';
import authClient from './Auth'

import {withRouter, Route} from 'react-router-dom';

class App extends React.Component {
  async componentDidMount() {
    if (this.props.location.pathname === '/callback') {
      try {
        await authClient.handleAuthentication();
      } catch (err) {
        // ignore
      }
      this.props.history.replace('/');
    } else {
      try {
        await authClient.silentAuth();
        this.forceUpdate();
      } catch (err) {
        // Ignore
      }
    }

    if (this.props.location.pathname !== "/" && !authClient.isAuthenticated()) {
      authClient.login();
    }
  }

  render() {
    return (
      <Fragment>
        <CssBaseline />
        <AppHeader />
        <main className="container">
          <Route exact path="/" component={Home}/>
          <Route exact path="/add" component={EventEntryPage}/>
          <Route exact path="/edit/:eventID" component={EventEntryPage}/>
        </main>
      </Fragment>
    );
  }
};

export default withRouter(App);
