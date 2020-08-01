var dbus = require('../index.js');
var bus = dbus.sessionBus();
bus.connection.on('message', console.log);
bus.addMatch("type='signal'");
bus.addMatch("type='method_call'");
bus.addMatch("type='method_return'");
