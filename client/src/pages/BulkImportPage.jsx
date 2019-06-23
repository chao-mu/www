import React from 'react';

import authClient from '../Auth';

import util from '../util';

import axios from 'axios';
//import "./BulkImportPage.scss";

import { withRouter } from 'react-router-dom'

import CSVReader from 'react-csv-reader'

class BulkImportPage extends React.Component {
  state = {
    log: []
  };

  logErr(msg) {
    this.setState({log: [...this.state.log, {level: "error", msg: msg}]});
  }

  logInfo(msg) {
    this.setState({log: [...this.state.log, {level: "info", msg: msg}]});
  }

  handleImport = (rows) => {
    if (rows.length === 0) {
      this.logErr("Empty file uploaded");
      return;
    }

    let header_row = rows[0];
    let headers = {};
    for (let i = 0; i < header_row.length; i++) {
      headers[header_row[i]] = i;
    }

    let fail = false;
    let getField = (row, h) => {
      let idx = headers[h];
      if (idx === undefined) {
        this.logErr("Missing header '" + h + "'");
        fail = true;
      }

      return row[idx];
    }

    let getTimeField = (row, h) => {
      let v = getField(row, h);
      if (fail) return;

      let t = util.convertTime(v);
      if (t === null) {
        this.logErr("Failed to parse time '" + v + "'");
        fail = true;
      }

      return t;
    }

    this.logInfo("Starting import...");

    let days = {
      Tuesday: 0,
      Wednesday: 1,
      Thursday: 2,
      Friday: 3,
      Saturday: 4,
      Sunday: 5
    };
    let events = []
    for (let i = 1; i < rows.length; i++) {
      let row = rows[i];
      events[i - 1] = {
        id: null,
        day: days[getField(row, "day")],
        name: getField(row, "name"),
        startTime: getTimeField(row, "start time"),
        endTime: getTimeField(row, "end time"),
        description: getField(row, "description"),
        location: getField(row, "location"),
      };

      if (fail) {
        return;
      }
    }


    this.logInfo("Contacting the other side...");
    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      let row_num = i + 1;

      axios.post("/api/event", event, {
        headers: { 'Authorization': `Bearer ${authClient.getIdToken()}` }
      }).then((resp) => {
        this.logInfo("Imported row " + row_num + " (" + event.name + ") ");
      }).catch((err) => {
        this.logErr("Failure to import row " + row_num + " (" + event.name + "): " + util.getServerErr(err));
      });
    }
  }

  render() {
    return authClient.isAuthenticated() && (
      <div className='bulk-import-page'>
        <CSVReader
          cssClass="csv-reader-input"
          label="Select CSV of events"
          onFileLoaded={this.handleImport}
          onError={this.handleError}
        />
        <h2>Bulk Import</h2>
        <h3>Log</h3>
        <ul>
        {
          this.state.log.map((line, i) => <li key={"log-" + i} className={line.level + "-level"}>{line.msg}</li>)
        }
        </ul>
      </div>
    );
  }
}
export default withRouter(BulkImportPage);
