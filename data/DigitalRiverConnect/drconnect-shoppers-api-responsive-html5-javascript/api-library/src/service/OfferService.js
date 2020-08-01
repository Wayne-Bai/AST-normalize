define(['service/BaseService', 'Config'], function(BaseService, Config) {
    /**
     * Service Manager for Offer Resource
     */
    return BaseService.extend({
        
        uri: Config.service.URI.OFFERS,
        
        /**
         * Gets the offers for a POP 
         */
        list: function(popName, parameters, callbacks, errorHandled) {
            var uri = this.replaceTemplate(this.uri, {'popName':popName});
    
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks, errorHandled);
        },
        
        /**
         * Gets an offer
         */
        get: function(popName, offerId, parameters, callbacks) {
            var uri = this.replaceTemplate(this.uri, {'popName':popName}) + '/' + offerId;
    
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks);
        }

    });
});