$tenjoh.addComponent('Cache', function() {
    var Cache = function() {
        var self = this;
        self.has = function(key) {
            return sessionStorage.getItem(key) !== null;
        };
        self.get = function(key) {
            if (self.has(key)) {
                return JSON.parse(sessionStorage.getItem(key));
            } else {
                return null;
            }
        };
        self.set = function(key, object) {
            sessionStorage.setItem(key, JSON.stringify(object));
        };
        self.remove = function(key) {
            var obj = self.get(key);
            sessionStorage.removeItem(key);
            return obj;
        };
        self.clear = function() {
            sessionStorage.clear();
        };
    };

    return new Cache();
});