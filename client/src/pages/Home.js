import React from 'react';
import axios from 'axios';
import {
  Typography,
  Button,
} from '@material-ui/core';
import LoadingOverlay from 'react-loading-overlay';

import EventList from '../components/EventList';
import AddEvent from '../components/AddEvent';
import getServerErr from '../util';

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
    return <LoadingOverlay
        active={!this.state.eventsLoaded}
        spinner
        text='Contacting the other side...'
      >
        <div>
          <div className="no-print">
            <Typography variant="display1">What/Where/When</Typography>
            <Typography variant="body1" paragraph={true}>
              Before you lies the comings and goings of events at Firefly. Like other aspects of Firefly, events are participant organized and run. Feel free to add an event you are organizing!
            </Typography>
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
      </LoadingOverlay>;
  };
}

export default Home;
