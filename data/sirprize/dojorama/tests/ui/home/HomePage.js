require([
    "doh",
    "../../_util/router.js",
    "routed/Request",
    "dojomat/Session",
    "mijit/registry",
    'dojorama/ui/home/HomePage',
    "dojo/domReady!"
], function (
    doh,
    router,
    Request,
    Session,
    registry,
    HomePage
) {
    "use strict";
    
    doh.register("page destruction", [
        {
            name: 'all widgets should be destroyed',
            timeout: 10000,
            runTest: function () {
                var d = new doh.Deferred(),
                    request = new Request(''),
                    session = new Session(),
                    page = new HomePage({
                        request: request,
                        session: session,
                        router: router
                    }, 'page');

                page.startup();

                setTimeout(function () {
                    page.destroy();
                    doh.is(0, registry.length);
                    d.callback(true);
                }, 1000);
                
                return d;
            }
        }
    ]);

    doh.run();
});