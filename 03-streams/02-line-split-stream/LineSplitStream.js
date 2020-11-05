const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this._line = '';
  }

  _transform(chunk, encoding, callback) {
    const string = chunk.toString('utf-8');
    for (const char of string) {
      if (char === os.EOL) {
        this.push(this._line);
        this._line = '';
      } else this._line += char;
    }
    callback();
  }

  _flush(callback) {
    callback(null, this._line);
  }
}

module.exports = LineSplitStream;
