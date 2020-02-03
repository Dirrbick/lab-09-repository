'use strict';

const superagent = require('superagent');


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

function Yelp(review) {
  this.name = review.name;
  this.image_url = review.image_url;
  this.price = review.price;
  this.rating = review.rating;
  this.url = review.url;
}

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

module.exports = yelpHandler;
