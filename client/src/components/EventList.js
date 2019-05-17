import React from 'react';

import "./EventList.css"

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
          <React.Fragment key={day}>
            <tbody>
              <tr className="greyed">
                <td colSpan={3}>
                  <center>
                    <h3 className="day">{day}</h3>
                  </center>
                </td>
              </tr>
            </tbody>
            {
              byDay[day].map(e => (
                <tbody className="event" key={e.id}>
                  <tr className="greyed">
                    <td className="duration">{e.startTime} - {e.endTime}</td>
                    <td><b>{e.name}</b></td>
                    <td><b>{e.location}</b></td>
                  </tr>
                  <tr>
                    <td></td>
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
