const R = require('ramda');

const cacheResultOf = (selector) => {
  let cache = null;
  return (...args) => {
    const result = selector.apply(null, args);
    if (R.equals(cache, result)) {
      return cache;
    } else {
      cache = result;
      return result;
    }
  };
};

module.exports = cacheResultOf;
