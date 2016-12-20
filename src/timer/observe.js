'use strict';

const Deferred = require('../Deferred');
const progress = require('./progress');
let currentId = null;

function filter(doc) {
  if (currentId && doc._id !== currentId) {
    return false;
  }

  return doc.end > new Date().getTime() || doc.pause || doc._id === currentId;
}

function hasRunningZeit(db) {
  const d = new Deferred();
  let zeitRuns = false;

  db.changes({ filter })
    .on('change', () => {
      zeitRuns = true;
    }).on('complete', () => {
      d.resolve(zeitRuns);
    }).on('error', (err) => {
      d.reject(`[ERR] ${err}`);
    });

  return d.promise;
}

module.exports = options => (db) => {
  (options.tail ? Promise.resolve(true) : hasRunningZeit(db))
    .then((zeitRuns) => {
      if (!zeitRuns) {
        console.log('there is no zeit');
        return;
      }

      let prog = null;

      const changes = db.changes({
        live: true,
        include_docs: true,
        filter,
      }).on('change', (change) => {
        if (currentId && change.doc._id !== currentId) {
          return;
        }

        if (currentId && change.doc._deleted) {
          currentId = null;
          prog.terminate();
          console.log('Zeit canceled ...');
          return;
        }

        if (change.doc._id === currentId && change.doc.pause) {
          prog.pause();
          return;
        }

        if (change.doc._id === currentId) {
          prog.terminate();
        }

        prog = progress(change.doc, () => {
          currentId = null;
          if (!options.tail) {
            changes.cancel();
            db.cancelSync();
          }
        });

        currentId = change.doc._id;
      }).on('complete', (info) => {
        console.log('[OK]  done');
      }).on('error', (err) => {
        console.log(`[ERR] ${err}`);
      });
    });
};
