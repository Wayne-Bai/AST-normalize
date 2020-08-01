var base = require( '../ProducerBase.js' );
function TwitterOutgoingPendingRelationshipProducer( fetcher ) {
	this.fetcher = fetcher;
	base.init( this );
}
base.inherit( TwitterOutgoingPendingRelationshipProducer );

TwitterOutgoingPendingRelationshipProducer.prototype.init = function( done ) {
	var self = this;
	this.fetcher.tokenStore.getApplicationTokens( 'twitter', function( error, tokens ) {
		if( error ) {
			done( error );
		}
		else
		{
			var OAuth = require( 'oauth' ).OAuth;
			self.oauth = new OAuth( 
				"https://api.twitter.com/oauth/request_token",
				"https://api.twitter.com/oauth/authorize",
				tokens.consumerKey, 
				tokens.consumerSecret,
				"1.0", null, "HMAC-SHA1" );
			done();
		}
	} );
}
TwitterOutgoingPendingRelationshipProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:twitter:[0-9]+', '.*/relationship/outgoing/pending' ];
}
TwitterOutgoingPendingRelationshipProducer.prototype.attemptRequest = function( uri, userId, source, resource, keys, callback ) {
	var self = this;

	var userId;
	var alternateUserId = resource.match( /^\/([0-9]+)\/relationship\/outgoing\/pending/ );
	if( alternateUserId == null )
		userId = source.match( /^acct:twitter:([0-9]+)/ )[1];
	else
		userId = alternateUserId[1];

	var dataset = new Array();
	var processDataset = function( err, data, next ) {
		if( err )
			callback( err, null );
		else
		{
			dataset.push( data );
			if( next != null )
				self.getGroupMembersForCursor( next, userId, keys, processDataset );
			else
			{
				var result = { 
					'uri': uri,
					'data': dataset
				};
				callback( null, result );	
			}
		}
	};
	self.getGroupMembersForCursor( null, userId, keys, processDataset );
};
TwitterOutgoingPendingRelationshipProducer.prototype.getGroupMembersForCursor = function( cursor, userId, keys, callback ) {
	var url;
	if( cursor == null )
		url = 'https://api.twitter.com/1.1/friendships/outgoing.json?user_id=' + userId + '&cursor=-1';
	else
		url = 'https://api.twitter.com/1.1/friendships/outgoing.json?user_id=' + userId + '&cursor=' + cursor;

	this.getUrlUsingOauth( url, keys, function( err, data ) {
		if( err == null )
		{
			try {
				var parsedData = JSON.parse( data );
				if( parsedData.ids.length == 0 || parsedData.next_cursor == parsedData.previous_cursor )
					callback( null, data, null );
				else
					callback( null, data, parsedData.next_cursor );
			} catch( err ) {
				callback( err, null );
			}
		}
		else
		{
			callback( err, null, null );
		}
	});
};
TwitterOutgoingPendingRelationshipProducer.prototype.getUrlUsingOauth = function( url, keys, callback ) {
	var self = this;
	var retryCount = 0;
	var retryRequest = function( err, data, res ) {
		if( err )
		{
			if( retryCount < 10 )
			{
				retryCount++;
				self.oauth.get( url, keys.token, keys.tokenSecret, retryRequest );
			}
			else
				callback( err, null );
		}
		else
			callback( null, data );
	}
	self.oauth.get( url, keys.token, keys.tokenSecret,retryRequest );
}
module.exports = exports = TwitterOutgoingPendingRelationshipProducer;
