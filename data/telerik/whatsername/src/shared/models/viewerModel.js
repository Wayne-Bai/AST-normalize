(function(wrn){

	'use strict';

	wrn.viewerModel = new kendo.data.DataSource({
		offlineStorage: 'viewerModel',
		schema: {
			model: {
				id: "id"
			}
		}
	});

	wrn.viewerModel.online(false);
	wrn.viewerModel.read();

})(wrn); //pass in global namespace

