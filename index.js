'use strict';
/* Express server */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const models = require('./models/');

const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Parse JSON bodies
app.use(bodyParser.json());

// Cross-origin resource sharing
app.use(cors());

app.get('/api/events', (req, res) => {
});

// Create an event
app.post('/api/event', (req, res) => {
  let form = {};

  // Trim trailing/leading whitespace.
  ["name", "organizer", "startTime", "endTime", "location", "description"].forEach((k) => {
    form[k] = req.body[k].trim();
  });
  form["day"] = req.body["day"];

  models.Event.count({
    where: {
      name: form.name
    }
  }).then(count => {
    let err = null;
    if (count > 0) {
      err = "Name is not unique";
    } else if (!form.name) {
      err = "Name is required";
    } else if (form.name.length > 60) {
      err = "Name is too long";
    } else if (!form.startTime) {
      err = "Start time is required";
    } else if (!form.startTime.match(/^\d{2}:\d{2}$/)) {
      err = "Internal error processign start time. Contact an administrator.";
    } else if (!form.endTime.match(/^\d{2}:\d{2}$/)) {
      err = "Internal error processing end time. Contact an administrator.";
    } else if (!form.location) {
      err = "Location is required";
    } else if (form.location.length > 60) {
      err = "Location is too long";
    } if (form.description.length > 560) {
      err = "Description is too long";
    } else if (form.description.split(/\r\n|\r|\n/).length > 5) {
      err = "Description has too many lines";
    } else if (!form.description) {
      err = "Description is required";
    } else if (!form.organizer) {
      err = "Organizer is required";
    } else if (!form.day && form.day !== 0) {
      err = "Day is missing. Contact an administrator";
    } else if (!form.day.toString().match(/^\d+$/)) {
      err = "Day not represented as integer. Contact an administrator.";
    } else if (form.day > 4 || form.day < 0) {
      err = "Day out of expected range. Contact an administrator.";
    }

    if (err) {
      res.status(400);
      res.json({error: err});
      return;
    }

    models.Event.create(form).then(event => {
      res.status(200);
      res.json(event.values);
    }).catch(err => {
      res.status(400);
      res.json({error: err.message});
    });
  }).catch(err => {
    res.status(400);
    res.json({error: err.message});
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Event Guide listening on ${port}`);
