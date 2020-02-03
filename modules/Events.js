'use strict';

const superagent = require('superagent');

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

function Event(event) {
  this.link = event.url;
  this.name = event.title;
  this.event_date = event.start_time;
  this.summary = event.description;
}

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

module.exports = eventHandler;
