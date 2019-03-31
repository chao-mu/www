/* Express server */

const express = require('express');
const path = require('path');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'dev.sqlite'
});

const Event = sequelize.define('events', {
  name: {
    type: Sequelize.STRING,
    unique: true,
  },
  organizer: Sequelize.STRING,
  location: Sequelize.STRING,
  day: Sequelize.INTEGER,
  startTime: Sequelize.STRING,
  endTime: Sequelize.STRING,
  description: Sequelize.TEXT,
  createdBy: Sequelize.STRING,
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Parse JSON bodies
app.use(bodyParser.json());

// Cross-origin resource sharing
app.use(cors());

// Create an event
app.post('/api/event', (req, res) => {
  let form = req.body;

  // Trim trailing/leading whitespace.
  ["name", "organizer", "startTime", "endTime", "loc", "desc"].forEach((k) => {
    form[k] = form[k].trim();
  });

  Post.count({
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
    } else if (!form.endTime) {
      err = "End time is required";
    } if (!form.loc) {
      err = "Location is required";
    } else if (form.loc.length > 60) {
      err = "Location is too long";
    } if (form.desc.length > 560) {
      err = "Description is too long";
    } else if (form.desc.split(/\r\n|\r|\n/).length > 5) {
      err = "Description has too many lines";
    } else if (!form.desc) {
      err = "Description is required";
    } else if (!form.organizer) {
      err = "Organizer is required";
    }

    if (err) {
      res.status(400);
      res.json({error: err});
      return;
    }

    res.status(200);
    res.json({});
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
