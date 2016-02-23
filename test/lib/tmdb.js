'use strict';

const _ = require('lodash');
const nock = require('nock');
const assert = require('assert');
const config = require('config');

const tmdb = require('../../lib/tmdb');

const HOST = config.get('themoviedb.host');
const API_KEY = config.get('themoviedb.apiKey');

const movie = _.cloneDeep(require('../fixtures/movie'));
const genreMovies = _.cloneDeep(require('../fixtures/genreMovies'));

function mockMovieResponse(response) {
  return nock(HOST)
    .get('/movie/293660')
    .query({
      api_key: API_KEY,
      append_to_response: 'trailers'
    })
    .reply(200, response);
}

function mockGenreMoviesResponse(response, page) {
  return nock(HOST)
    .get('/genre/878/movies')
    .query({
      api_key: API_KEY,
      page: page || 1
    })
    .reply(200, response);
}

describe('tmdb', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('.getMovie', () => {
    it('returns a movie', (done) => {
      mockMovieResponse(movie);

      tmdb.getMovie('293660', (err, result) => {
        assert.ifError(err);
        assert.equal(result.id, movie.id);
        done();
      });
    });

    it('returns an empty array when there exists no trailers', (done) => {
      const movieWithoutTrailers = _.cloneDeep(movie);
      delete movieWithoutTrailers.trailers.youtube;

      mockMovieResponse(movieWithoutTrailers);

      tmdb.getMovie('293660', (err, result) => {
        assert.ifError(err);
        assert.deepEqual(result.trailers, []);
        done();
      });
    });

    it('strips genres down to their names', (done) => {
      mockMovieResponse(movie);

      tmdb.getMovie('293660', (err, result) => {
        assert.ifError(err);
        assert.deepEqual(result.genres, ['Comedy', 'Adventure', 'Action', 'Science Fiction']);
        done();
      });
    });

    it('returns null if the original movie language is not English', (done) => {
      const movieNotEnglish = _.cloneDeep(movie);
      movieNotEnglish.original_language = 'ch';

      mockMovieResponse(movieNotEnglish);

      tmdb.getMovie('293660', (err, result) => {
        assert.ifError(err);
        assert.strictEqual(result, null);
        done();
      });
    });

    it('returns null if the movie has a \'Foreign\' genre', (done) => {
      const movieForeign = _.cloneDeep(movie);
      movieForeign.genres.push({
        id: 999,
        name: 'Foreign'
      });

      mockMovieResponse(movieForeign);

      tmdb.getMovie('293660', (err, result) => {
        assert.ifError(err);
        assert.strictEqual(result, null);
        done();
      });
    });

    it('returns an error if the API responds with an error', (done) => {
      nock(HOST)
        .get('/movie/293660')
        .times(3)
        .query({
          api_key: API_KEY,
          append_to_response: 'trailers'
        })
        .reply(500, {
          'status_code': 500,
          'status_message': 'Failed'
        });

      tmdb.getMovie('293660', (err) => {
        assert.ok(err);
        assert.equal(err.statusCode, 500);
        done();
      });
    });

    it('returns an error if the client returns an error', (done) => {
      nock(HOST)
        .get('/movie/293660')
        .times(3)
        .query({
          api_key: API_KEY,
          append_to_response: 'trailers'
        })
        .replyWithError('Failed request');

      tmdb.getMovie('293660', (err) => {
        assert.ok(err);
        assert.ok(err.message.match('Failed request'));
        done();
      });
    });
  });

  describe('.getMovieIdsByGenre', () => {
    it('returns a list of movie IDs', (done) => {
      mockGenreMoviesResponse(genreMovies);

      tmdb.getMovieIdsByGenre('878', 1, (err, results) => {
        assert.ifError(err);
        assert.deepEqual(results, _.map(genreMovies.results, 'id'));
        done();
      });
    });

    it('filters out movies where the original movie language is not English', (done) => {
      const genreMoviesNonEnglish = _.cloneDeep(genreMovies);
      genreMoviesNonEnglish.results[0].original_language = 'ch';

      mockGenreMoviesResponse(genreMoviesNonEnglish);

      tmdb.getMovieIdsByGenre('878', 1, (err, results) => {
        assert.ifError(err);
        assert.strictEqual(results.length, 19);
        done();
      });
    });

    it('filters out movies containing a \'Foreign\' genre ID', (done) => {
      const genreMoviesWithForeign = _.cloneDeep(genreMovies);
      genreMoviesWithForeign.results[0].genre_ids.push(10769);

      mockGenreMoviesResponse(genreMoviesWithForeign);

      tmdb.getMovieIdsByGenre('878', 1, (err, results) => {
        assert.ifError(err);
        assert.strictEqual(results.length, 19);
        done();
      });
    });

    it('returns an error if the API responds with an error', (done) => {
      nock(HOST)
        .get('/genre/878/movies')
        .times(3)
        .query({
          api_key: API_KEY,
          page: 1
        })
        .reply(500, {
          'status_code': 500,
          'status_message': 'Failed'
        });

      tmdb.getMovieIdsByGenre('878', 1, (err) => {
        assert.ok(err);
        assert.equal(err.statusCode, 500);
        done();
      });
    });

    it('returns an error if the client returns an error', (done) => {
      nock(HOST)
        .get('/genre/878/movies')
        .times(3)
        .query({
          api_key: API_KEY,
          page: 1
        })
        .replyWithError('Failed request');

      tmdb.getMovieIdsByGenre('878', 1, (err) => {
        assert.ok(err);
        assert.ok(err.message.match('Failed request'));
        done();
      });
    });
  });
});
