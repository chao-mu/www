import React, { Fragment } from 'react';
import {
  CssBaseline,
  withStyles,
} from '@material-ui/core';

import AppHeader from './components/AppHeader';
import EventEntryPage from './pages/EventEntryPage';
import Home from './pages/Home';
import './App.scss';
import authClient from './Auth'

import {withRouter, Route} from 'react-router-dom';

const styles = theme => ({
  main: {
    padding: 3 * theme.spacing.unit,
    [theme.breakpoints.down('xs')]: {
      padding: 2 * theme.spacing.unit,
    },
  },
});

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
    const {classes} = this.props;
    return (
      <Fragment>
        <CssBaseline />
        <AppHeader />
        <main className={classes.main}>
          <Route exact path="/" component={Home}/>
          <Route exact path="/add" component={EventEntryPage}/>
          <Route exact path="/edit/:eventID" component={EventEntryPage}/>
        </main>
      </Fragment>
    );
  }
};

export default withRouter(withStyles(styles)(App));
