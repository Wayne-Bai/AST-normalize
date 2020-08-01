define(['service/BaseService', 'Config', 'q', 'view/EditAccountIFrameView'], function(BaseService, Config, Q, EditAccountIFrameView) {
    /**
     * Service Manager for Shopper Resource
     */
    var ShopperService = BaseService.extend({
        
        uri: Config.service.URI.SHOPPER,
        
        /**
         * get Shopper 
         */
        get: function(parameters, callbacks) {
            return this.makeRequest(this.session.retrieve(this.uri, parameters), callbacks);
        },    
    
        /**
         * get Shopper Addresses
         */
        getAddresses:function(parameters, callbacks){
            var uri = Config.service.URI.ADDRESS;       
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks);
        },
        
        /**
         * Gets the payment options for the shopper
         */
        getPaymentOptions: function(parameters, callbacks){
            var uri = Config.service.URI.SHOPPER_PAYMENT_OPTION; 
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks);
        },
        
        /**
         * Edit shopper account
         */
        editAccount: function(options, callbacks, editViewLoadedCallback){
            
            var uri = Config.connection.URI.BASE_URL + Config.connection.URI.VERSION + "/" + Config.service.URI.SHOPPER_ACCOUNT; 
            var defer = Q.defer();
            var redirectUri = Config.config.EDIT_ACCOUNT_REDIRECT_URI;
    
            this.view =  new EditAccountIFrameView(uri, redirectUri, options);
            ShopperService.currentRequest = {"defer": defer, "view": this.view};
            
            this.view.open(this.session.token, editViewLoadedCallback);
    
            return this.makeRequest(defer.promise, callbacks);
        }
            
    });
    
    /**
     * Callback used by the view (iframe or window) to notify the library when it finished
     */
    ShopperService.editCallback= function() {
        var req = ShopperService.currentRequest;
        if(req) {
            req.view.close();
            req.view = null;        
            ShopperService.currentRequest = null;
            window.focus();
            req.defer.resolve();
        }
    }
    
    return ShopperService;
});