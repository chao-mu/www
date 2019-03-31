import React from 'react';
import {
  Typography,
  Button,
} from '@material-ui/core';

import EventList from '../components/EventList';
import AddEvent from '../components/AddEvent';

export default () => (
    <div>
        <Typography variant="display1">What/Where/When</Typography>
        <Typography variant="body1" paragraph={true}>
            Before you lies the comings and goings of events at Firefly. Like most aspects of Firefly, every event is participant organized and driven. Feel free to add an event you are organizing!
        </Typography>
        <Button variant="outlined" color="primary">
          Print
        </Button>
        <Button variant="outlined" color="default">
          Export
        </Button>
        <AddEvent/>
        <EventList/>
    </div>
);
