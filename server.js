'use strict';

require('dotenv').config();
///////////////////////////////////////////////////////////////////////
//App dependencies
///////////////////////////////////////////////////////////////////////
const superagent = require('superagent');
const cors = require('cors');
const express = require('express');

///////////////////////////////////////////////////////////////////////
//Initializers
///////////////////////////////////////////////////////////////////////
const PORT = process.env.PORT || 3000;
const server = express();
server.use(cors());

server.get('/location', locationHandler);
server.get('/weather', weatherHandler);
server.use('*', notFound);
server.use(errorHandler);

///////////////////////////////////////////////////////////////////////
//Callback Functions
///////////////////////////////////////////////////////////////////////
function locationHandler(req, res) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.data}&key=${process.env.GEOCODE_API_KEY}`;
  superagent.get(url).then(data => {
    let location = new Location(req.query.data, data.body);
    res.status(200).send(location);
  }).catch(error => errorHandler(error, req, res));
}

//Building a path to /weather
function weatherHandler(req, res) {
  let wetData = require('./data/darksky.json');
  let arr = wetData.daily.data.map(value => {
    return new Forecast(value);
  });
  res.send(arr);
}

function notFound(req, res) {
  res.status(404).send('Not Found');
}

function errorHandler(error, req, res) {
  res.status(500).send(error);
}


///////////////////////////////////////////////////////////////////////
//Constructor Functions
///////////////////////////////////////////////////////////////////////
function Forecast(each) {
  let temp = new Date((each.time) * 1000);
  let tempScr = temp.toUTCString();
  this.forecast = each.summary;
  this.time = tempScr;
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}

server.listen(PORT, () => {
  console.log(`listening on PORT ${PORT}`);
});
