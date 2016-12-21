'use strict';

const PouchDB = require('pouchdb');
const Deferred = require('../Deferred');

module.exports = dbPostfix => (remoteDB) => {
  const d = new Deferred();
  const db = new PouchDB(`zeit${dbPostfix || ''}`);

  db.sync(remoteDB)
    .on('complete', () => {
      const sync = db.sync(remoteDB, { live: true, retry: true });

      db.cancelSync = () => sync.cancel();

      d.resolve(db);
    }).on('error', () => {
      d.reject(new Error('Could not replicate remoteDB'));
    });

  return d.promise;
};
