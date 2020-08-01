var config = require('./Config');
var express = require('express');
var _ = require('lodash');
var pushAssociations = require('./PushAssociations');
var push = require('./PushController');

var app = express();

// Middleware
app.use(express.compress());
app.use(express.bodyParser());

app.use(express.static(__dirname + '/../public'));

app.use(function(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
});

app.post('/*', function (req, res, next) {
    if (req.is('application/json')) {
        next();
    } else {
        res.status(406).send();
    }
});

// Main API
app.post('/subscribe', function (req, res) {
    var deviceInfo = req.body;
    push.subscribe(deviceInfo);

    res.send();
});

app.post('/unsubscribe', function (req, res) {
    var data = req.body;

    if (data.user) {
        push.unsubscribeUser(data.user);
    } else if (data.token) {
        push.unsubscribeDevice(data.token);
    } else {
        return res.status(503).send();
    }

    res.send();
});

app.post('/send', function (req, res) {
    var notifs = [req.body];

    var notificationsValid = sendNotifications(notifs);

    res.status(notificationsValid ? 200 : 400).send();
});

app.post('/sendBatch', function (req, res) {
    var notifs = req.body.notifications;

    var notificationsValid = sendNotifications(notifs);

    res.status(notificationsValid ? 200 : 400).send();
});

// Utils API
app.get('/users/:user/associations', function (req, res) {
    pushAssociations.getForUser(req.params.user, function (err, items) {
        if (!err) {
            res.send({"associations": items});
        } else {
            res.status(503).send();
        }
    });
});

app.get('/users', function (req, res) {
    pushAssociations.getAll(function (err, pushAss) {
        if (!err) {
            var users = _(pushAss).map('user').unique().value();
            res.send({
                "users": users
            });
        } else {
            res.status(503).send()
        }
    });
});

app.delete('/users/:user', function (req, res) {
    pushController.unsubscribeUser(req.params.user);
    res.send('ok');
});


// Helpers
function sendNotifications(notifs) {
    var areNotificationsValid = _(notifs).map(validateNotification).min().value();

    if (!areNotificationsValid) return false;

    notifs.forEach(function (notif) {
        var users = notif.users,
            androidPayload = notif.android,
            iosPayload = notif.ios,
            target;

        if (androidPayload && iosPayload) {
            target = 'all'
        } else if (iosPayload) {
            target = 'ios'
        } else if (androidPayload) {
            target = 'android';
        }

        var fetchUsers = users ? pushAssociations.getForUsers : pushAssociations.getAll,
            callback = function (err, pushAssociations) {
                if (err) return;

                if (target !== 'all') {
                    // TODO: do it in mongo instead of here ...
                    pushAssociations = _.where(pushAssociations, {'type': target});
                }

                push.send(pushAssociations, androidPayload, iosPayload);
            },
            args = users ? [users, callback] : [callback];

        // TODO: optim. -> mutualise user fetching ?
        fetchUsers.apply(null, args);
    });

    return true;
}

function validateNotification(notif) {
    var valid = true;

    valid = valid && (!!notif.ios || !!notif.android);
    // TODO: validate content

    return valid;
}

exports.start = function () {
    app.listen(config.get('webPort'));
    console.log('Listening on port ' + config.get('webPort') + "...");
};
