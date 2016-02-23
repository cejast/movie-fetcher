'use strict';

function* nextPage(limit) {
  if (!limit) limit = 50;

  let page = 1;

  while (true) { // eslint-disable-line no-constant-condition
    if (page > limit) {
      page = 1;
    }

    yield page++;
  }
}

module.exports = function(limit) {
  const generator = nextPage(limit);

  return {
    get: () => {
      return generator.next().value;
    }
  };
};
