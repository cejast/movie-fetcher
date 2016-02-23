'use strict';

const assert = require('assert');
const redis = require('../../lib/redis');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();

const movie = require('../fixtures/movie');
const movieId = movie.id;

const db = require('../../lib/db');

describe('db', () => {
  describe('save', () => {
    let multi;

    beforeEach(() => {
      multi = {
        set: sandbox.stub().returnsThis(),
        sadd: sandbox.stub().returnsThis(),
        exec: sandbox.stub().yields()
      };

      sandbox.stub(redis, 'multi').returns(multi);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('saves the movie', (done) => {
      db.save('horror', movie, (err) => {
        assert.ifError(err);
        sinon.assert.calledWith(multi.set, `movie:${movieId}`, JSON.stringify(movie));
        done();
      });
    });

    it('saves the movie key to its genre set', (done) => {
      db.save('horror', movie, (err) => {
        assert.ifError(err);
        sinon.assert.calledWith(multi.sadd, 'horror', `movie:${movieId}`);
        done();
      });
    });

    it('returns an error when redis returns an array of errors', (done) => {
      multi.exec.yields([new Error('multi error 1'), new Error('multi error 2')]);

      db.save('horror', movie, (err) => {
        assert.ok(err);
        assert.equal(err.message, 'multi error 1; multi error 2');
        done();
      });
    });
  });
});
