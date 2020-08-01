(function ($) {

    $.config({log: "debug"});
    $.sun.config({
        alias: {
            "com": "${url}/com.js",
            "api": "${url}/api.js",
            "demo/Demo1": '${url}/demo1.js?${version}',
            "demo/Demo2": '${url}/demo2.js?${version}',
            "demo/Demo3": '${url}/demo3.js?${version}',
            "demo/Demo4": '${url}/demo4.js?${version}',
            "demo/Common": '${url}/common.js?${version}'
        },
        vars: {
            url: function () {
                return location.href.replace(/\/[^\/]*$/, "");
            },
            version: function () {
                return $.now() / (24 * 60 * 60 * 1000)
            }
        },
        preload: [
            "com", "api"
        ]
    });
})(Qmik);