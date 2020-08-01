var base = require( '../GoogleProducerBase' );
function GoogleCalendarsEventProducer( fetcher ) {
	this.fetcher = fetcher;
	base.init( this );
}
base.inherit( GoogleCalendarsEventProducer );

GoogleCalendarsEventProducer.prototype.init = function( done ) {
	var self = this;
	this.fetcher.tokenStore.getApplicationTokens( 'googlecalendars', function( error, tokens ) {
		if( error ) {
			done( error );
		}
		else
		{
			var OAuth = require( 'oauth' ).OAuth;
			self.oauth = new OAuth2( 
				tokens.clientID, 
				tokens.clientSecret,
				'https://accounts.google.com', 
				'/o/oauth2/auth', 
				'/o/oauth2/token' );
			done();
		}
	} );
}
GoogleCalendarsEventProducer.prototype.getMatchPatterns = function() {

	return [ '^acct:googlecalendars:[0-9]+', '/calendar/[^_].*/event/(?!_index)(.*)$' ];
}
GoogleCalendarsEventProducer.prototype.getDataUrl = function( resource ) {
	var parsedResource = resource.match( /\/calendar\/([^_].*)\/event\/(?!_index)(.*)$/ );
	return 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent( parsedResource[1] ) + '/events/' + parsedResource[2];
}
GoogleCalendarsEventProducer.prototype.processData = function( uri, owner, source, resource, data, callback ) {

	var result = {
		'uri': uri,
		'data': data
	};
	callback( null, result );

}

module.exports = exports = GoogleCalendarsEventProducer;
