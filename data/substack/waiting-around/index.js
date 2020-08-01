var yarn = require('./static/yarn');
var createSpot = require('./lib/spot');

module.exports = function (images, opts) {
    return new Queue(images, opts);
};

function Queue (images, opts) {
    var self = this;
    self.element = yarn('queue.html', [ 'queue.css' ]);
    self.spots = [];
    
    if (!opts) opts = {};
    self.width = opts.width || window.innerWidth || 800;
    self.height = opts.height || 300;
    
    if (Array.isArray(images)) {
        self.image = function () {
            var res = images[Math.floor(Math.random() * images.length)];
            if (Array.isArray(res)) {
                return { file : res[0], scale : res[1] || 1 };
            }
            else if (typeof res === 'object') {
                return res;
            }
            else {
                return { file : res, scale : 1 };
            }
        };
    }
    else if (typeof images === 'object') {
        self.image = function () {
            var keys = Object.keys(images);
            var key = keys[Math.floor(Math.random() * keys.length)];
            return { file : key, scale : images[key] };
        };
    }
    else if (typeof images === 'function') {
        self.image = images;
    }
    else throw new Error('images must be an array or function');
}

Queue.prototype.appendTo = function (target) {
    target.appendChild(this.element);
};

Queue.prototype.resize = function (width, height) {
    this.width = width;
    this.height = height;
    this.spots.forEach(function (s, n) {
        s.size = { width : width, height : height };
        s.spot(n);
    });
};

Queue.prototype.reset = function () {
    this.lastSpot = undefined;
    this.spots.splice(0).forEach(function (s) {
        s.remove();
    });
};

Queue.prototype.spot = function (spot, total) {
    var self = this;
    
    for (var i = self.spots.length; i <= total; i++) {
        var im = self.image();
        var s = createSpot({
            file : im.file,
            scale : im.scale,
            spot : self.spots.length + 1,
            size : {
                width : self.width,
                height : self.height
            }
        });
        s.appendTo(self.element);
        self.spots.push(s);
    }
    
    if (self.lastSpot && spot < self.lastSpot) {
        self.spots.splice(0, self.lastSpot - spot)
            .forEach(function (s) { s.remove() })
        ;
    }
    
    if (total < self.spots.length) {
        self.spots.splice(total - self.spots.length)
            .forEach(function (s) { s.remove() })
        ;
    }
    
    if (!self._me) {
        self.spots.forEach(function (s, n) {
            if (n === spot - 1) {
                self._me = s;
                s.setType('me');
                s.showLabel('');
            }
            else {
                s.setType('other');
            }
        });
    }
    
    self.spots.forEach(function (s, n) {
        s.spot(n);
    });
    
    self.lastSpot = spot;
};
