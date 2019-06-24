import React from 'react';

import "./EventList.scss"

import {
  Delete,
  Edit
} from '@material-ui/icons';

import {
  IconButton,
  Button
} from '@material-ui/core';

import moment from 'moment';
import axios from 'axios';

import { withRouter } from 'react-router-dom'

import getServerErr from '../util';
import authClient from '../Auth';

function convertDay(day) {
  return ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day]
}

function convertTime(time) {
  return moment(time, 'HH:mm').format('h:mma');
}

function deleteEvent(id, callback) {
  axios.delete("/api/event", {
    data: {
      id: id,
    },
    headers: {
      'Authorization': `Bearer ${authClient.getIdToken()}`
    }
  }).then(callback).catch((err) => {
    console.log("Error deleting event: " + getServerErr(err));
  });
}

class EventList extends React.Component {
  state = {
    shownEvents: {}
  }

  toggleAll() {
    let show = true;
    this.props.events.forEach(e => {
      if (this.state.shownEvents[e.id] === undefined || this.state.shownEvents[e.id]) {
        show = false;
      }
    });

    let newState = {};
    this.props.events.forEach(e => {
      newState[e.id] = show;
    });

    this.setState({shownEvents: newState});
  }

  toggleEvent(id) {
    let prev = this.state.shownEvents[id];
    let newState = {}
    if (prev === undefined) {
      newState[id] = false;
    } else {
      newState[id] = !prev;
    }

    this.setState({shownEvents: {...this.state.shownEvents, ...newState}});
    console.log(prev);
  }

  render() {
    const {events} = this.props;

    let byDay = {};
    events.forEach(e => {
      if (!byDay[e.day]) {
        byDay[e.day] = [];
      }

      byDay[e.day].push(e);
    });

    return (
      <React.Fragment>
        <div className="showHideToggle no-print">
          <Button
            color="primary"
            onClick={() => this.toggleAll()}
          >
            hide/show descriptions
          </Button>
        </div>

        {
          Object.keys(byDay).map(day => (
            <table key={"day-" + day} className="events">
              <thead>
                <tr className="list-heading">
                  <td className="day" colSpan={2}>
                    { convertDay(day) }
                  </td>
                </tr>
              </thead>
              <tbody>
                {
                  byDay[day].map(e => (
                    <tr key={"event-" + e.id} className="list-item">
                      <td className="duration">
                        {convertTime(e.startTime)} - {convertTime(e.endTime)}
                        {
                          authClient.isAuthenticated() && authClient.profile.sub === e.createdBy &&
                            <div className="actions no-print">
                              <IconButton fontSize="small" onClick={() => this.props.history.push("/edit/" + e.id)}>
                                <Edit />
                              </IconButton>
                              <IconButton fontSize="small" onClick={() => deleteEvent(e.id, () => this.props.onChange())}>
                                <Delete />
                              </IconButton>
                            </div>
                        }
                      </td>
                      <td className="details"  onClick={() => this.toggleEvent(e.id) }>
                        <div>
                          <div className="name">{e.name}</div>
                          <div className="location">{e.location}</div>
                        </div>
                        {
                          (this.state.shownEvents[e.id] || this.state.shownEvents[e.id] === undefined) &&
                            <div className="description">
                              {e.description}
                            </div>
                        }
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          ))
        }
      </React.Fragment>
    );
  }
}

export default withRouter(EventList);
