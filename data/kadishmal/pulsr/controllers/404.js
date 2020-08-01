define(['baseController', 'module'], function(BaseController, module) {
    return BaseController.override({
		title: 'Page not found',
        moduleId: module.id,
        layout: 'front-page',
        pagelets: [
            {
                name: 'content',
                options: {
                    layout: 'post',
                    contents: ['404']
                }
            },
            {name: 'ga'}
        ]
	});
});