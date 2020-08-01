define(['service/ShopperService', 'auth/AuthManager', 'Config', 'Client', 'Util'], function(ShopperService, AuthManager, Config, Client, Util) {
    var dr = {};
    dr.api = {};
    
    dr.api.callbacks = {
            editAccount: ShopperService.editCallback,
            auth: AuthManager.authCallback    
        } 
    
    window.dr = dr;
    
    return {
        callbacks: {
            editAccount: ShopperService.editCallback,
            auth: AuthManager.authCallback    
        },
        Client: Client,
        authModes: Config.authMode,
        util: Util
   }
});