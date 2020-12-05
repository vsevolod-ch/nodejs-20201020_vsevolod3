const IdGenerator = require('./id_generator');

function Clients() {
  if (!new.target) new Clients();
  this.ID = new IdGenerator();
  this.clients = new Map();
}

Clients.prototype.setClient = function() {
  const id = this.ID.get();
  const p = new Promise((resolve) => {
    this.clients.set(id, resolve);
  }).then((message) => {
    this.clients.delete(id);
    return message;
  });

  return [id, p];
};

Clients.prototype.deleteClient = function(id) {
  this.clients.delete(id);
};

Clients.prototype.getClients = function() {
  return this.clients.values();
};

Clients.prototype.count = function() {
  return this.clients.size;
};

module.exports = Clients;
