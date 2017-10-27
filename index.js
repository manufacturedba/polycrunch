const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const Primus = require('primus');
const bodyParser = require('body-parser')

const app = express();
const server = http.createServer(app);
const primus = new Primus(server);

const TEMPERATURE_TOKEN = process.env.TEMPERATURE_TOKEN;
const PORT = process.env.PORT || 8000;

function forceToSSL(req, res, done) {

  if (req.headers['x-forwarded-proto'] === 'https') {
    return done();
  }

  return res.redirect(301, 'https://' + path.join(req.headers.host + req.url));
}

app.enable('trust proxy');
app.use(bodyParser.json());
app.use(forceToSSL);

const ROOT = '/';
const APP_ROUTES = [ROOT, 'about', 'spooky', 'blog/:blog'];
const STATIC_FOLDER = 'dist';

function loadStaticAppRoutes() {
  APP_ROUTES.forEach(route => app.use(path.join(ROOT, route), express.static(STATIC_FOLDER)));
}

loadStaticAppRoutes();
app.post('/update-temperature', function(req, res, done) {

  if (req.body.token === TEMPERATURE_TOKEN) {
    console.log('Updating temperature');

    const temp = req.body.payload.tlm.temp;
    const message = 'Temperature in my office is ' + Math.round(temp * 1.8 + 32) + '°';

    primus.forEach(function(spark) {
      spark.write(message);
    }, function(err) {
      console.log(err);
    });
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }

  done();
});

server.listen(PORT, function(){
  console.log('Listening at ' + PORT);
});
