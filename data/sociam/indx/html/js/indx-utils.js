/* jshint undef: true, strict:false, trailing:false, unused:false */
/* global require, exports, console, process, module, L, angular, _, jQuery */

(function() {
	angular
		.module('indx')
		.factory('utils',function() {
			var DEBUG=0, INFO=1, LOG=2, WARN=3, ERROR=4, DEBUG_LEVEL = DEBUG;
			var jQ = jQuery;
			return {
				DEBUG_LEVELS: { INFO:INFO, LOG:LOG, WARN:WARN, ERROR:ERROR },
				SEVEN_DAYS_USEC : 5*24*60*60*1000, 
				TWENTY_FOUR_HOURS_USEC : 24*60*60*1000,
				DOW_SHORT: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
				DOW_FULL:['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
				MON_SHORT : ['Jan','Feb','Mar','Apr','May','Jun','July','Aug','Sep','Oct','Nov','Dec'],
				startofDay: function(d) { 
					d = new Date(d);
					d.setHours(0);
					d.setMinutes(0);
					d.setSeconds(0);
					d.setMilliseconds(0);
					return d;
				},
				toISODateString:function(d) { 
					return [d.getFullYear(), this.padded(d.getMonth() + 1), this.padded(d.getDate())].join('-');
				},
				toISOTimeString:function(t) { 
					return this.padded(t.getHours())+":"+this.padded(t.getMinutes());
				},
				padded:function(n) { 
					return n < 10 ? '0'+n : ''+n;
				},
				setDebugLevel:function(lvl) {	DEBUG_LEVEL = lvl; return lvl; },
                uuid: function(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});},
                toBlankDict:function(L) {
                	var o = {};
                	L.map(function(l) { o[l] = true; });
                	return o;
                },
				toQueryTime : function(date) {	
					return date.toISOString().slice(0,-5);	// chop off the .000Z or queries don't like it
				}, 
                zip:function(a1,a2) {
                	return this.range(Math.min(a1.length,a2.length)).map(function(i) {
                		return [a1[i],a2[i]];
                	});
                },
                splitStringIntoChunks:function(str,len) {
					var ret = [ ];
					for (var offset = 0, strLen = str.length; offset < strLen; offset += len) {
						ret.push(str.substring(offset, offset + len));
					}
					return ret;
                },
                splitStringIntoChunksObj:function(str,len) {
					var ret = {};
					for (var i = 0, strLen = str.length; i*len < strLen; i += 1) {
						ret[""+i] = str.substring(i*len, (i+1)*len);
					}
					return ret;
                },
                chooseRandom:function(r) {
                	var i = Math.floor(r.length*Math.random());
                	return r[i];
                },
                joinModelChunksIntoString:function(model) {
                	// inverse of the last method
					var strs = [], val;
					for (var i = 0; (val = model.peek(''+i)) !== undefined; i++) {
						strs.push(val);
					}
					return strs.join("");
				},
                inherit:function(p) {
                	// inherit() returns a newly created object that inherits properties from the
					// prototype object p.  It uses the ECMAScript 5 function Object.create() if
					// it is defined, and otherwise falls back to an older technique.
				    if (p == null) throw TypeError(); // p must be a non-null object
				    if (Object.create)                // If Object.create() is defined...
				        return Object.create(p);      //    then just use it.
				    var t = typeof p;                 // Otherwise do some more type checking
				    if (t !== "object" && t !== "function") throw TypeError();
				    function f() {};                  // Define a dummy constructor function.
				    f.prototype = p;                  // Set its prototype property to p.
				    return new f();                   // Use f() to create an "heir" of p.
				},
				fastkeys:function(obj) {
                	return Object.keys(obj); 
                },
				guid: function(len) {
					len = len || 64;
					var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-';
					return this.range(0,len-1).map(function(x) {
						return alpha[Math.floor(Math.random()*alpha.length)];
					}).join('');
				},
				memoise:function(f) { 
					var cached_args, cached_result, this_ = this;
					return function() {
						var args = _(arguments).toArray();
						if (cached_result && 
							((!cached_args && args.length == 0) || (_(args).isEqual(cached_args)))) {
							return cached_result; 
						}
						cached_args = args.concat();
						cached_result = f.apply(this_,args);
						return cached_result;
					};
				},
				memoise_fast1:function(f) {
					// only 1 argument function
					var cached_arg, cached_result, this_ = this;
					return function() {
						var arg = arguments[0];
						if (cached_result && (arg == cached_arg)) { return cached_result; }
						cached_arg = arg;
						cached_result = f(arg);
						return cached_result;
					};
				},
				uniqstr:function(L) {
					var o = {}, i, l = L.length, r = [];
					for(i=0; i<l;i+=1) { o[L[i]] = L[i]; }
					for(i in o) { r.push(o[i]);	}
					return r;
				},
				dmap: function(L, fn) {
					if (L.length === 0) { return this.dresolve([]); }
					var d = this.deferred(), this_ = this;
					fn(L[0]).then(function(result) {
						this_.dmap(L.slice(1), fn).then(function(rest) {
							d.resolve([result].concat(rest));
						}).fail(d.reject);
					}).fail(d.reject);
					return d.promise();
				},
				quickSame:function(a,b) { 
					// a, b are two Arrays
					if (a.length !== b.length) { return false; }
					for (var i = 0; i < a.length; i++) {
						if (a[i] !== b[i]) return false;
					}
					return true;
				},
				safeApply: function($scope, fn) { if (window) { window.setTimeout(function() { $scope.$apply(fn); }, 0); } },
				log : function() { try { if (DEBUG_LEVEL >= LOG) { console.log.apply(console,arguments);  }} catch(e) { } },
				warn : function() { try { if (DEBUG_LEVEL >= WARN) { console.warn.apply(console,arguments);  }} catch(e) { } },
				debug : function() { try { if (DEBUG_LEVEL >= DEBUG) { console.debug.apply(console,arguments); }} catch(e) { } },
				error : function() { try { if (DEBUG_LEVEL >= ERROR) { console.error.apply(console,arguments); }} catch(e) {}},
				isInteger:function(n) { return n % 1 === 0; },
				deferred:function() { return new jQ.Deferred(); },
				chunked:function(l,n) {
					return this.range(Math.floor(l.length / n) + (l.length % n === 0 ? 0 : 1)).map(function(ith) { 
						var start = ith*n;
						return l.slice(start, start+n);
					});
				},
				shake:function(el, times, px) {
					var d = new jQ.Deferred(), l = px || 20;
					for (var i = 0; i < 4; i++) {
						$(el).animate({'margin-left':"+=" + (l = -l) + 'px'}, 50);
					}
					// todo
					d.resolve();
					return d.promise();
				},
				dresolve:function(val) {
					var d = new jQ.Deferred();
					d.resolve(val);
					return d.promise();
				},
				dreject:function(err) {
					var d = new jQ.Deferred();
					d.reject(err);
					return d.promise();
				},
				whend:function(deferredArray) { return jQ.when.apply($,deferredArray); },
				t:function(template,v) { return _(template).template(v); },
				assert:function(t,s) { if (!t) { throw new Error(s); }},
				TO_OBJ: function(pairs) { var o = {};	pairs.map(function(pair) { o[pair[0]] = pair[1]; }); return o; },
				dict: function(pairs) { var o = {};	pairs.map(function(pair) { o[pair[0]] = pair[1]; }); return o; },
				flatten:function(l) { return l.reduce(function(x,y) { return x.concat(y); }, []); },
				DEFINED:function(x) { return (!_.isUndefined(x)) && x !== null; },
				defined:function(x) { return (!_.isUndefined(x)) && x !== null; },
				indexOfUkPostcode:function(s) {
					var re = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) {0,1}[0-9][A-Za-z]{2})$/g;
					return s.search(re);
				},
				NotImplementedYet:function() {
					throw new Error('Not Implemented Yet');
				},
				resizeImage:function(dataURI, width, height) {
					var d = this.deferred(), this_ = this;
					if (dataURI) {
			            var canvas, context, image, imageData;
			            canvas = document.createElement('canvas');
			            canvas.width = width;
			            canvas.height = height;
			            context = canvas.getContext('2d');
			            image = new Image();
			            image.addEventListener('load', function(){
							// console.log('resize load');
							var cw = image.width, ch = image.height;
							var ratio = width*1.0/cw;
							// console.log('new width height ', cw, ch, canvas.width, Math.round(ratio*ch));
			                context.drawImage(image, 0, 0, canvas.width, Math.round(ratio*ch)); // , canvas.height);
			                imageData = context.getImageData(0, 0, canvas.width, canvas.height);
			                d.resolve(canvas.toDataURL());
			            }, false);
			            image.src = dataURI;
			        } else { d.reject(); }
			        return d.promise();
				},
				getParameterByName: function(name,str) {
					name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
					var regexS = "[\\?&]" + name + "=([^&#]*)";
					var regex = new RegExp(regexS);
					var results = regex.exec(str || window.location.search);
					if (results === null)
						return "";
					else
						return decodeURIComponent(results[1].replace(/\+/g, " "));
				},
				range:function(l,h) {
					var a = [];
					if (_.isUndefined(h)) { h = l; l = 0; }
					for (var i = l; i < h; i++) { a.push(i); }
					return a;
				},
				isValidURL:function(str) {
					// from http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-an-url
					var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
					  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
					  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
					  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
					  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
					  '(\\#[-a-z\\d_]*)?$','i');
					return pattern.test(str);
				},
				toNumeric:function(v) {
					if (_(v).isNumber()) { return v ; }
					if (typeof(v) == 'string') { return parseFloat(v, 10); }
					return undefined; // throw new Error("Could not convert ", v);
				},
				when:function(x) {
					var d = this.deferred();
					jQ.when.apply(jQ,x).then(function() {	d.resolve(_.toArray(arguments)); }).fail(d.reject);
					return d.promise();
				},
				whenSteps:function(fns, failFast) {
					// executes a bunch of functions that return deferreds in sequence
					var me = arguments.callee;
					var d = new jQ.Deferred();
					if (fns.length == 1) { return fns[0]().then(d.resolve).fail(d.reject);	}
					fns[0]().then(function() {
						me(fns.slice(1));
					}).fail(function() {
						if (failFast === true) { return; }
						me(fn.slice(1));
					});
					return d;
				},
				hash:function(s) {
					var hash = 0;
					if (s.length === 0) { return hash; }
					for (i = 0; i < s.length; i++) {
						char = s.charCodeAt(i);
						hash = ((hash<<5)-hash)+char;
						hash = hash & hash; // Convert to 32bit integer
					}
					return hash;
				}
			};
		});
}());
