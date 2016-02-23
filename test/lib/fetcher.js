'use strict';

const _ = require('lodash');
const assert = require('assert');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const tmdb = require('../../lib/tmdb');

const fetcher = require('../../lib/fetcher');

const expectedMovies = [{
  id: '1'
}, {
  id: '2'
}];

function stubMovie(movie) {
  tmdb.getMovie.withArgs(movie.id).yields(null, movie);
}

describe('fetcher', () => {
  beforeEach(() => {
    sandbox.stub(tmdb, 'getMovieIdsByGenre').yields(null, _.map(expectedMovies, 'id'));
    sandbox.stub(tmdb, 'getMovie');
    expectedMovies.forEach(stubMovie);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('.fetchPage', () => {
    it('returns a list of movies', (done) => {
      fetcher.fetchPage('123', 1, (err, movies) => {
        assert.ifError(err);
        assert.strictEqual(movies.length, 2);
        assert.deepEqual(movies, expectedMovies);
        done();
      });
    });

    it('filters out null values', (done) => {
      tmdb.getMovie.withArgs('2').yields(null, null);

      fetcher.fetchPage('123', 1, (err, movies) => {
        assert.ifError(err);
        assert.strictEqual(movies.length, 1);
        assert.deepEqual(movies, [expectedMovies[0]]);
        done();
      });
    });

    it('returns an error if fetching a genre page fails', (done) => {
      tmdb.getMovieIdsByGenre.yields(new Error('failed request'), null);

      fetcher.fetchPage('123', 1, (err) => {
        assert.ok(err);
        assert.equal(err.message, 'failed request');
        done();
      });
    });

    it('returns an error if fetching a movie', (done) => {
      tmdb.getMovie.withArgs('1').yields(new Error('failed request'));

      fetcher.fetchPage('123', 1, (err) => {
        assert.ok(err);
        assert.equal(err.message, 'failed request');
        done();
      });
    });
  });
});
