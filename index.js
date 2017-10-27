const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const Primus = require('primus');
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;

const DEAD_SECRET = process.env.DEAD_SECRET || Math.random();
const MONGODB_URI = process.env.MONGODB_URI;
const mongoUri = MONGODB_URI || 'mongodb://localhost:27017/polycrunch';


const deferredClient = new Promise((resolve, reject) => {
  return MongoClient.connect(mongoUri, function(err, db) {
    if (err) {
      return reject(err);
    }

    return resolve(db);
  });
});

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

function crowTongue(db) {
  return new Promise((resolve, reject) => {
    const collection = db.collection('crypt');
    return collection.find({}, { _id: 0 }).toArray((err, docs) => {
      if (err) {
        return reject(err);
      }

      return resolve(docs);
    })
  });
}

function mixBoneBits(db, { link, name, recording }) {
  return new Promise((resolve, reject) => {
    const collection = db.collection('crypt');
    return collection.insertOne({
        source: {
          link,
          name
        },
        recording
      }, (err, docs) => {
        if (err) {
          return reject(err);
        }

        return resolve(docs);
    });
  });
}

app.post('/add-grave-dust', function(req, res, done) {

  if (req.body.token !== DEAD_SECRET) {
    return res.status(500).send('A curse on your family!!');
  }

  const { link, name, recording } = req.body.payload;

  deferredClient
  .then(db => mixBoneBits(db, {
    link,
    name,
    recording
  }))
  .then(() => res.status(200).send('The dead shall rise'))
  .catch(err => {
    console.error(err);
    res.status(500).send('Oopsies, I broke!');
  });
});

app.get('/witches-brew', function(req, res, done) {
  deferredClient
  .then(db => crowTongue(db))
  .then(catFaces => res.json(catFaces))
  .catch(err => {
    console.error(err);
    res.status(500).send('Oopsies, I broke!');
  });
});

loadStaticAppRoutes();

server.listen(PORT, function(){
  console.log('Listening at ' + PORT);
});
