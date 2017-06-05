const fs = require('fs');
const path = require('path');
const restify = require('restify');
const server = restify.createServer();

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
  console.log(req.connection.domain);

  if (!req.socket.localPort) {
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

server.get(/.*/, restify.serveStatic({
  directory: __dirname + '/dist',
  default: 'index.html'
}));

server.listen(process.env.PORT || 8000, function(){
  console.log('Listening at ' + server.url);
});
