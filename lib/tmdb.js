'use strict';

const _ = require('lodash');
const config = require('config');

const flashheart = require('flashheart').createClient({
  retries: 2,
  retryTimeout: config.get('themoviedb.requestDelay')
});

flashheart.request = flashheart.request.defaults({
  baseUrl: config.get('themoviedb.host'),
  qs: {
    api_key: config.get('themoviedb.apiKey')
  }
});

function isForeign(movie) {
  return movie.original_language !== 'en' || _.includes(_.map(movie.genres, 'name'), 'Foreign') || _.includes(movie.genre_ids, 10769);
}

module.exports.getMovie = function(movieId, cb) {
  flashheart.get(`/movie/${movieId}`, {
    qs: {
      append_to_response: 'trailers'
    }
  }, (err, body) => {
    if (err) return cb(err);

    if (isForeign(body)) return cb(null, null);

    const genres = _.map(body.genres, 'name');

    const movie = {
      id: body.id,
      imdbId: body.imdb_id,
      backdrop: body.backdrop_path,
      genres: genres,
      language: body.original_language,
      title: body.original_title,
      overview: body.overview,
      poster: body.poster_path,
      releaseDate: body.release_date,
      runtime: body.runtime,
      status: body.status,
      tagline: body.tagline,
      trailers: _.get(body, 'trailers.youtube', [])
    };

    cb(null, movie);
  });
};

module.exports.getMovieIdsByGenre = function(genreId, page, cb) {
  flashheart.get(`/genre/${genreId}/movies`, {
    qs: {
      page: page
    }
  }, (err, body) => {
    if (err) return cb(err);

    const movieIds = _(body.results).reject(isForeign).map('id').value();

    return cb(null, movieIds);
  });
};
