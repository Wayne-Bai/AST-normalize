var fs = require("fs"),
    pfName = ".profiles",
    components = require("../components");

if(!fs.existsSync(pfName)) {
  fs.writeFileSync(pfName, JSON.stringify({profiles:[]}, null, 2));;
}

var data = JSON.parse(fs.readFileSync(pfName));

function newStruct() {
  var struct = {};
  Object.keys(components).forEach(function(c) {
    struct[c] = {};
    Object.keys(components[c]).forEach(function(k) {
      if(components[c][k].run) {
        struct[c][k] = false;
      }
    });
  });
  return struct;
}

var Profile = function(struct) {
  this.struct = struct ? struct : newStruct();
  if(!struct) { data.profiles.push(this.struct); }
};

Profile.prototype = {
  getCategories: function() {
    return Object.keys(this.struct);
  },
  getEntries: function(category) {
    return Object.keys(this.struct[category]);
  },
  getName: function() {
    var name = [];
    var self = this;
    self.getCategories().forEach(function(heading) {
      self.getEntries(heading).forEach(function(entry) {
        if(self.struct[heading][entry]) { name.push(entry); }
      });
    });
    return name.join(", ");
  },
  toggle: function(category, entry) {
    this.struct[category][entry] = !this.struct[category][entry];
  },
  asLabel: function(category, entry) {
    return "[" + (this.struct[category][entry]? 'x':' ') + "] " + entry;
  },
  discard: function() {
    data.profiles.pop();
  },
  save: function() {
    fs.writeFileSync(pfName, JSON.stringify(data, null, 2));;
  }
};

module.exports = {
  Profile: Profile,
  getProfiles: function() {
    return data.profiles;
  },
  getRunProfile: function(idx) {
    if(idx < 0) return false;
    if (data.profiles.length > idx) {
      return new Profile(data.profiles[idx]);
    }
    return false;
  }
};
