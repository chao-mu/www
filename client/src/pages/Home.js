import React from 'react';
import axios from 'axios';
import {
  Typography,
  Button,
} from '@material-ui/core';

import EventList from '../components/EventList';
import AddEvent from '../components/AddEvent';
import getServerErr from '../util';

import "./Home.scss";

class Home extends React.Component {
  state = {
    events: [],
    eventsLoaded: false
  };

  reloadEvents = () => {
    axios({
      url: "/api/events?format=json",
      method: 'GET'
    }).then((response) => {
      this.setState({events: response.data, eventsLoaded: true});
    }).catch((err) => {
      console.debug("Error! " + getServerErr(err));
    });
  }

  componentWillMount() {
    this.reloadEvents();
  }

  onExport = () => {
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
        <p className="intro">
          Before you lies your next adventure. Like other aspects of Firefly, events are self-organized - so add an event and make it happen!
        </p>
        <Button variant="outlined" color="primary" onClick={() => window.print()}>
          Print
        </Button>
        <Button variant="outlined" color="default" onClick={this.onExport}>
          Export
        </Button>
        <AddEvent onAdd={this.reloadEvents}/>
      </div>
      <EventList events={this.state.events}/>
    </div>
  };
}

export default Home;
