var Transfer = require("./Transfer");
var User = require("./User");
var cqrs = require('../..');
var Domain = cqrs.Domain;
var domain = new Domain();
var fromId;
var toId;
var money = 20;

domain.register(User).register(Transfer);

domain.on("*", function (event) {
});

domain.on("Transfer:finish", function (event) {
    console.log("finish -------------- ");
});

domain.create("User", {}, function (err, userId) {
    fromId = userId;
    domain.create("User", {}, function (err, userId) {
        toId = userId;
        domain.get("User", fromId).then(function (user) {

            user.recharge(100); // then fromUser have 100.00

            // create a transfer saga
            domain.create("Transfer", {}, function (err, tid) {

                setTimeout(function () {
                    domain.get("Transfer", tid).then(function (t) {
                        t.transfer(fromId,toId,money);
                    });
                })

            });
        });
    });
});







