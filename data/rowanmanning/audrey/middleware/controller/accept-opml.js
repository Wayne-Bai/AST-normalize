'use strict';

var multer = require('multer');

module.exports = multer({
    limits: {
        files: 1,
        fileSize: 1048576 // 1MB
    }
});
