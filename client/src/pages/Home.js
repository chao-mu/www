import React from 'react';
import axios from 'axios';
import {
  Button,
} from '@material-ui/core';

import EventList from '../components/EventList';
import authClient from '../Auth';
import getServerErr from '../util';

import "./Home.scss";

class Home extends React.Component {
  state = {
    events: []
  };

  reloadEvents() {
    axios({
      url: "/api/events?format=json",
      method: 'GET'
    }).then((response) => {
      this.setState({events: response.data});
    }).catch((err) => {
      console.debug("Error! " + getServerErr(err));
    });
  }

  componentWillMount() {
    this.reloadEvents();
  }

  onExport() {
    axios({
      url: '/api/events?format=csv',
      method: 'GET',
      responseType: 'blob', // important
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ff-events-' + Date.now() + '.csv');
      document.body.appendChild(link);
      link.click();
    });
  }

  render() {
    return <div className="home">
      <div className="no-print">
        <h2>What/Where/When</h2>
        <div className="button-panel">
          <Button variant="outlined" color="primary" onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="outlined" color="default" onClick={() => this.onExport()}>
            Export
          </Button>

          {
            authClient.isAuthenticated() &&
              <Button variant="outlined" color="default" onClick={() => this.props.history.push("/add")}>
                Add
              </Button>
          }
          {
            !authClient.isAuthenticated() &&
              <Button variant="outlined" color="default" onClick={() => authClient.login()}>
                Add
              </Button>
          }
          {
            !authClient.isAuthenticated() &&
              <Button
                variant="outlined"
                size="medium"
                color="default"
                onClick={() => authClient.login()}
              >
                Login
              </Button>
          }
          {
            authClient.isAuthenticated() &&
              <Button
                variant="outlined"
                size="medium"
                color="default"
                onClick={() => authClient.logout()}
              >
                Logout
              </Button>
          }
        </div>
        <p className="intro">
          Before you lies your next adventure. Like other aspects of Firefly, events are self-organized. Add an event and make it happen!
        </p>
      </div>
      <EventList events={this.state.events} onChange={() => this.reloadEvents()}/>
    </div>
  };
}

export default Home;
