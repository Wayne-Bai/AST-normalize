var smtp = require( '../' );
var dmp = require( 'util' ).inspect;

var server = smtp.createServer( function( req ) {

    //get remote client IP
    var remoteIp = req.socket.remoteAddress;
    var logo = "[" + remoteIp + "] ";
    
    req.on( 'message', function( stream, ack ) {
        console.log( logo + 'from: ' + req.from );
        console.log( logo + 'to: ' + req.to );
   
        stream.pipe( process.stdout, { end : false } );
        ack.accept();
    } );

    //some custom events
    req.socket.setTimeout( 1000 * 60, function( ) {
        console.log( logo + "Timeout" );
    } );

    req.socket.on( 'error', function( err ) {
        console.log( logo + "Error: " + dmp( err ) );
    } );

} );

server.listen( 9025 );
