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
server.get('/trails', trailsHandler);
server.use('*', notFound);
server.use(errorHandler);

///////////////////////////////////////////////////////////////////////
//Callback Functions
///////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
//Not Found
function notFound(req, res) {
  res.status(404).send('Not Found');
}
///////////////////////////////////////////////////////////////////////
//Error Handler
function errorHandler(error, req, res) {
  res.status(500).send(error);
}
///////////////////////////////////////////////////////////////////////
//Build a path to Location (lat/lng)
function locationHandler(req, res) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.data}&key=${process.env.GEOCODE_API_KEY}`;
  superagent.get(url).then(data => {
    let location = (new Location(req.query.data, data.body));
    res.status(200).send(location);
  }).catch(error => errorHandler(error, req, res));
}
///////////////////////////////////////////////////////////////////////
//Building a path to /weather
function weatherHandler(req, res) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${req.query.data.latitude},${req.query.data.longitude}`;
  superagent.get(url).then(data => {
    const weatherSum = data.body.daily.data.map(value => {
      return new Forecast(value);
    });
    res.status(200).json(weatherSum);
  }).catch(error => errorHandler(error, req, res));
}
///////////////////////////////////////////////////////////////////////
//Build a path to Trails
function trailsHandler(req, res) {
  const url = `https://www.hikingproject.com/data/get-trails?lat=${req.query.data.latitude}&lon=${req.query.data.longitude}&key=${process.env.TRAIL_API_KEY}`
  superagent.get(url).then(data => {
    let trailData = data.body.trails.map(value => {
      return new Trail(value);
    });
    res.status(200).json(trailData);
  }).catch(error => errorHandler(error, req, res));
}


///////////////////////////////////////////////////////////////////////
//Constructor Functions
///////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
//Forecast Constructor
function Forecast(each) {
  let temp = new Date((each.time) * 1000);
  let tempScr = temp.toUTCString().slice(0, 16);
  this.forecast = each.summary;
  this.time = tempScr;
}
///////////////////////////////////////////////////////////////////////
//Location Constructor
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}
///////////////////////////////////////////////////////////////////////
//Trail Constructor
function Trail(trailData){
  this.name = trailData.name;
  this.location = trailData.location;
  this.length = trailData.length;
  this.stars = trailData.stars;
  this.star_votes = trailData.starVotes;
  this.summary = trailData.summary;
  this.trail_url = trailData.url;
  this.conditions = `${trailData.conditionStatus}, ${trailData.conditionDetails}`
  this.condition_date = trailData.conditionDate.slice(0,9);
  this.condition_time = trailData.conditionDate.slice(11,18);
}


server.listen(PORT, () => {
  console.log(`listening on PORT ${PORT}`);
});
