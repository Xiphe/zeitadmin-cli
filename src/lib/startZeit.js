'use strict';

const ms = require('ms');
const Deferred = require('../Deferred');

module.exports = options => db => (rawZeit) => {
  const d = new Deferred();
  const now = new Date().getTime();
  const durationMs = /^\d+$/.test(options.duration) ?
    parseInt(options.duration, 10) : ms(options.duration);

  if (typeof durationMs !== 'number' || durationMs <= 1000) {
    throw new Error(`Can not create zeit with duration of ${options.duration}`);
  }

  const zeit = Object.assign({}, rawZeit, {
    duration: durationMs,
    start: now,
    end: now + durationMs,
  });

  db.put(zeit, (err, response) => {
    if (err) {
      d.reject(new Error('unable to start zeit'));

      return;
    }

    d.resolve(Object.assign({}, zeit, response));
  });

  return d.promise;
};
