'use strict';

const _ = require('lodash');
const config = require('config');
const async = require('async');
const db = require('./lib/db');
const movieFetcher = require('./lib/fetcher');
const pageGenerator = require('./lib/page-generator')(config.get('themoviedb.pageLimit'));

const genreMapping = require('./config/genreMapping');
const genreIds = _.keys(genreMapping.id);

function getAllGenreMovies(page, cb) {
  async.mapSeries(genreIds, (genreId, done) => {
    movieFetcher.fetchPage(genreId, page, (err, movies) => {
      if (err) {
        console.error(err.message); // eslint-disable-line no-console
        return done();
      }

      const genre = genreMapping.id[genreId];

      console.log(`Fetched ${movies.length} ${genre} movies from page ${page}`); // eslint-disable-line no-console

      async.each(movies, _.partial(db.save, genre), done);
    });
  }, cb);
}

async.forever((cb) => {
  getAllGenreMovies(pageGenerator.get(), cb);
});
