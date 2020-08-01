/*
    restController.js
    A headless, RESTful controller module to handle client side API actions.
 */
define(['baseController', 'module'], function(BaseController, module) {
    return BaseController.override({
        moduleId: module.id,
        handle: function (request, response) {
            var method = request.method.toLowerCase(),
                methodActions = method + '-actions';

            if (!this.hasOwnProperty(methodActions)) {
                // Method Not Allowed
                response.statusCode = 405;
                response.end();
            }
            else{
                var action = request.params[2];

                if (!action) {
                    action = 'default';
                }

                if (!this[methodActions].hasOwnProperty(action)) {
                    // Method Not Allowed
                    response.statusCode = 405;
                    response.end();
                }
                else{
                    this[methodActions][action](request, response);
                }
            }
        }
    });
});