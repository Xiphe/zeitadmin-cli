'use strict';

module.exports = function spreadFn(fn) {
  return function spread(args) {
    return args.reduce((cFn, argument) => {
      return cFn.call(null, argument);
    }, fn);
  };
};
