const TemperatureSensor = require('./temperature-sensor');
const request = require('request');
const url = require('url');

let sensor = new TemperatureSensor();

const TEMPERATURE_TOKEN = process.env.TEMPERATURE_TOKEN;
const TEMPERATURE_SITE_DOMAIN = process.env.TEMPERATURE_SITE_DOMAIN;

sensor.listen((beacon) => {
  console.log('Posting temperature update');

  let target = url.format({
    protocol: 'http',
    pathname: '/update-temperature',
    host: TEMPERATURE_SITE_DOMAIN
  })

  request.post({
    url: target,
    json: true,
    body: {
      token: TEMPERATURE_TOKEN,
      payload: beacon
    }
  });
});
