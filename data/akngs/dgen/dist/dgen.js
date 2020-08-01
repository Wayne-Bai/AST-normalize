var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function(require, exports) {
    exports.version = '0.2.0';
    (function (rngs) {
        var defaultRandom = new Random();
        var RNG = (function () {
            function RNG(seed) {
                this._rnd = seed !== undefined ? new Random(seed) : defaultRandom;
            }
            RNG.prototype.next = function () {
                throw new Error('Not Implemented');
            };
            return RNG;
        })();
        rngs.RNG = RNG;        
        var Preset = (function (_super) {
            __extends(Preset, _super);
            function Preset(values) {
                        _super.call(this, undefined);
                this._index = 0;
                this._values = values;
            }
            Preset.prototype.next = function () {
                var next = this._values[this._index % this._values.length];
                this._index++;
                return next;
            };
            return Preset;
        })(RNG);
        rngs.Preset = Preset;        
        var Uniform = (function (_super) {
            __extends(Uniform, _super);
            function Uniform(seed) {
                if (typeof seed === "undefined") { seed = undefined; }
                        _super.call(this, seed);
            }
            Uniform.prototype.next = function () {
                return this._rnd.random();
            };
            return Uniform;
        })(RNG);
        rngs.Uniform = Uniform;        
        var Normal = (function (_super) {
            __extends(Normal, _super);
            function Normal(mu, sigma) {
                        _super.call(this, undefined);
                this._mu = mu;
                this._sigma = sigma;
            }
            Normal.prototype.next = function () {
                return this._rnd.normal(this._mu, this._sigma);
            };
            return Normal;
        })(RNG);
        rngs.Normal = Normal;        
        var Pareto = (function (_super) {
            __extends(Pareto, _super);
            function Pareto(alpha) {
                        _super.call(this, undefined);
                this._alpha = alpha;
            }
            Pareto.prototype.next = function () {
                return this._rnd.pareto(this._alpha);
            };
            return Pareto;
        })(RNG);
        rngs.Pareto = Pareto;        
    })(exports.rngs || (exports.rngs = {}));
    var rngs = exports.rngs;
    (function (seqs) {
        var defaultRNG = new rngs.Uniform();
        var Sequence = (function () {
            function Sequence() {
                this._map = function (n) {
                    return n;
                };
            }
            Sequence.prototype._next = function () {
                throw new Error('Not Implemented');
            };
            Sequence.prototype.next = function () {
                return this._map(this._next());
            };
            Sequence.prototype.array = function (len, norm) {
                if (typeof norm === "undefined") { norm = new norms.Identity(); }
                var data = new Array(len);
                for(var i = 0; i < len; i++) {
                    data[i] = this.next();
                }
                return norm.normalize(data);
            };
            Sequence.prototype.setMap = function (mapFunction) {
                this._map = mapFunction;
                return this;
            };
            Sequence.prototype.getMap = function () {
                return this._map;
            };
            return Sequence;
        })();
        seqs.Sequence = Sequence;        
        var Constant = (function (_super) {
            __extends(Constant, _super);
            function Constant(value) {
                if (typeof value === "undefined") { value = 0; }
                        _super.call(this);
                this._constant = value;
            }
            Constant.prototype._next = function () {
                return this._constant;
            };
            Constant.prototype.setConstant = function (constant) {
                this._constant = constant;
                return this;
            };
            Constant.prototype.getConstant = function () {
                return this._constant;
            };
            return Constant;
        })(Sequence);
        seqs.Constant = Constant;        
        var Cycle = (function (_super) {
            __extends(Cycle, _super);
            function Cycle(pattern) {
                if (typeof pattern === "undefined") { pattern = [
                    0, 
                    1
                ]; }
                        _super.call(this);
                this._index = 0;
                this._pattern = pattern;
            }
            Cycle.prototype._next = function () {
                var index = this._index % this._pattern.length;
                var result = this._pattern[index];
                this._index++;
                return result;
            };
            Cycle.prototype.setPattern = function (pattern) {
                this._pattern = pattern;
                return this;
            };
            Cycle.prototype.getPattern = function () {
                return this._pattern;
            };
            return Cycle;
        })(Sequence);
        seqs.Cycle = Cycle;        
        var Arithmetic = (function (_super) {
            __extends(Arithmetic, _super);
            function Arithmetic(start, step) {
                if (typeof start === "undefined") { start = 0; }
                if (typeof step === "undefined") { step = 1; }
                        _super.call(this);
                this._start = start;
                this._step = step;
                this._cur = start;
            }
            Arithmetic.prototype._next = function () {
                var result = this._cur;
                this._cur += this._step;
                return result;
            };
            Arithmetic.prototype.setStart = function (start) {
                this._start = start;
                this._cur = start;
                return this;
            };
            Arithmetic.prototype.getStart = function () {
                return this._start;
            };
            Arithmetic.prototype.setStep = function (step) {
                this._step = step;
                return this;
            };
            Arithmetic.prototype.getStep = function () {
                return this._step;
            };
            return Arithmetic;
        })(Sequence);
        seqs.Arithmetic = Arithmetic;        
        var Geometric = (function (_super) {
            __extends(Geometric, _super);
            function Geometric(start, ratio) {
                if (typeof start === "undefined") { start = 1; }
                if (typeof ratio === "undefined") { ratio = 2; }
                        _super.call(this);
                this._start = start;
                this._ratio = ratio;
                this._cur = start;
            }
            Geometric.prototype._next = function () {
                var result = this._cur;
                this._cur *= this._ratio;
                return result;
            };
            Geometric.prototype.setStart = function (start) {
                this._start = start;
                this._cur = start;
                return this;
            };
            Geometric.prototype.getStart = function () {
                return this._start;
            };
            Geometric.prototype.setRatio = function (ratio) {
                this._ratio = ratio;
                return this;
            };
            Geometric.prototype.getRatio = function () {
                return this._ratio;
            };
            return Geometric;
        })(Sequence);
        seqs.Geometric = Geometric;        
        var Random = (function (_super) {
            __extends(Random, _super);
            function Random(rng, min, max) {
                if (typeof rng === "undefined") { rng = defaultRNG; }
                if (typeof min === "undefined") { min = -Infinity; }
                if (typeof max === "undefined") { max = +Infinity; }
                        _super.call(this);
                this._rng = rng;
                this._min = min;
                this._max = max;
            }
            Random.prototype._next = function () {
                var result = this._rng.next();
                if(result < this._min) {
                    result = this._min;
                }
                if(result > this._max) {
                    result = this._max;
                }
                return result;
            };
            Random.prototype.setRng = function (rng) {
                this._rng = rng;
                return this;
            };
            Random.prototype.getRng = function () {
                return this._rng;
            };
            Random.prototype.setMin = function (min) {
                this._min = min;
                return this;
            };
            Random.prototype.getMin = function () {
                return this._min;
            };
            Random.prototype.setMax = function (max) {
                this._max = max;
                return this;
            };
            Random.prototype.getMax = function () {
                return this._max;
            };
            return Random;
        })(Sequence);
        seqs.Random = Random;        
        var RandomWalk = (function (_super) {
            __extends(RandomWalk, _super);
            function RandomWalk(rng, start, min, max) {
                if (typeof rng === "undefined") { rng = defaultRNG; }
                if (typeof start === "undefined") { start = 0.5; }
                if (typeof min === "undefined") { min = 0; }
                if (typeof max === "undefined") { max = 1; }
                        _super.call(this);
                this._rng = rng;
                this._start = start;
                this._cur = start;
                this._min = min;
                this._max = max;
            }
            RandomWalk.prototype._next = function () {
                var result = this._cur;
                var direction = defaultRNG.next() > 0.5 ? -1 : +1;
                this._cur += this._rng.next() * direction;
                if(this._cur > this._max) {
                    this._cur = this._max;
                }
                if(this._cur < this._min) {
                    this._cur = this._min;
                }
                return result;
            };
            RandomWalk.prototype.setRng = function (rng) {
                this._rng = rng;
                return this;
            };
            RandomWalk.prototype.getRng = function () {
                return this._rng;
            };
            RandomWalk.prototype.setStart = function (start) {
                this._start = start;
                this._cur = start;
                return this;
            };
            RandomWalk.prototype.getStart = function () {
                return this._start;
            };
            RandomWalk.prototype.setMin = function (min) {
                this._min = min;
                return this;
            };
            RandomWalk.prototype.getMin = function () {
                return this._min;
            };
            RandomWalk.prototype.setMax = function (max) {
                this._max = max;
                return this;
            };
            RandomWalk.prototype.getMax = function () {
                return this._max;
            };
            return RandomWalk;
        })(Sequence);
        seqs.RandomWalk = RandomWalk;        
        var Combine = (function (_super) {
            __extends(Combine, _super);
            function Combine(seqs) {
                if (typeof seqs === "undefined") { seqs = []; }
                        _super.call(this);
                this._seqs = [];
                for(var i = 0; i < seqs.length; i++) {
                    var seq = seqs[i];
                    this._seqs[i] = _isArray(seq) ? new Cycle(seq) : seq;
                }
            }
            Combine.prototype._next = function () {
                var result = 0;
                for(var i = 0; i < this._seqs.length; i++) {
                    var seq = this._seqs[i];
                    result += seq.next();
                }
                return result;
            };
            Combine.prototype.add = function (seq) {
                this._seqs.push(_isArray(seq) ? new Cycle(seq) : seq);
                return this;
            };
            return Combine;
        })(Sequence);
        seqs.Combine = Combine;        
        var Repeat = (function (_super) {
            __extends(Repeat, _super);
            function Repeat(seq, count) {
                if (typeof count === "undefined") { count = 2; }
                        _super.call(this);
                this._seq = seq;
                this._count = count;
                this._curValue = 0;
                this._curCount = +Infinity;
            }
            Repeat.prototype._next = function () {
                if(this._curCount >= this._count) {
                    this._curValue = this._seq.next();
                    this._curCount = 0;
                }
                this._curCount++;
                return this._curValue;
            };
            Repeat.prototype.setCount = function (count) {
                this._count = count;
                return this;
            };
            Repeat.prototype.getCount = function () {
                return this._count;
            };
            return Repeat;
        })(Sequence);
        seqs.Repeat = Repeat;        
        function _isArray(value) {
            return Object.prototype.toString.call(value) === '[object Array]';
        }
    })(exports.seqs || (exports.seqs = {}));
    var seqs = exports.seqs;
    (function (norms) {
        var Normalizer = (function () {
            function Normalizer() { }
            Normalizer.prototype.normalize = function (data) {
                throw new Error('Not Implemented');
            };
            return Normalizer;
        })();
        norms.Normalizer = Normalizer;        
        var Identity = (function (_super) {
            __extends(Identity, _super);
            function Identity() {
                _super.apply(this, arguments);

            }
            Identity.prototype.normalize = function (data) {
                return data;
            };
            return Identity;
        })(Normalizer);
        norms.Identity = Identity;        
        var Minmax = (function (_super) {
            __extends(Minmax, _super);
            function Minmax(min, max) {
                if (typeof min === "undefined") { min = 0; }
                if (typeof max === "undefined") { max = 1; }
                        _super.call(this);
                this._min = min;
                this._max = max;
            }
            Minmax.prototype.normalize = function (data) {
                var _this = this;
                var smin = +Infinity;
                var smax = -Infinity;
                data.forEach(function (d) {
                    if(d < smin) {
                        smin = d;
                    }
                    if(d > smax) {
                        smax = d;
                    }
                });
                var srange = smax - smin;
                var trange = this._max - this._min;
                var ratio = trange / srange;
                return data.map(function (d) {
                    return (d - smin) * ratio + _this._min;
                });
            };
            return Minmax;
        })(Normalizer);
        norms.Minmax = Minmax;        
        var Sum = (function (_super) {
            __extends(Sum, _super);
            function Sum(sum) {
                if (typeof sum === "undefined") { sum = 1; }
                        _super.call(this);
                this._sum = sum;
            }
            Sum.prototype.normalize = function (data) {
                var ssum = 0;
                data.forEach(function (d) {
                    return ssum += d;
                });
                var ratio = ssum === 0 ? 0 : this._sum / ssum;
                return data.map(function (d) {
                    return d * ratio;
                });
            };
            return Sum;
        })(Normalizer);
        norms.Sum = Sum;        
    })(exports.norms || (exports.norms = {}));
    var norms = exports.norms;
})
//@ sourceMappingURL=file:////Users/alankang/Devs/prjs/dgen/src/dgen.js.map
