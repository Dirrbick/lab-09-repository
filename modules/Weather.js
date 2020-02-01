'use strict';

const superagent = require('superagent');

module.exports = getWeather;


function getWeather(latitude, longitude) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`;

  return superagent.get(url)
    .then(data1 => parseWeather(data1.body));
}
function parseWeather(data2){
  try{
    const forecastData = data2.body.daily.data.map( obj => new Weather(obj));
    return Promise.resolve(forecastData);
  }
  catch(error){
    return Promise.reject(error);
  }
};


function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0,15);
}

// client.connect();
