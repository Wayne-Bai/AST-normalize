var config = require("./../config.js");
var Sequelize = require("sequelize");
var sequelize = new Sequelize(config.mysql_table, config.mysql_username, config.mysql_password,
  {
    define:{
    underscored: false,
    freezeTableName: true
  }
  })
models ={
  example: require("./../models/example.js")
}

Example = sequelize.define("example", models.example)
Example.sync();
module.exports = {
  getAll:function(callback){
    Example.findAll().success(function(es){
      callback(null,es);
    }).error(function(error){
      callback(error);
    });
  }
}
