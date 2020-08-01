global.expect = require('chai').expect;
global.PREVIEW_PORT = 3000;
global.PREVIEW_ADDR = 'localhost'+PREVIEW_PORT;


require('./support/previewServer.js');
require('./support/browser.js');
