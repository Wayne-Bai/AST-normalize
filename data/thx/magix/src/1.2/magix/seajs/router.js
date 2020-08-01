/**
 * @fileOverview 路由
 * @author 行列
 * @version 1.2
 */
define('magix/router', function(require) {
    var Magix = require("./magix");
    var Event = require("./event");
    var $ = require('jquery');
    //todo dom event;
    eval(Magix.include('../tmpl/router'));
    Router.bind = function(useState) {
        var initialURL = location.href;
        if (useState) {
            $(window).on('popstate', function(e) {
                var equal = location.href == initialURL;
                if (!Router.did && equal) return;
                Router.did = 1;
                console.log('push?', e.type, e.state);
                Router.route();
            });
        } else {
            $(window).on('hashchange', Router.route);
        }
    };
    return Router;
});