import React from 'react';
import {
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  FormHelperText,
  Grid,
  withStyles,
} from '@material-ui/core';

import "./EventEntryPage.scss";

import { withRouter } from 'react-router-dom'

import LoadingOverlay from 'react-loading-overlay';

import moment from 'moment';
import axios from 'axios';

import OurSnackbarContent from "../components/OurSnackbarContent";
import util from '../util';

import authClient from '../Auth';

const styles = theme => ({
  notice: {
    marginBottom: 15
  }
});

const timeFormatError = "Incorrect time format, expected times like 3:00pm or 15:00, 2:00am or 02:00";

function prettyTime(time) {
  return moment(time, "HH:mm").format("h:mma");
}

class EventEntryPage extends React.Component {
  isEditMode = () => {
    return this.props.match.params.eventID === undefined ? false : true;
  };

  initialState = {
    open: false,
    day: 0,
    dayError: null,
    name: "",
    nameError: null,
    startTime: "",
    startTimeError: null,
    endTime: "",
    endTimeError: null,
    location: "",
    locationError: null,
    description: "",
    descriptionError: null,
    isLoading: false,
    pageError: null,
    success: false,
  };

  state = this.initialState;

  componentDidMount() {
    const { match: { params } } = this.props;

    if (!authClient.isAuthenticated()) {
      authClient.login();
    } else if (params.eventID !== undefined) {
      this.setState({isLoading: true});
      axios.get("/api/event", {
        params: {
          id: params.eventID
        }
      }).then(({data: event}) => {
        this.setState({
          id: event.id,
          day: event.day,
          name: event.name,
          startTime: prettyTime(event.startTime),
          endTime: prettyTime(event.endTime),
          location: event.location,
          description: event.description,
          isLoading: false,
        });
      }).catch((err) => {
        this.setState({pageError: util.getServerErr(err), isLoading: false});
      });
    }
  }

  tooLongMsg = (maxLength) => {
    return "Text is too long. Must be no more than " + maxLength + " characters";
  };

  requiredMsg = () => {
    return "Field is required";
  }

  handleSave = () => {
    this.setState({success: false, pageError: null});

    if (!this.validateForm()) {
      return;
    }

    this.setState({isLoading: true});

    axios.post("/api/event", {
      id: this.isEditMode() ? this.state.id : null,
      day: this.state.day,
      name: this.state.name,
      startTime: util.convertTime(this.state.startTime),
      endTime: util.convertTime(this.state.endTime),
      location: this.state.location,
      description: this.state.description,
    }, {
      headers: { 'Authorization': `Bearer ${authClient.getIdToken()}` }
    }).then((resp) => {
      if (this.isEditMode()) {
        this.setState({success: true, isLoading: false});
      } else {
        this.setState({...this.initialState, open: true, success: true});
      }
    }).catch((err) => {
      this.setState({pageError: util.getServerErr(err), isLoading: false});
    });
  }

  validateForm = () => {
    let okay = true;

    if (!this.state.name) {
      this.setState({nameError: this.requiredMsg()});
      okay = false;
    } else if (this.state.name.length > 60) {
      this.setState({nameError: this.tooLongMsg(60)});
      okay = false;
    } else {
      this.setState({nameError: null});
    }

    if (!this.state.startTime) {
      this.setState({startTimeError: this.requiredMsg()});
      okay = false;
    } else if (util.convertTime(this.state.startTime) === null) {
      this.setState({startTimeError: timeFormatError});
    } else {
      this.setState({startTimeError: null});
    }

    if (!this.state.endTime) {
      this.setState({endTimeError: this.requiredMsg()});
      okay = false;
    } else if (util.convertTime(this.state.endTime) === null) {
      this.setState({endTimeError: timeFormatError});
    } else {
      this.setState({endTimeError: null});
    }

    if (!this.state.location) {
      this.setState({locationError: this.requiredMsg()});
      okay = false;
    } else if (this.state.location.length > 60) {
      this.setState({locationError: this.tooLongMsg(60)});
      okay = false;
    } else {
      this.setState({locationError: null});
    }

    if (this.state.description.length > 560) {
      this.setState({descriptionError: this.tooLongMsg(560)});
      okay = false;
    } else if (this.state.description.split(/\r\n|\r|\n/).length > 5) {
      this.setState({descriptionError: "Field has too many lines. Must be no more than 5 lines"});
      okay = false;
    } else if (!this.state.description) {
      this.setState({descriptionError: this.requiredMsg()});
      okay = false;
    } else {
      this.setState({descriptionError: null});
    }

    if (!okay) {
      this.setState({pageError: "Validation error. See fields for details."});
    }

    return okay;
  };

