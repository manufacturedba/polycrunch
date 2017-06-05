const fs = require('fs');
const path = require('path');
const express = require('express');
const server = express();

const PORT = process.env.PORT || 8000;

function serveIndex(req, res, done){
  fs.readFile('dist/index.html', 'utf8', function(err, html){
    if(err) throw err;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
    return done();
  });
}

function forceToSSL(req, res, done) {
  
  if (!req.secure) {
    return res.redirect(301, 'https://' + path.join(req.headers.host + req.url), done);
  }

  return done();
}

server.use(forceToSSL);
server.get('/', serveIndex);
server.get('/about', serveIndex);
server.get('/blog/:blog', serveIndex);
server.get('/resume.pdf', function(req, res, done) {
  return fs.readFile('dist/images/resume.pdf', function(err, content) {
    if (err) throw err;
    res.setHeader('Content-type', 'application/pdf');
    res.write(content);
    res.end();
    return done();
  })
});

server.get('/', express.static('dist'));

server.listen(PORT, function(){
  console.log('Listening at ' + PORT);
});
