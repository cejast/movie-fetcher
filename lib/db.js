'use strict';

const _ = require('lodash');
const redis = require('./redis');

function createMovieKey(movieId) {
  return `movie:${movieId}`;
}

function handleMultiError(err) {
  return new Error(_.map(err, 'message').join('; '));
}

module.exports.save = function(genre, movie, cb) {
  const key = createMovieKey(movie.id);

  redis.multi()
    .sadd(genre, key)
    .set(key, JSON.stringify(movie))
    .exec((err) => {
      if (err) return cb(handleMultiError(err));
      cb(null, null);
    });
};
