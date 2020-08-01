/** @license Naosuke Yokoe - http://github.com/zentooo/Riddle.js - MIT Licensed */
(function(global, doc, isArray, toArray, enc, undefined) {
    'use strict';

    r.listeners = {};
    r.__nid = 1;
    r.domReady = false;

    doc.addEventListener("DOMContentLoaded", function(e) {
        r.domReady = true;
    }, false);

    /**
     * <p> Select HTMLElements, wait DOMContentLoaded or wrap HTMLElement with r.fn <br /> Usages are:
     * <ul>
     * <li>Select and wrap HTML Elements with r(selector: String, [context: HTMLElement]).
     * <li>Wait DOMContentLoaded with r(func: Function). <br/>
     * <li>Just to wrap HTMLElement with r(elem: HTMLElement)
     * <ul/>
     * @name r
     * @namespace
     * @function
     * @param first {(string|function|HTMLElement)}
     * @param second {?(HTMLElement|NodeArray)}
     * @return {NodeArray} On Selector or wrapper usage
     * @example
     * var elementsById = r("#id");
     * var elementsByClass = r(".class");
     * var elementsByTag = r("tag");
     * @example
     * r(function() {
     *   // put initialization process here, which you want to run after DOMContentLoaded event
     * });
     * @example
     * r("#id").bind(function(e) {
     *   var wrapped = r(e.target);
     * });
    */
    function r(first, second) {
        if ( typeof first === "string" ) {
            return wrap(toArray.call((second || doc).querySelectorAll(first)));
        }
        else if ( typeof first === "object" && first !== null && typeof first.addEventListener === "function" ) {
            return wrap([first]);
        }
        else if ( isArray(first) ) {
            return wrap(first);
        }
        else if ( typeof first === "function" ) {
            if ( r.domReady ) {
                first(r);
            }
            else {
                doc.addEventListener("DOMContentLoaded", function() {
                    first(r);
                }, false);
            }
            r.init = first;
        }
    }

    function wrap(ary) {
        ary.__proto__ = r.fn;
        return ary;
    }

    function nodeId(elem) {
        return elem.__nid || (elem.__nid = r.__nid++);
    }

    /**
     * Base class of HTMLElement Array collected by selector.
     * @name r.fn
     * @class base class of HTMLElement Array collected by selector.
    */
    r.fn = {
         /**
         * forEach with auto-wrapping
         * @name each
         * @function
         * @memberOf r.fn
         * @param f {function}
         * @example
         * var values = r("select#fruits option").each(function($el) { $el.css("color", "red"); });
        */
        each: function(f) {
            return this.forEach(function(el) {
                f(r.wrap([el]));
            });
        },

        /**
         * <p> Get/Set innerHTML of elements </p>
         * <ul>
         * <li> html(): returns html: String if selector has just one element
         * <li> html(): returns htmls: Array[String] if selector has more than two elements
         * <li> html(str): set string as innerHTML for all elements
         * <li> html(elem): set HTMLElement as innerHTML for all elements
         * <li> html(nodeArray): set NodeArray as innerHTML for all elements
         * <ul/>
         * @name html
         * @function
         * @memberOf r.fn
         * @param html {(string|HTMLElement|NodeArray)}
         * @return {(string|Array.<string>)}
         * @example
         * var story = r("p#story").html();
         * @example
         * var colors = r("li.colors").html();
         * @example
         * r("li.colors").html("black");
         * @example
         * r("li.colors").html(document.getElementById("#my-color"));
         * @example
         * r("#story").html(r("li#stories"));
        */
        html: function(item) {
            if ( item === undefined ) {
                return this[0].innerHTML;
            }
            else {
                if ( typeof item === "string" || typeof item === "number" ) {
                    this.forEach(function(elem) {
                        elem.innerHTML = item;
                    });
                }
                else if ( item instanceof HTMLElement ) {
                    this.forEach(function(elem) {
                        elem.innerHTML = item.outerHTML;
                    });
                }
                else if ( r.isR(item) ) {
                    this.forEach(function(elem) {
                        elem.innerHTML = item[0].outerHTML;
                    });
                }
                return this;
            }
        },

        /**
         * Remove elements from document tree
         * @name remove
         * @function
         * @memberOf r.fn
         * @return {NodeArray} removed Elements
         * @example
         * r("#mami .head").remove();
        */
        remove: function() {
            this.forEach(function(elem) {
                if ( elem.parentNode ) {
                    elem.parentNode.removeChild(elem);
                }
            });
            return this;
        },

        /**
         * Append elements to selected NodeArray. <br />
         * @name add
         * @function
         * @memberOf r.fn
         * @param elem {(HTMLElement|NodeArray|string)}
         * @example
         * r(".magical-girl").add(document.getElementById("#madoka"));
         * @example
         * r(".magical-girl").add(r("#madoka, #homura"));
         * @example
         * r("#madoka").add("homuhomu");
        */
        add: function(item, position) {
            var fragment;

            if ( typeof item === "string" || typeof item === "number" ) {
                this.forEach(function(elem) {
                    elem.insertAdjacentHTML("beforeEnd", item);
                });
            }
            else if ( item instanceof HTMLElement ) {
                this.forEach(function(elem) {
                    elem.appendChild(item);
                });
            }
            else if ( r.isR(item) ) {
                fragment = doc.createDocumentFragment();
                item.forEach(function(el) {
                    fragment.appendChild(el);
                });

                this.forEach(function(elem) {
                    elem.appendChild(fragment);
                });
            }
            return this;
        },

        /**
         * <p> Get/Set attribute(s) of elements </p>
         * <ul>
         * <li> attr(name): returns attribute: String if selector has just one element
         * <li> attr(name): returns attributes: Array[String] if selector has more than two elements
         * <li> attr(name, value): set value to element's attribute. Remove attribute if value === null
         * <li> attr(hash): set values to element's attribute. Remove attribute if hash.value === null
         * <ul/>
         * @name attr
         * @function
         * @memberOf r.fn
         * @param first {(string|Object)}
         * @param second {?string}
         * @return {(string|Array.<string>)}
         * @example
         * var value = r("#age").attr("value");
         * @example
         * var values = r("option.age").attr("value");
         * @example
         * r(".links-change").attr("href", "http://example.com");
         * @example
         * r(".links-change").attr("href", null);
         * @example
         * r(".links-change").attr( { href: "http://example.com", target: "_blank" } );
         * @example
         * r(".links-change").attr( { href: null } );
        */
        attr: function(first, second) {
            if ( typeof first === "string" ) {
                if ( second === undefined ) {
                    return this[0].getAttribute(first);
                }
                else {
                    if ( second === null ) {
                        this.forEach(function(elem) {
                            elem.removeAttribute(first);
                        });
                    }
                    else {
                        this.forEach(function(elem) {
                            elem.setAttribute(first, String(second));
                        });
                    }
                }
            }
            else if ( typeof first === "object" ) {
                this.forEach(function(elem) {
                    for ( var k in first ) {
                        if ( first[k] === null ) {
                            elem.removeAttribute(k);
                        }
                        else {
                            elem.setAttribute(k, String(first[k]));
                        }
                    }
                });
            }
            return this;
        },

        /**
         * <p> Get/Set css property(properties) of elements </p>
         * <ul>
         * <li> css(key): returns css style value: String if selector has just one element
         * <li> css(key): returns css style values: Array[String] if selector has more than two elements
         * <li> css(key, value): set css style value. Remove css attribute if value === null
         * <li> css(hash): set css style values. Remove css attribute if hash.value === null
         * <ul/>
         * @name css
         * @function
         * @memberOf r.fn
         * @param first {(string|Object)}
         * @param second {?string}
         * @return {(string|Array.<string>)}
         * @example
         * var bodyHeight = r("body").css("height");
         * @example
         * var listHeights = r("li.familiar").css("height");
         * @example
         * r("#hyde").css("height", "156px");
         * @example
         * r("#hyde").css("height", null);
         * @example
         * r(".monster").css( { visibility: "visible", background-color: "red" } );
         * @example
         * r(".monster").css( { visibility: null } );
        */
        css: function(first, second) {
            if ( typeof first === "string" ) {
                if ( second === undefined ) {
                    return getComputedStyle(this[0], null).getPropertyValue(first);
                }
                else {
                    if ( second === null ) {
                        this.forEach(function(elem) {
                            elem.style.removeProperty(first);
                        });
                    }
                    else {
                        this.forEach(function(elem) {
                            elem.style.setProperty(first, second, null);
                        });
                    }
                }
            }
            else if ( typeof first === "object" ) {
                this.forEach(function(elem) {
                    var text = ";";
                    for ( var key in first ) {
                        if ( first[key] === null ) {
                            elem.style.removeProperty(key);
                        }
                        else {
                            text += key + ":" + first[key] + ";";
                        }
                    }
                    elem.style.cssText += text;
                });
            }
            return this;
        },

        /**
         * set class to elements
         * @name addClass
         * @function
         * @memberOf r.fn
         * @param className {string}
        */
        addClass: function(name) {
            this.forEach(function(elem) {
                var currents;
                if ( r(elem).hasClass(name) ) {
                    return;
                }
                currents = elem.className.split(" ");
                currents.push(name);
                elem.className = currents.join(" ");
            });
            return this;
        },

        /**
         * remove class from elements
         * @name removeClass
         * @function
         * @memberOf r.fn
         * @param className {string}
        */
        removeClass: function(name) {
            this.forEach(function(elem) {
                var currents = elem.className.split(" ");
                elem.className = currents.filter(function(c) {
                    return c !== name;
                }).join(" ");
            });
            return this;
        },

        /**
         * return elements have that class or not
         * @name hasClass
         * @function
         * @memberOf r.fn
         * @param className {string}
         * @return {(boolean|Array.<boolean>)}
        */
        hasClass: function(name) {
            var regex = new RegExp("(?:^|\\b)" + name + "(?:\\b|$)");
            return !!this[0].className.match(regex);
        },

        /**
         * toggle one class as on/off or toggle two classes as A/B
         * @name toggleClass
         * @function
         * @memberOf r.fn
         * @param classA {string}
         * @param classB {string}
        */
        toggleClass: function(name) {
            if ( this.hasClass(name) ) {
                this.removeClass(name);
            } else {
                this.addClass(name);
            }
        },

        /**
         * bind callback function to elements
         * @name bind
         * @function
         * @memberOf r.fn
         * @param events {string}
         * @param callback {function(e: Object)}
         * @param useCapture {?boolean}
         * @example
         * r("#button").bind("click", function(e) {
         *   alert("button clicked on" + e.target.tagName);
         * });
        */
        bind: function(eventNames, callback, useCapture) {
            var events = eventNames.split(" ");

            this.forEach(function(elem) {
                var id = nodeId(elem),
                bounds = r.listeners[id] || (r.listeners[id] = []);
                events.forEach(function(event) {
                    bounds.push({
                        event: event,
                        callback: callback,
                        index: bounds.length,
                        useCapture: useCapture || false
                    });
                    elem.addEventListener(event, callback, useCapture || false);
                });
            });
            return this;
        },

        /**
         * unbind alreaedy-bound callback function from elements
         * @name unbind
         * @function
         * @memberOf r.fn
         * @param event {string}
         * @example
         * r("#button").unbind("click");
        */
        unbind: function(event) {
            function findBoundsByEvent(bounds, event) {
                return bounds.filter(function(bound) {
                    return bound.event === event;
                });
            }
            this.forEach(function(elem) {
                var id = nodeId(elem),
                bounds = event ? findBoundsByEvent(r.listeners[id] || [], event) : r.listeners[id];
                bounds && bounds.forEach(function(bound) {
                    delete bounds[bound.index];
                    elem.removeEventListener(bound.event, bound.callback, bound.useCapture);
                });
            });
            return this;
        },

        /**
         * trigger events
         * @name trigger
         * @function
         * @memberOf r.fn
         * @param event {string}
         * @example
         * r("#button").trigger("click");
        */
        trigger: function(eventName) {
            var evt = doc.createEvent("Event");
            evt.initEvent(eventName, true, true);
            this.forEach(function(elem) {
                elem.dispatchEvent(evt);
            });
            return this;
        }
    };

    r.fn.__proto__ = [];


    /**
     * send XMLHttpRequest to given URL to get data
     * @name ajax
     * @memberOf r
     * @function
     * @param url {string}
     * @param success {function(string, Object)}
     * @param error {?function(Object)}
     * @param options {?{method: string, header: Object, ctype: string, data: Object}}
     * @example
     * r.ajax("http://example.com/people/get", function(data, xhr) {
     *   r("#people").html(data);
     * });
     * @example
     * r.ajax("http://example.com/articles", function(data, xhr) {
     *   r("#article").html(data.result);
     * }, function(xhr) {
     *   r("#article").html("Oops! Something is wrong!");
     *   console.dir(xhr);
     * }, {
     *   method: "POST",
     *   data: {
     *     foo: "bar",
     *     bar: "baz",
     *   },
     *   header: {
     *     "X-FooBar": "baz"
     *   },
     * });
    */
    r.ajax = function(url, success, error, options) {
        var xhr = new XMLHttpRequest(),
            options = options || {},
            success = success || function() {},
            error = error || function() {},
            method = options.method || "GET",
            header = options.header || {},
            ctype = options.ctype || (( method === "POST" ) ? "application/x-www-form-urlencoded" : ""),
            data = options.data || "",
            key;

        xhr.onreadystatechange = function() {
            if ( xhr.readyState === 4 ) {
                if ( xhr.status >= 200 && xhr.status < 300 ) {
                    success(xhr.responseText, xhr);
                } else {
                    error(xhr);
                }
            }
        };

        if ( typeof data === "object" ) {
            data = encode(data);
        }

        xhr.open(method, url, true);

        if ( ctype ) {
            xhr.setRequestHeader("Content-Type", ctype);
        }
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

        for ( key in header ) {
            xhr.setRequestHeader(key, header[key]);
        }

        xhr.send(data);
        return xhr;

        function encode(obj) {
            var set = [], key;
            for ( key in obj ) {
                set.push(enc(key) + "=" + enc(obj[key]));
            }
            return set.join("&");
        }
    };

    r.get = function(url, data, success, error) {
        return r.ajax(url, success, error, { data: data, method: "GET" });
    };

    r.post = function(url, data, success, error) {
        return r.ajax(url, success, error, { data: data, method: "POST" });
    };


    // shorthand and fast query

    /**
     * select a element by id and wrap it as NodeArray
     * @name id
     * @function
     * @memberOf r
     * @param identifier {string}
     * @param context [HTMLElement]
     * @return NodeArray
    */
    r.id = function(identifier, context) {
        var elem = (context || doc).getElementById(identifier);
        return elem ? wrap([elem]) : wrap([]);
    };

    /**
     * select elements by class and wrap it as NodeArray
     * @name cls
     * @function
     * @memberOf r
     * @param name {string}
     * @param context [HTMLElement]
     * @return NodeArray
    */
    r.cls = function(name, context) {
        return wrap((context || doc).getElementsByClassName(name));
    };

    /**
     * select elements by tag name and wrap it as NodeArray
     * @name tag
     * @function
     * @memberOf r
     * @param name {string}
     * @param context [HTMLElement]
     * @return NodeArray
    */
    r.tag = function(name, context) {
        return wrap((context || doc).getElementsByTagName(name));
    };


    /**
     * check if given object is wrapped by r.fn
     * @name isR
     * @function
     * @memberOf r
     * @param obj {object}
     * @return Boolean
    */
    r.isR = function(obj) { return obj.__proto__ === r.fn; };

    r.wrap = wrap;
    r.nodeId = nodeId;
    r.on = r.bind;
    r.off = r.unbind;
    r.version = "0.4.0";

    global.r = r;
})(
    this,
    document,
    Array.isArray || function(a) { return a instanceof Array },
    Array.prototype.slice,
    encodeURIComponent
);
