// dollar sign for global components such as DB connection.
exports.lang = {
  all : {},
  load : function(all){
    this.all = all;
  },
  dollar : function(name){
    return this.all[name];
  }
};

exports.$ = exports.lang.dollar.bind(exports.lang);
