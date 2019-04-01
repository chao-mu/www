import React from 'react';
import axios from 'axios';
import {
  Typography,
  Button,
} from '@material-ui/core';

import EventList from '../components/EventList';
import AddEvent from '../components/AddEvent';

class Home extends React.Component {
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
    return <div>
      <Typography variant="display1">What/Where/When</Typography>
      <Typography variant="body1" paragraph={true}>
        Before you lies the comings and goings of events at Firefly. Like most aspects of Firefly, every event is participant organized and driven. Feel free to add an event you are organizing!
      </Typography>
      <Button variant="outlined" color="primary">
        Print
      </Button>
      <Button variant="outlined" color="default" onClick={this.onExport}>
        Export
      </Button>
      <AddEvent/>
      <EventList/>
    </div>
  };
}

export default Home;
