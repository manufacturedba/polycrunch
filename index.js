const fs = require('fs');
const path = require('path');
const express = require('express');
const server = express();

const PORT = process.env.PORT || 8000;

function forceToSSL(req, res, done) {

  if (req.headers['x-forwarded-proto'] === 'https') {
    return done();
  }

  return res.redirect(301, 'https://' + path.join(req.headers.host + req.url));
}

server.enable('trust proxy');
server.use(forceToSSL);

server.use('/',  express.static('dist'));
server.use('/about',  express.static('dist'));
server.use('/blog/:blog',  express.static('dist'));

server.listen(PORT, function(){
  console.log('Listening at ' + PORT);
});
