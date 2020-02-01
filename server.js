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

//Respond to front-end requests
app.get('/location', locationCallback);
app.get('/weather', weatherCallback);
app.get('/events', eventHandler);
app.get('/movies', movieHandler);
app.get('/yelp', yelpHandler);

//Modules call functions
const location = require('./modules/Location.js');
const weather = require('./modules/Weather.js');

// location callback
function locationCallback (request, response) {
  let city = request.query.city;
  console.log(request.query);
  location.getLocationData(city)
    .then( data => sendJson(data, response))
    .catch((error) => errorHandler(error, request, response));
}

function weatherCallback (request, response){
  const {latitude, longitude} = request.query;
  weather(latitude, longitude)
    .then( summaries => sendJson(summaries, response))
    .catch((error) => errorHandler(error, request, response));
}

// weather callback

// eventHandler function

function eventHandler(request, response) {
  let city = request.query.searchQuery;
  const url = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENTFUL_API_KEY}&location=${city}&date=Future`;
  
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

//MovieHandler function

function movieHandler(request, response) {
  let city = request.query.searchQuery;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${city}&page=1&include_adult=false`;
  superagent.get(url)
    .then(data=> {
      const movies = JSON.parse(data.text).results.map(obj => {
        return new Movie(obj);
      });
      response.send(movies);
    })
    .catch(() => {
      errorHandler('You are SUPER WRONG!', request, response);
    });
}

function yelpHandler(request, response) {
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  const url = `https://api.yelp.com/v3/businesses/search?term=delis&latitude=${lat}&longitude=${lon}`;
  console.log(url);
  superagent.get(url).set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(data=> {
      console.log(JSON.parse(data.text).businesses);
      const reviews = JSON.parse(data.text).businesses.map(obj => {
        return new Yelp(obj);
      });
      response.send(reviews);
    })
    .catch(() => {
      errorHandler('You are SUPER WRONG!', request, response);
    });

}


//.......................API constractors................//

//yelp constractor

function Yelp(review) {
  this.name = review.name;
  this.image_url = review.image_url;
  this.price = review.price;
  this.rating = review.rating;
  this.url = review.url;
}

//Movie constractor

function Movie(movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.released_date;
}

//eventHandler constructor

function Event(event) {
  this.link = event.url;
  this.name = event.title;
  this.event_date = event.start_time;
  this.summary = event.description;
}


// error handler
function errorHandler(error, request, response) {
  response.status(500).send(error);
}

function sendJson(data, response){
  response.status(200).send(data);
}

// server listener
app.listen(PORT, () => console.log(`server up on ${PORT}`));
