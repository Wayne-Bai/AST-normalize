require('babel/polyfill');

var ActorListener = require("../lib/ActorListener"),
    Actor = require("../lib/Actor"),
    DomainEvent = require("../lib/DomainEvent"),
    should = require("should");

class User extends Actor {
    static get type() {
        return "User"
    }

    handleTest(event) {
        console.log("handleTest");
    }

    handleTest2(event) {
        console.log("handleTest2");
    }
}

describe("ActorListener", function () {

    var listener;
    var user = new User();
    var event = new DomainEvent("test", user);
    var event2 = new DomainEvent("testOne", user);

    it("#new", function () {
        listener = new ActorListener();
        listener.type.should.eql('ActorListener');
        // only test need.
        listener.myDomain = {
            get: function (a, b, cb) {
                cb(null, user);
            }
        }
    });

    it("#listen", function () {
        listener.listen("test", user, 'handleTest');
    });

    it("#listenOne", function () {
        listener.listenOne("testOne", user, 'handleTest2');
    });

    it("#pub", function () {
        listener.pub(event);
        listener.pub(event);
        listener.pub(event2);
        listener.pub(event2);
    });

});