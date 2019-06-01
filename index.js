'use strict';

/* Express server */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const models = require('./models/');
const csvStringify = require('csv-stringify');
const crypto = require('crypto');
const moment = require('moment');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const sequelize = require('sequelize');

const Op = sequelize.Op;

const app = express();


// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Parse JSON bodies
app.use(bodyParser.json());

// Cross-origin resource sharing
app.use(cors());

let fromMilitary = (time) => moment(time, 'HH:mm').format('hh:mma');

// Convert an Event entity to a displayable plain object
let convertEventDisplayable = (event) => {
  const days = ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  event = event.dataValues;
  event.day = days[event.day];
  event.startTime = fromMilitary(event.startTime);
  event.endTime = fromMilitary(event.endTime);
  delete event.createdBy;
  return event;
}

let getErr = (err) => typeof err === "string" ? err : err.message;

// Create handler that responds with an error message
let handleErr = (res, code) => err => {
  let msg = getErr(err);

  res.status(code);
  res.json({error: msg});
}

// Write 200 status and JSON
let handleSuccess = (res, v) => {
  res.status(200);
  res.json(v);
}

// API endpoint to retrieve events
app.get('/api/event', (req, res) => {
  models.Event.findOne({
    where: {id: req.query.id},
    attributes: ["id", "createdBy", "name", "startTime", "endTime", "location", "description", "day"]
  }).then(
    (row) => handleSuccess(res, row)
  ).catch(handleErr(res, 500));
});

app.get('/api/events', (req, res) => {
  models.Event.findAll({
    order: [
      ["day", "ASC"],
      ["startTime", "ASC"]
    ],
    attributes: ["id", "createdBy", "name", "startTime", "endTime", "location", "description", "day"]
  }).then(
    results => {
      res.status(200);
      if (req.query.format === "csv") {
        let events = results.map((e) => convertEventDisplayable(e));
        csvStringify(events, {header: true}).pipe(res);
      } else {
        let events = results.map((e) => e.dataValues);
        res.json(events);
      }
    }
  ).catch(handleErr(res, 500));
});

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://dev-www.auth0.com/.well-known/jwks.json'
  }),

  // Validate the audience and the issuer.
  audience: '4qhDa1YiGaMibkZr0zKH0Tcx4nbzsg90',
  issuer: 'https://dev-www.auth0.com/',
  algorithms: ['RS256']
});

function findAuthoredEvent(id, sub) {
  if (id === null && id === undefined) {
    return null;
  }

  return models.Event.findOne({
    where: {
      id: id,
      createdBy: sub
    }
  });
}

app.delete("/api/event", checkJwt, (req, res) => {
  models.Event.destroy({
    where: {
      id: req.body["id"],
      createdBy: req.user.sub
    }
  }).then(() => {
    handleSuccess(res, {});
  }).catch(handleErr(res, 500))
});

// Create or save an event
app.post('/api/event', checkJwt, async (req, res) => {
  let form = {};

  // Trim trailing/leading whitespace.
  ["name", "startTime", "endTime", "location", "description"].forEach((k) => {
    form[k] = req.body[k].trim();
  });
  form["day"] = req.body["day"];

  let err = null;

  let toUpdateEvent = await findAuthoredEvent(req.body["id"], req.user.sub).catch(
    innerErr => err = getErr(innerErr)
  );
  if (err) {
    handleErr(res, 500)(err);
    return;
  }

  if (!form.name) {
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
  } else if (!form.day && form.day !== 0) {
    err = "Day is missing. Contact an administrator";
  } else if (!form.day.toString().match(/^\d+$/)) {
    err = "Day not represented as integer. Contact an administrator.";
  } else if (form.day > 4 || form.day < 0) {
    err = "Day out of expected range. Contact an administrator.";
  }

  if (err) {
    handleErr(res, 400)(err);
    return;
  }

  form["createdBy"] = req.user.sub;

  if (toUpdateEvent === null) {
    models.Event.create(form).then(
      event => handleSuccess(res, {})
    ).catch(handleErr(res, 500));
  } else {
    toUpdateEvent.update(form).then(
      () => handleSuccess(res, {})
    ).catch(handleErr(res, 500));
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Event Guide listening on ${port}`);
