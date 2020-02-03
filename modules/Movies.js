'use strict';

const superagent = require('superagent');

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

function Movie(movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.released_date;
}

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

module.exports = movieHandler;
