'use strict';

const async = require("async");

var dbm;
var type;
var seed;

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  async.series([
    db.createTable.bind(db, 'users', user),
    db.createTable.bind(db, 'games', game),
    db.createTable.bind(db, 'contestants', contestant),
    db.createTable.bind(db, 'competitions', competition),
    db.createTable.bind(db, 'matches', match),
    db.createTable.bind(db, 'submissions', submission),
    db.createTable.bind(db, 'rounds', round),
    db.createTable.bind(db, 'round_types', roundType),
    db.createTable.bind(db, 'files', file),
    db.createTable.bind(db, 'prog1scores', prog1scores),
  ], callback);
};

exports.down = function(db, callback) {
  async.series([
    db.dropTable.bind(db, 'users'),
    db.dropTable.bind(db, 'games'),
    db.dropTable.bind(db, 'contestants'),
    db.dropTable.bind(db, 'competitions'),
    db.dropTable.bind(db, 'matches'),
    db.dropTable.bind(db, 'submissions'),
    db.dropTable.bind(db, 'rounds'),
    db.dropTable.bind(db, 'round_types'),
    db.dropTable.bind(db, 'files'),
  ], callback);
};

exports._meta = {
  "version": 5
};

const user = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false
    },
    ldap_dn: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    created: {
      type: 'timestamp',
      defaultValue: new String('CURRENT_TIMESTAMP')
    },
  },
  ifNotExists: true
};

const prog1scores = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false
    },
    competition_id: {
      type: 'string',
    },
    submission_id: {
      type: 'string',
    },
    easy_wins: {
      type: 'int',
    },
    easy_losses: {
      type: 'int',
    },
    medium_wins: {
      type: 'int',
    },
    medium_losses: {
      type: 'int',
    },
    hard_wins: {
      type: 'int',
    },
    hard_losses: {
      type: 'int',
    },
  },
  ifNotExists: true
};

const game = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false
    },
    name: {
      type: 'string',
    },
    game_description: {
      type: 'text',
    },
    submission_description: {
      type: 'text',
    },
    image_file_id: {
      type: 'string',
    },
    game_pack_file_id: {
      type: 'string',
    },
  },
  ifNotExists: true
};

const contestant = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false
    },
    user_id: {
      type: 'string',
    },
    competition_id: {
      type: 'string',
    },
    created: {
      type: 'timestamp',
      defaultValue: new String('CURRENT_TIMESTAMP')
    },
    active_submission_id: {
      type: 'string'
    },
  },
  ifNotExists: true
};

const competition = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false
    },
    game_id: {
      type: 'string',
    },
    competition_name: {
      type: 'string',
    },
    start: {
      type: 'string',
    },
    end: {
      type: 'string',
    },
    banner_page: {
      type: 'text',
    },
    allowed_submissions: {
      type: 'int'
    },
    active_round_type_id: {
      type: 'string'
    },
    created: {
      type: 'timestamp',
      defaultValue: new String('CURRENT_TIMESTAMP')
    },
    active_round: {
      type: 'int'
    },
  },
  ifNotExists: true
};

const match = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false
    },
    competition_id: {
      type: 'string',
    },
    round: {
      type: 'string',
    },
    submission_id_1: {
      type: 'string',
    },
    submission_id_2: {
      type: 'string',
    },
    submission_id_winner: {
      type: 'string',
    },
    log_file_id: {
      type: 'string',
    },
    additional_data: {
      type: 'text',
    },
    created: {
      type: 'timestamp',
      defaultValue: new String('CURRENT_TIMESTAMP')
    },
  },
  ifNotExists: true
};

const submission = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false
    },
    contestant_id: {
      type: 'string',
    },
    version: {
      type: 'int'
    },
    file_id: {
      type: 'string'
    },
    additional_data: {
      type: 'text',
    },
    created: {
      type: 'timestamp',
      defaultValue: new String('CURRENT_TIMESTAMP')
    },
  },
  ifNotExists: true
};


const round = {
  columns: {
    id: {
      type: 'int',
        notNull: true,
        primaryKey: true,
        autoIncrement: true,
        length: 10
    },
    round_type_id: {
      type: 'string',
    },
  },
  ifNotExists: true
}

const roundType = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false
    },
    type: {
      type: 'string',
    },
  },
  ifNotExists: true
}

const file = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false
    },
    path: {
      type: 'string',
    },
    open: {
      type: 'int',
    },
    created: {
      type: 'timestamp',
      defaultValue: new String('CURRENT_TIMESTAMP')
    },
  },
  ifNotExists: true
}