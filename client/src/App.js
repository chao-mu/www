import React, { Fragment } from 'react';
import {
  CssBaseline,
} from '@material-ui/core';

import AppHeader from './components/AppHeader';
import EventEntryPage from './pages/EventEntryPage';
import BulkImportPage from './pages/BulkImportPage';
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
      let ret = (new URLSearchParams(this.props.location.search)).get("return_to");
      this.props.history.replace(ret);
    } else {
      try {
        await authClient.silentAuth();
        this.forceUpdate();
      } catch (err) {
        // Ignore
      }
    }

    if (this.props.location.pathname !== "/" && !authClient.isAuthenticated()) {
      authClient.login(this.props.location.pathname);
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
          <Route exact path="/bulk" component={BulkImportPage}/>
          <Route exact path="/edit/:eventID" component={EventEntryPage}/>
        </main>
      </Fragment>
    );
  }
};

export default withRouter(App);
