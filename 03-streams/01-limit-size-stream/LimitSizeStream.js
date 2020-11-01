const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this._limit = options.limit;
    this._passed = 0;
  }

  _transform(chunk, encoding, callback) {
    const byteLength = chunk.byteLength;
    this._passed += byteLength;
    if (this._passed > this._limit) {
      callback(new LimitExceededError());
      return;
    }
    callback(null, chunk);
  }
}

module.exports = LimitSizeStream;
