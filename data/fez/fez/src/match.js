var ProxyFile = require("./proxy-file.js").ProxyFile,
    ProxyFileList = require("./proxy-file.js").ProxyFileList;

function Match(fn, setStage, resetStage, initialGlobs) {
  this.fn = fn;
  this.setStage = setStage;
  this.resetStage = resetStage;
  this.initialGlobs = initialGlobs;
}

Match.prototype.not = function(globs) {
  var fn = this.fn;

  return new Match(function(file) {
    return fn(file) && !any(toArray(globs).map(function(glob) {
      minimatch(file, glob);
    }));
  }, this.setStage, this.resetStage, this.initialGlobs);
};

Match.prototype.each = function(fn) {
  var proxy = new ProxyFile(),
      stage = { input: this.fn, rules: [], tasks: [], proxy: proxy, operations: [], initialGlobs: this.initialGlobs };
  this.setStage(stage);
  fn(proxy);
  this.resetStage();
  return stage;
};

Match.prototype.one = function(fn) {
  var proxy = new ProxyFile(),
      stage = { input: this.fn, rules: [], tasks: [], proxy: proxy, one: true, matched: false, operations: [], initialGlobs: this.initialGlobs };
  this.setStage(stage);
  fn(proxy);
  this.resetStage();
  return stage;
};

Match.prototype.all = function(fn) {
  var proxy = new ProxyFileList(),
      stage = { input: this.fn, rules: [], multi: true, proxy: proxy, operations: [], initialGlobs: this.initialGlobs };
  this.setStage(stage);
  fn(proxy);
  this.resetStage();
  return stage;
};

module.exports = Match;
