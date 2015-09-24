var Sequelize = require("sequelize");
var utils = require("../utils")
var sequelize;
var dataStructures = {};


module.exports.initialize = function (cb) {
  sequelize = new Sequelize("glitch", "root", "", {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    omitNull: true
  });

  dataStructures['users'] = sequelize.define('users', {
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    salt: Sequelize.STRING
  });

  dataStructures['messages'] = sequelize.define('messages', {
    text: Sequelize.STRING
  });

  dataStructures['songs'] = sequelize.define('songs', {
    location: Sequelize.STRING,
    duration: Sequelize.INTEGER,
    artist: Sequelize.STRING,
    title: Sequelize.STRING
  });

  dataStructures['users'].hasMany(dataStructures['messages']);

  sequelize.sync({force:true}).then(cb);
};

module.exports.dbInsertObject = function (table, newObj) {
  if(table === 'users') {
    dataStructures[table].findOrCreate(newObj)
      .spread(function(user, created) {
        if(created) {
          return user;
        }
        else {
          return null;
        }
    });
  }
  else {
    var newEntry = dataStructures[table].create(newObj);
    return newEntry.save();
  }
};

module.exports.findElement = findElement = function(table, targetObj) {
  return dataStructures[table].findOne(targetObj);
};

module.exports.checkLogin = function ()
