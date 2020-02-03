'use strict';
const superagent = require('superagent');

const client = require('./Client.js');


function locationCallback (request, response) {
  let city = request.query.city;
  let SQL = `SELECT * FROM locations WHERE searchquery='${city}';`;

  client.query(SQL)
    .then(results => {
      if (results.rows.length > 0){
        response.send(results.rows[0]);
      } else {
        let key = process.env.GEOCODE_API_KEY;
        let url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;

        return superagent.get(url)
          .then( data => {
            const geoData = data.body[0];
            const location = new Location(city, geoData);
            let {search_query, formatted_query, latitude, longitude} = location;
            let apiToSQL = `INSERT INTO locations (searchquery, formattedquery, latitude, longitude) VALUES ('${search_query}','${formatted_query}', '${latitude}', '${longitude}')`;
            client.query(apiToSQL);
            response.send(location);
          });
      }
    })
    .catch(() => ('error', console.error()));
}

function Location(city, geoData){
  this.searchQuery = city;
  this.formattedQuery = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

module.exports = locationCallback;
