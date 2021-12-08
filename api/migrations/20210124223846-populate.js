'use strict';

const async = require("async");

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  let columns = [                  'id',                                      'type'];
  db.insert('round_types', columns, ["dfc359ce-30bf-408d-b74f-a6ede8ef42df",    "random5" ], inserted);
  db.insert('round_types', columns, ["c0ab40df-3f38-4de0-ad3c-24011b29b9e9",    "random10"], inserted);
  db.insert('round_types', columns, ["53a83387-42b2-4c17-b3ab-2a1a3c873085",    "random15"], inserted);
  db.insert('round_types', columns, ["e75bc4be-91b0-40ec-9bf8-903d4cfc0748",    "random20"], inserted);

  columns = [                  'id',                                      'ldap_dn',    'name'];
  db.insert('users', columns, ["369ef5bf-c94f-4d00-9a9c-2b2ed5dda734",    "Admin",      "Admin"], inserted);
  return null;
};

exports.down = function(db, callback) {
  async.series([], callback);
};
exports._meta = {
  "version": 1
};

const inserted = function() {
  console.log('Inserted entry!');
}