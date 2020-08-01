var fs = require('fs'),
    mongoose = require('mongoose'),
    http = require('http'),
    mongodbURI = '<my mongodb uri>'; /* For example: mongodb://localhost/my-app-db */

mongoose.connect(mongodbURI);

var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function(file) {
    if (file.substring(-3) === '.js') {
        require(models_path + '/' + file);
    }
});

var app = require('./config/express')(mongodbURI);

require('./config/routes')(app);

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

exports = module.exports = app;
