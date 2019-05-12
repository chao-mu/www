import React from 'react';
import {
  Paper,
  Typography,
  withStyles
} from '@material-ui/core'

const styles = theme => ({
  event: {
    margin: 5,
    padding: 15,
  },
  dayHeader: {
    marginTop: 15,
    marginBottom: 5,
  }
});

function EventList(props) {
  //(events, ...other) = props;
  const {classes, events, ...other} = props;

  let lastDay = null;
  return (
    <span>
      {events.map(event => {
        let preface = <span/>;
        if (lastDay === null || lastDay !== event.day)  {
          preface = <h2 className={classes.dayHeader}>{event.day}</h2>;
          lastDay = event.day;
        }
        return <span key={event.id}>
            {preface}
            <Paper elevation={1} className={classes.event}>
              <Typography variant="h6" component="h3">
                <b>{event.name}</b> @ {event.location} ({event.day} {event.startTime}-{event.endTime})
              </Typography>
              <Typography component="p">
                <i>{event.description}</i>
              </Typography>
            </Paper>
          </span>;
      })}
    </span>
  );
}

export default withStyles(styles)(EventList);
