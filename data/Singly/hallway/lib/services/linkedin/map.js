exports.ptype = 107; // must be unique per service, see dMap.js

exports.update = {
  at: 'timestamp',
  id: function(data) {
    // linkedin says updateKey is unique, ITS NOT!
    // http://jeremie.com/i/1385019d0c49d378883066e60abfc697.png
    var content = data.updateKey + ' ' + JSON.stringify(data.updateContent);
    return require('crypto').createHash('md5').update(content).digest('hex');
  },
  urls: function(data) {
    // only status updates have links?
    if (data.updateType !== 'STAT') return undefined;
    if (!data.updateContent ||
       typeof data.updateContent.currentStatus !== "string") {
      return undefined;
    }
    var url = require('url');
    var urls = {};
    var regexToken = /((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/g;
    // when you use /g on a regex it magically maintains state between .exec()
    // calls, CRAZY TIMES!
    var matchArray;
    // This seems odd, but it works around an issue in the
    // regex that exponentialy gets more complex with trailing
    // . characters on urls
    var text = data.updateContent.currentStatus;
    text = text.replace(/([\.!]{10})/g, " $1");
    // Another oddity work around
    text = text.replace("\uff09", ")");
    while( (matchArray = regexToken.exec(text)) !== null )
    {
        var str = matchArray[0];
        // gotta do sanity cleanup for url.parse, it makes no assumptions I
        // guess :/
        if (str.substr(0,4).toLowerCase() !== "http") str = "http://" + str;
        var u = url.parse(str);
        if (!u.host || u.host.indexOf(".") <= 0 ||
           u.host.length - u.host.indexOf(".") < 3) {
          continue; // TODO: fully normalize
        }
        // empty hash is nothing, normalize that by a pound
        if (u.hash === '#') u.hash = '';
        var uf = url.format(u);
        urls[uf] = true;
    }
    urls = Object.keys(urls);
    return urls.length > 0 ? urls : undefined;
  }

};

exports.profile = {
  photo: 'pictureUrl',
  text: 'headline',
  entities: function(data) { // array of any bio aspect entity name
    var ret = [];
    if (data.positions && Array.isArray(data.positions.values)) {
      data.positions.values.forEach(function(pos){
        if (pos.company) ret.push({name: pos.company.name, type: 'com'});
      });
    }
    return ret.length > 0 ? ret : undefined;
  },
  oembed: function(data) {
    var ret = {type:'contact'};
    ret.url = data.publicProfileUrl;
    ret.title = data.firstName + ' ' + data.lastName;
    ret.description = data.headline;
    if (data.pictureUrl) ret.thumbnail_url = data.pictureUrl;
    if (data.positions && Array.isArray(data.positions.values))
    {
      var workat = "";
      data.positions.values.forEach(function(pos){
        if (!pos.company || !pos.company.name) return;
        if (!pos.isCurrent) return;
        if (workat.length > 0) workat += "; ";
        workat += pos.company.name;
      });
      if (workat.length > 0) ret.work = workat;
    }
    if (data.emailAddress) ret.email = data.emailAddress;
    ret.provider_name = 'linkedin';
    ret.id = data.id;
    if (data.location && data.location.name) ret.location = data.location.name;
    return ret;
  }
};

exports.defaults = {
  connections: 'profile',
  updates: 'update',
  network: 'update',
  self: 'profile'
};

exports.types = {
  news: ['linklink:linkedin/updates'],
  news_feed: ['linklink:linkedin/network'],
  contacts: ['profile:linkedin/connections']
};

exports.pumps = {
  types: {
    update: function(entry) {
      if (!entry.types) entry.types = {};
      if (entry.data.updateType) {
        entry.types[entry.data.updateType.toLowerCase()] = true;
      }
      if (entry.refs) Object.keys(entry.refs).forEach(function(ref){
        if (ref.indexOf(':links/oembed') === -1) return;
        var type = ref.substring(0, ref.indexOf(':'));
        var id = ref.substring(ref.indexOf('#') + 1);
        if (type && type.length > 0) {
          entry.types['link' + type] = id; // substrate type
        }
      });
    }
  }
};
