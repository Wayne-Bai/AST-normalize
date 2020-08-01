
function AppDotNetUserProfileTranslator() {
}

AppDotNetUserProfileTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:appdotnet:[0-9]+', '/user/[0-9]+' ];
}
AppDotNetUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
    try {
        var userProfile = JSON.parse( rawDoc.data );

        // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
        // spec (opensocial-social-data-specification-2-5-0-draft):
        // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
        var result = { 
            // Required fields by spec
            'id': uri,
            'displayName': {'formatted': userProfile.data.name },

            // Additional required fields for UI
            'preferredUsername': userProfile.data.username,
            'thumbnailUrl': userProfile.data.avatar_image.url,
            'appData': { 
                'serviceName': 'App.Net',
                // Reuse the icon you defined in LoginStrategies.js.
                'serviceImgUrl': '/images/512x512-logos/app_net.png',
                // Plus other app data that isn't required.
                'verified': userProfile.verified,
            },

            // Everything else
            'location': userProfile.data.locale,
            'aboutMe': userProfile.data.text,
            'urls': [ userProfile.data.description.entities.links.url ],
            'utcOffset': userProfile.timezone,
            'languagesSpoken': [ userProfile.lang ],
         };

         if( userProfile.status )
            result.status = userProfile.status.text;

// Once you have the translated data built up, spout it out via an event so that indexers and caches 
// are triggered.
        var outputData =  {
            'uri': uri,
            'owner': owner,
            'category': 'person',
            'data': result
        };

        process.nextTick( function() {
            callback( error, outputData.data );
        });

    } catch( err ) {
        callback(  err , null );
    }
};
module.exports = exports = AppDotNetUserProfileTranslator;
