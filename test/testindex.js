const crypto = require('crypto');

function hash(mensaje) {
  const hash = crypto.createHash('sha256');
  hash.update(mensaje);
  return hash.digest('hex');
}

module.exports = hash;
