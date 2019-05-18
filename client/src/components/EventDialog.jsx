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

import OurSnackbarContent from "./OurSnackbarContent";

const styles = theme => ({
  notice: {
    marginBottom: 15
  }
});

class EventDialog extends React.Component {
  state = {
    day: this.props.event.day,
    dayError: null,
    name: this.props.event.name,
    nameError: null,
    startTime: this.props.event.startTime,
    startTimeError: null,
    endTime: this.props.event.endTime,
    endTimeError: null,
    location: this.props.event.location,
    locationError: null,
    description: this.props.event.description,
    descriptionError: null,
    success: false,
    validationError: null,
  };

  getError = () => {
    return this.props.error !== null ? this.props.error : this.state.validationError;
  };

  handleClose = () => {
    this.props.handleClose();
  };

  tooLongMsg = (maxLength) => {
    return "Name is too long. Must be no more than " + maxLength + " characters";
  };

  requiredMsg = () => {
    return "Field is required";
  }

  handleSave = () => {
    if (!this.validateForm()) {
      return;
    }

    this.props.handleSave({
      day: this.state.day,
      name: this.state.name,
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      location: this.state.location,
      description: this.state.description,
      id: this.props.id
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
      this.setState({validationError: "Validation error. See fields for details."});
    }

    return okay;
  };


  render() {
    return (
        <Dialog
          open={this.props.open}
          onClose={this.props.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <LoadingOverlay
            active={this.props.isLoading}
            spinner
            text='Contacting the other side...'
          >

          <DialogTitle id="form-dialog-title">Add Event</DialogTitle>
          <DialogContent>
            {/* Error message on server fail */}
            { this.getError() !== null && <OurSnackbarContent
                variant="error"
                message={this.getError()}
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
                  error={this.state.locationError !== null}
                  value={this.state.location}
                  autoFocus
                  onChange={(event) => this.setState({loc: event.target.value})}
                  id="name"
                  label="Location"
                  fullWidth
                />
                <FormHelperText error>{this.state.locationError}</FormHelperText>
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
    );
  }
}

export default withStyles(styles)(EventDialog);
