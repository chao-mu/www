import React from 'react';

import "./EventList.css"

import {
  Delete,
  Edit
} from '@material-ui/icons';

import {
  IconButton
} from '@material-ui/core';

import moment from 'moment';
import axios from 'axios';

import EventDialog from './EventDialog';

import getServerErr from '../util';
import authClient from '../Auth';

function convertDay(day) {
  return ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day]
}

function convertTime(time) {
  return moment(time, 'HH:mm').format('hh:mma');
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

function EventList(props) {
  const {events} = props;

  let byDay = {};
  events.forEach(e => {
    if (!byDay[e.day]) {
      byDay[e.day] = [];
    }

    byDay[e.day].push(e);
  });

  return (
    <table className="eventTable">
      {
        Object.keys(byDay).map(day => (
          <React.Fragment key={"day-" + day}>
            <tbody className="day-header">
              <tr className="greyed">
                <td colSpan={3}>
                  <center>
                    <h2 className="day">{convertDay(day)}</h2>
                  </center>
                </td>
              </tr>
            </tbody>
            {
              byDay[day].map(e => (
                <tbody className="event" key={"event-" + e.id}>
                  <tr className="greyed">
                    <td className="duration">
                      {convertTime(e.startTime)} - {convertTime(e.endTime)}
                    </td>
                    <td>
                      <b>{e.name}</b>
                    </td>
                    <td>
                      <b>{e.location}</b>
                    </td>
                  </tr>
                  <tr>
                    <td className="actionsCell">
                      {
                        authClient.isAuthenticated() && authClient.profile.sub === e.createdBy &&
                          <div className="actions no-print">
                            <EventDialog event={e} onSuccess={() => props.onChange()}>
                              <IconButton fontSize="small" >
                                <Edit />
                              </IconButton>
                            </EventDialog>
                            <IconButton fontSize="small" onClick={() => deleteEvent(e.id, () => props.onChange())}>
                              <Delete />
                            </IconButton>
                          </div>
                      }
                    </td>
                    <td colSpan={2} className="desc">{e.description}</td>
                  </tr>
                </tbody>
              ))
            }
          </React.Fragment>
        ))
      }
    </table>
  );
}

export default EventList;
