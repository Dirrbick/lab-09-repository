'use strict';

const superagent = require('superagent');
const client = require('./Client');

const location = {};

location.getLocationData = function (city){
  let SQL = `SELECT * FROM locations WHERE searchquery = $1;`;
  let value = [city];

  return client.query(SQL, value)
    .then(results => {
      if(results.rowCount) {return results.rows[0]; }
      else {
        let key = process.env.GEOCODE_API_KEY;
        let url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;

        return superagent.get(url)
          .then (data => storedLocation(city, data.body));
      }
    });
};

function storedLocation(city, data){
  const location = new Location(data[0]);
  let SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude)
      VALUES ($1, $2, $3, $4)
      RETURNING *;`;
  let values = [city, location.formatted_query, location.latitude, location.longitude];
  return client.query(SQL, values)
    .then(results => results.rows[0]);
}

function Location(data){
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}

client.connect();

module.exports = location;
