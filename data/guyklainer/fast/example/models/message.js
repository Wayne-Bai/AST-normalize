

var Message = {};

Message.getPrivateMessages = function( senderID, receiverID ){

	var deferred 	= Core.deferred(),
		params 		= {
			key : [ senderID, receiverID ]
		};

	Core.db.private_messages.getUsingView( 'dev_private_messages', 'get_private_messages', params, function( err, res ){

		if( err )
			deferred.reject( err );
		else
			deferred.resolve( res );
	});

	return deferred.promise;
};

Message.setPrivate = function( message ){
	var ids = [message.sender_id, message.receiver_id].sort(function(a,b){return a.localeCompare(b); }),
		id 	= ids.join( "_" ) + "_" + Core.date().unix();

	var deferred = Core.deferred();

	Core.db.private_messages.set( id, message, function( err, res ){

		if( err )
			deferred.reject( err );
		else
			deferred.resolve( message );
	});

	return deferred.promise;
};

module.exports = Message;