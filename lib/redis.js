'use strict';

const config = require('config');
const redis = require('redis');

const host = config.get('redis.host');
const port = config.get('redis.port');
const auth = config.get('redis.password');

module.exports = (function() {
  const opts = {
    host: host,
    port: port,
    enable_offline_queue: false
  };

  const client = redis.createClient(opts);

  if (auth) {
    client.auth(auth);
  }

  client.on('error', (err) => {
    console.error(err.message); // eslint-disable-line no-console
  });

  return client;
})();
