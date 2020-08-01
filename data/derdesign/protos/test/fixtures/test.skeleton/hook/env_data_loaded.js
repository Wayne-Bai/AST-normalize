
/* hook/env_data_loaded.js */

var app = protos.app;

module.exports = function env_data_loaded(data) {
  
  // Set on proto to avoid conflicts with assert.deepEqual
  data.__proto__ = {tested: true}; 
  
}