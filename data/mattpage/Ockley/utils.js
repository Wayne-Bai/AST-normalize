/*
 Ockley 1.0
 Copyright 2011,  Matthew Page
 licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 */
module.exports = function(/*options*/){

    this.escape = function(text){
        text = text.replace(/&/g, '&amp;');
        text = text.replace(/"/g, '&quot;');
        text = text.replace(/</g, '&lt;');
        text = text.replace(/>/g, '&gt;');
        return text;
    };

    this.extend = function(a, b){
        if (a != null && b != null){
           for (var key in b) {
             a[key] = b[key];
           }
       }
    };

    this.parseUrl = function(url){
        var parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
        var result = parse_url.exec(url);
        var ret = {};
        var names = ['url', 'scheme', 'slash', 'host', 'port', 'path', 'query', 'hash'];
        var i, len = names.length;
        for (i = 0; i < len; ++i) {
            ret[names[i]] = result[i];
        }
        return ret;
    };

    return this;
};