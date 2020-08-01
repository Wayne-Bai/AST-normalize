var path    = require('path');
var express = require('express');
var app     = express();;
var oneYear = 31557600000;

app.use(express.compress());
app.use(express.static(path.resolve(__dirname, 'client/dist' ), {maxAge: oneYear}));

app.get('/*', function(req,res)
{
    res.sendfile(path.resolve(__dirname, 'client/dist/index.html'));
});

app.listen(3000);

console.log('Listening on port 3000');
