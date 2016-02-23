'use strict';

const _ = require('lodash');
const async = require('async');
const config = require('config');
const requestDelay = config.get('themoviedb.requestDelay');

const tmdb = require('./tmdb');

function getMoviesWithDelay(movieIds, cb) {
  async.mapSeries(movieIds, (movieId, done) => {
    setTimeout(() => {
      tmdb.getMovie(movieId, done);
    }, requestDelay);
  }, (err, movies) => {
    if (err) return cb(err);

    return cb(null, _.compact(movies));
  });
}

module.exports.fetchPage = function(genreId, page, cb) {
  async.waterfall([
    async.apply(tmdb.getMovieIdsByGenre, genreId, page),
    function getMovies(results, done) {
      getMoviesWithDelay(results, (err, movies) => {
        if (err) return done(err);

        return done(null, movies);
      });
    }
  ], cb);
};
