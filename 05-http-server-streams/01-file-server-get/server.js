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
    res.end('incorrect path.');
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      const reader = fs.createReadStream(filepath);
      reader.on('error', (err) => {
        switch (err.code) {
          case 'ENOENT':
            res.statusCode = 404;
            res.end('not found');
            break;
          case 'EACCES':
            res.statusCode = 403;
            res.end('forbidden');
            break;
          default:
            res.statusCode = 500;
            res.end('server error');
        }
      });
      reader.pipe(res);
      // reader.on('data', (chunk) => {
      //   const status = res.write(chunk);
      //   if (!status) {
      //     reader.pause();
      //     res.once('drain', () => {
      //       reader.resume();
      //     });
      //   }
      // });
      // reader.on('end', () => {
      //   res.end();
      // });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
