"use strict"; // run code in ES5 strict mode

module.exports = function (exports) {
    exports.Server = require("./server/Server.class.js");
    exports.Bundler = require("./core/bundle/Bundler.class.js");
    exports.websockets = require("./server/transport/websocket/websocket.js");
    exports.middleware = {
        onlyWriteableFields : require("./server/request/middleware/onlyWriteableFields.js")
    };
};
