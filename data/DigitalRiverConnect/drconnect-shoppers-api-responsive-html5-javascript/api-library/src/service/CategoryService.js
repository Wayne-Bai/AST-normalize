define(['service/BaseService', 'Config'], function(BaseService, Config) {
    /**
     * Service Manager for Category Resource
     */
    return BaseService.extend({
        uri: Config.service.URI.CATEGORIES
    });
});