  render() {
    return authClient.isAuthenticated() && (
      <div className='event-entry-page'>
        <LoadingOverlay
          active={this.state.isLoading}
          spinner
          text='Contacting the other side...'
        >
          <h2>{this.isEditMode() ? "Edit Event" : "New Event"}</h2>
          {/* Error message on server fail */}
          { this.state.pageError !== null && <OurSnackbarContent
            onClose={() => this.setState({pageError: null})}
            variant="error"
            message={this.state.pageError}
            style={{marginBottom: 15}}
          />
          }

          {/* Success message on add */}
          { this.state.success && <OurSnackbarContent
            onClose={() => this.setState({success: false})}
            variant="success"
            message={this.isEditMode() ? "Event saved!" : "Event added!"}
            style={{marginBottom: 15}}
          />
          }

          <Grid container spacing={8}>
            {/* Introduction */}
            <Grid item xs={12}>
              <p className="intro">
                Please enter the details for the event. It is <b>your responsibility</b> to make sure your event leaves no trace.
              </p>
            </Grid>

            {/* Event name */}
            <Grid item xs={12}>
              <TextField
                error={this.state.nameError !== null}
                value={this.state.name}
                autoFocus
                onChange={(event) => this.setState({name: event.target.value})}
                id="name"
                label="Event Name"
                fullWidth
              />
              <FormHelperText error>{this.state.nameError}</FormHelperText>
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <TextField
                error={this.state.locationError !== null}
                value={this.state.location}
                autoFocus
                onChange={(event) => this.setState({location: event.target.value})}
                id="name"
                label="Location"
                fullWidth
              />
              <FormHelperText error>{this.state.locationError}</FormHelperText>
            </Grid>

            {/* Day dropdown */}
            <Grid item xs={12}>
              <FormControl>
                <InputLabel htmlFor="day">Day</InputLabel>
                <Select
                  name="day"
                  value={this.state.day}
                  onChange={(event) => this.setState({day: event.target.value})}
                >
                  <MenuItem value={0}>Tuesday</MenuItem>
                  <MenuItem value={1}>Wednesday</MenuItem>
                  <MenuItem value={2}>Thursday</MenuItem>
                  <MenuItem value={3}>Friday</MenuItem>
                  <MenuItem value={4}>Saturday</MenuItem>
                </Select>
                <FormHelperText error>{this.state.dayError}</FormHelperText>
              </FormControl>
            </Grid>

            {/* Start and end time pickers */}
            <Grid item xs={6}>
              <TextField
                error={this.state.startTimeError !== null}
                value={this.state.startTime}
                id="startTime"
                label="Start Time"
                onChange={(event) => this.setState({startTime: event.target.value})}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
              <FormHelperText error>{this.state.startTimeError}</FormHelperText>
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="startTime"
                value={this.state.endTime}
                label="End Time"
                onChange={(event) => this.setState({endTime: event.target.value})}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
              <FormHelperText error>{this.state.endTimeError}</FormHelperText>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                error={this.state.descriptionError !== null}
                value={this.state.description}
                autoFocus
                onChange={(event) => this.setState({description: event.target.value})}
                rows="5"
                variant="outlined"
                id="name"
                label="Description"
                multiline
                fullWidth
              />
              <FormHelperText>560 character maximum</FormHelperText>
              <FormHelperText error>{this.state.descriptionError}</FormHelperText>
            </Grid>

            <Grid item xs={12}>
              {/* Action Buttons */}
              <div className="actions">
                <Button onClick={() => this.props.history.push("/") } color="primary" variant="outlined">
                  Back
                </Button>
                <Button onClick={this.handleSave} color="primary" variant="outlined">
                  Save
                </Button>
              </div>
            </Grid>
          </Grid>
        </LoadingOverlay>
      </div>
    );
  }
}
export default withRouter(withStyles(styles)(EventEntryPage));
