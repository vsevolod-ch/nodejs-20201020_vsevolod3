const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');

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
    case 'POST':
      const serverError = () => {
        res.statusCode = 500;
        res.end('server error');
      };
      // open to write but must be failed if the file is already exist.
      const writer = fs.createWriteStream(filepath, {flags: 'wx'});
      const limitStream = new LimitSizeStream({limit: 1048576});
      writer.on('error', (err) => {
        switch (err.code) {
          case 'EEXIST':
            res.statusCode = 409;
            res.end(err.message);
            break;
          case 'EACCESS':
            res.statusCode = 403;
            res.end(err.message);
            break;
          default:
            serverError();
        }
      });
      writer.on('close', () => {
        res.statusCode = 201;
        res.end('success');
      });
      limitStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        if (err instanceof LimitExceededError) {
          res.statusCode = 413;
          res.end('filesize limit is exceeded');
          return;
        };
        serverError();
      });
      req.on('aborted', () => {
        fs.unlink(filepath, serverError);
      });
      // res.on('close', () => {
      //   if (res.finished) return;
      //   fs.unlink(filepath, serverError);
      // });

      req.pipe(limitStream).pipe(writer);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
