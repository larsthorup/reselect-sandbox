const R = require('ramda');

const cacheResultOf = fn => {
  let cache = null;
  return (...args) => {
    const result = fn.apply(null, args);
    if (R.equals(cache, result)) {
      return cache;
    } else {
      cache = result;
      return result;
    }
  };
};

module.exports = cacheResultOf;
