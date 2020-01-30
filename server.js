'use strict';

require('dotenv').config();

// Global variables for server.js
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

const PORT = process.env.PORT;
const app = express();
app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

//this is our grouping of .get's that will grab our information
app.get('/', (request, response) => {
  response.send('This is our Home Page');
});

app.get('/wrong', (request, response) => {
  response.send('OOPS! You did it again. Wrong route.');
});

//Callback functions for information
app.get('/location', locationCallback);
app.get('/weather', weatherCallback);
app.get('/events', eventHandler);


// location callback
function locationCallback (request, response) {
  let city = request.query.city;
  let SQL = `SELECT * FROM locations WHERE searchquery='${city}';`;

  client.query(SQL)
    .then(results => {
      if (results.rows.length > 0){
        response.send(results.rows[0]);
      } else {
        try {
          let key = process.env.GEOCODE_API_KEY;
          let url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;

          superagent.get(url)
            .then( data => {
              const geoData = data.body[0];
              const location = new Location(city, geoData);
              let {search_query, formatted_query, latitude, longitude} = location;
              let apiToSQL = `INSERT INTO locations (searchquery, formattedquery, latitude, longitude) VALUES ('${search_query}','${formatted_query}', '${latitude}', '${longitude}')`;
              client.query(apiToSQL);
              response.send(location);
            })
            .catch( () => {
              errorHandler('location broke', request, response);
            });
        }
        catch(error){
          errorHandler('Error 500! Something has gone wrong with the website server!', request, response);
        }
      }
    })
}

// weather callback
function weatherCallback(request, response) {
  let key = process.env.WEATHER_API_KEY;
  let latitude = request.query.latitude;
  let longitude = request.query.longitude;
  let url = `https://api.darksky.net/forecast/${key}/${latitude},${longitude}`;

  superagent.get(url)
    .then(data => {
      const forecastData = data.body.daily.data.map( obj => {
        return new Weather(obj);
      });
      response.status(200).json(forecastData);
    })
    .catch(() => {
      errorHandler('Error 500! Something has gone wrong with the website server!', request, response);
    });
}

// eventHandler function
function eventHandler(request, response) {
  let city = request.query.searchQuery;
  console.log(request.query, 'this is the request');
  const url = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENTFUL_API_KEY}&location=${city}&date=Future`
  console.log(url);
  superagent.get(url)
    .then(data => {
      let responseJson = JSON.parse(data.text);

      const events = responseJson.events.event.map(data => {
        return new Event(data);
      });
      response.send(events);
    })
    .catch(() => {
      errorHandler('You are SUPER WRONG!', request, response);
    });
}
//constructor function for eventHandler

function Event(event) {
  this.link = event.url;
  this.name = event.title;
  this.event_date = event.start_time;
  this.summary = event.description;
}

// weather constructor
function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0,15);
}

// location constructor
function Location(city, geoData){
  this.searchQuery = city;
  this.formattedQuery = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

// error handler
function errorHandler(error, request, response) {
  response.status(500).send(error);
}

// server listener
client.connect()
  .then( () => {
    app.listen(PORT, () => {
      console.log(`server up on ${PORT}`)
    })
  });
