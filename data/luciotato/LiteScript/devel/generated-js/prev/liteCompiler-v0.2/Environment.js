//The global 'Environment' object, must provide functions to load files,
//search modules in external cache, load and save from external cache (disk).

//The `Environment` abstraction allows us to support compile on server (nodejs) or the browser.

        //compile if inNnode
           module.exports = require('./node-environment-support.js');