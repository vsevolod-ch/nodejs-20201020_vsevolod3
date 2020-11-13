const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();
const regex = /(\/|\\|\.\.)/g;

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  if (regex.test(pathname)) {
    res.statusCode = 400;
    res.end('incorrect path');
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      fs.unlink(filepath, (err) => {
        if (!err) {
          res.statusCode = 200;
          res.end('success');
          return;
        }
        switch (err.code) {
          case 'ENOENT':
            res.statusCode = 404;
            res.end('not found');
            break;
          case 'EACCESS':
            res.statusCode = 403;
            res.end('forbidden');
            break;
          default:
            res.statusCode = 500;
            res.end('server error');
        }
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
