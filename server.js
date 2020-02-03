'use strict';

require('dotenv').config();

// Global variables for server.js
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT;
const app = express();
app.use(cors());


//this is our grouping of .get's that will grab our information
app.get('/', (request, response) => {
  response.send('This is our Home Page');
});

app.get('/wrong', (request, response) => {
  response.send('OOPS! You did it again. Wrong route.');
});

const locationCallback = require('./modules/Location.js');
const weatherCallback = require('./modules/Weather.js');
const eventHandler = require('./modules/Events.js');
const movieHandler = require('./modules/Movies.js');
const yelpHandler = require('./modules/Yelp.js');


//Respond to front-end requests
app.get('/location', locationCallback);
app.get('/weather', weatherCallback);
app.get('/events', eventHandler);
app.get('/movies', movieHandler);
app.get('/yelp', yelpHandler);

// error handler
function errorHandler(error, request, response) {
  response.status(500).send(error);
}

// server listener
app.listen(PORT, () => {
  console.log(`server up on ${PORT}`);
});
