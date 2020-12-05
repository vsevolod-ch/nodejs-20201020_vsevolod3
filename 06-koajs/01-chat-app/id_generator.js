const generator = function* () {
  while (true) {
    for (let i = 1; i < Number.MAX_SAFE_INTEGER; i++) yield i;
  }
};

const IdGenerator = function() {
  // eslint-disable-next-line no-unused-vars
  if (!new.target) return new IdGenerator();
  const gen = generator();
  this.gen = gen;
};

IdGenerator.prototype.get = function() {
  return this.gen.next().value;
};

module.exports = IdGenerator;
