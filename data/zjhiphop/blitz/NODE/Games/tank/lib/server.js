var ws = require('websocket-server');
var server = ws.createServer();
server.addListener("connection", function(conn) {
    // init stuff on connection
    console.log("A connection established with id", conn.id);
    var message = "Welcome " + conn.id + " joining the party.Total connection:" + server.manager.length;
    server.broadcast(message);

    // listen to the message
    conn.addListener("message", function(message) {
        console.log("Got data '" + message + "' from connection " + conn.id);
    });
});
server.listen(8000);
console.log("WebSocket server is running.");
console.log("Listening to port 8000.");