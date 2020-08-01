var fs = require('fs')
  , path = require('path')

// Create a directory to store data which will be used
// to restore the server in case of crash.
var storeDir = path.join(__dirname, 'tmp') 
if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir)

module.exports = {

  // Start the HTTP server running on port 8000
  // and serving static files from `./pages` 
  http: {
    port: 8000,
    staticDir: path.join(__dirname, 'pages')
  },

  // Start the websockets server running on the same port as the HTTP server
  websockets: {},

  // Start the OSC server on port 9000
  osc: {
    port: 9000
  },

  // Configure data to be stored in `./tmp`
  connections: { 
    store: storeDir,
  }
}
