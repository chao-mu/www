import React from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  FormHelperText,
  Grid,
  withStyles,
} from '@material-ui/core';

import LoadingOverlay from 'react-loading-overlay';

import axios from 'axios';

import OurSnackbarContent from "./OurSnackbarContent";
import getServerErr from "../util";

const styles = theme => ({
  notice: {
    marginBottom: 15
  }
});

class AddEvent extends React.Component {
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
    loc: "",
    locError: null,
    desc: "",
    descError: null,
    isLoading: false,
    pageError: null,
    success: false,
  };

  state = this.initialState;

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  tooLongMsg = (maxLength) => {
    return "Name is too long. Must be no more than " + maxLength + " characters";
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
      day: this.state.day,
      name: this.state.name,
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      location: this.state.loc,
      description: this.state.desc,
    }).then((resp) => {
      // Clear the form and communicate success. Leave it open.
      this.props.onAdd();
      this.setState({...this.initialState, open: true, success: true});
    }).catch((err) => {
      this.setState({pageError: getServerErr(err)});
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
    } else {
      this.setState({startTimeError: null});
    }

    if (!this.state.endTime) {
      this.setState({endTimeError: this.requiredMsg()});
      okay = false;
    } else {
      this.setState({endTimeError: null});
    }

    if (!this.state.loc) {
      this.setState({locError: this.requiredMsg()});
      okay = false;
    } else if (this.state.loc.length > 60) {
      this.setState({locError: this.tooLongMsg(60)});
      okay = false;
    } else {
      this.setState({locError: null});
    }

    if (this.state.desc.length > 560) {
      this.setState({descError: this.tooLongMsg(560)});
      okay = false;
    } else if (this.state.desc.split(/\r\n|\r|\n/).length > 5) {
      this.setState({descError: "Field has too many lines. Must be no more than 5 lines"});
      okay = false;
    } else if (!this.state.desc) {
      this.setState({descError: this.requiredMsg()});
      okay = false;
    } else {
      this.setState({descError: null});
    }

    if (!okay) {
      this.setState({pageError: "Validation error. See fields for details."});
    }

    return okay;
  };

  render() {
    return (
      <span>
        <Button variant="outlined" color="default" onClick={this.handleClickOpen}>
          Add Event
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <LoadingOverlay
            active={this.state.isLoading}
            spinner
            text='Contacting the other side...'
          >

          <DialogTitle id="form-dialog-title">Add Event</DialogTitle>
          <DialogContent>
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
                message="Event added!"
                style={{marginBottom: 15}}
              />
            }

            <Grid container spacing={8}>
              {/* Introduction */}
              <Grid item xs={12}>
                <DialogContentText>
                  Please enter the details for the event. It is <b>your responsibility</b> to make sure your event leaves no trace.
                </DialogContentText>
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
                  error={this.state.locError !== null}
                  value={this.state.loc}
                  autoFocus
                  onChange={(event) => this.setState({loc: event.target.value})}
                  id="name"
                  label="Location"
                  fullWidth
                />
                <FormHelperText error>{this.state.locError}</FormHelperText>
              </Grid>

              {/* Day dropdown */}
              <Grid item xs={4}>
                <FormControl>
                  <InputLabel htmlFor="day">Day</InputLabel>
                  <Select
                    name="day"
                    value={this.state.day}
                    onChange={(event) => this.setState({day: event.target.value})}
                  >
                    <MenuItem value="0">Tuesday</MenuItem>
                    <MenuItem value="1">Wednesday</MenuItem>
                    <MenuItem value="2">Thursday</MenuItem>
                    <MenuItem value="3">Friday</MenuItem>
                    <MenuItem value="4">Saturday</MenuItem>
                  </Select>
                  <FormHelperText error>{this.state.dayError}</FormHelperText>
                </FormControl>
              </Grid>

              {/* Start and end time pickers */}
              <Grid item xs={4}>
                <TextField
                  error={this.state.startTimeError !== null}
                  value={this.state.startTime}
                  id="startTime"
                  label="Start Time"
                  type="time"
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
              <Grid item xs={4}>
                <TextField
                  id="startTime"
                  value={this.state.endTime}
                  label="End Time"
                  type="time"
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
                  error={this.state.descError !== null}
                  value={this.state.desc}
                  autoFocus
                  onChange={(event) => this.setState({desc: event.target.value})}
                  rows="5"
                  variant="outlined"
                  id="name"
                  label="Description"
                  multiline
                  fullWidth
                />
                <FormHelperText>560 character maximum</FormHelperText>
                <FormHelperText error>{this.state.descError}</FormHelperText>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <DialogActions>
              <Button onClick={this.handleClose} color="primary" variant="outlined">
                Quit
              </Button>
              <Button onClick={this.handleSave} color="primary" variant="outlined">
                Save
              </Button>
            </DialogActions>
          </DialogContent>
        </LoadingOverlay>
      </Dialog>
    </span>
    );
  }
}
export default withStyles(styles)(AddEvent);
