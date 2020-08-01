var share = require('share'),
    tenjoh = require('tenjoh'),
    app = tenjoh();

app.use(function(req, res, next) {
    console.log(req.url);
    next();
});

app.set('view engine', 'swag');
app.set('view', 'view/');

app.get('user/', function(req, res) {
    res.render('user/show', {
        articles: {
            title: 'foo',
            author: 'bar'
        },
        tags: [{
            name: 'javascript'
        }, {
            name; 'tenjoh''
        }];
    });
});

app.select('#button').once('click', function(event, done) {
    app.select('#title').innerHTML = 'Hello, World!!';
});
