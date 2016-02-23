'use strict';

const assert = require('assert');

const pageGenerator = require('../../lib/page-generator');

describe('page-generator', () => {
  it('returns a page number of 1 on the first call', () => {
    const nextPage = pageGenerator();

    assert.strictEqual(nextPage.get(), 1);
  });

  it('returns a page number of 2 on the second call', () => {
    const nextPage = pageGenerator();

    assert.strictEqual(nextPage.get(), 1);
    assert.strictEqual(nextPage.get(), 2);
  });

  it('returns a page number of 1 when beyond the page limit', () => {
    const nextPage = pageGenerator(3);

    assert.strictEqual(nextPage.get(), 1);
    assert.strictEqual(nextPage.get(), 2);
    assert.strictEqual(nextPage.get(), 3);
    assert.strictEqual(nextPage.get(), 1);
  });

  it('defaults to a limit of 50', () => {
    const nextPage = pageGenerator();

    for (let i = 1; i <= 50; i++) {
      nextPage.get();
    }

    assert.strictEqual(nextPage.get(), 1);
    assert.strictEqual(nextPage.get(), 2);
  });
});
