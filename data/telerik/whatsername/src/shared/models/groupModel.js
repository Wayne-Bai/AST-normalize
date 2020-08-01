(function(wrn){

	'use strict';

	wrn.groupModel = new kendo.data.DataSource({
		offlineStorage: 'groupModel',
		schema: {
			model: {
				id: "id"
			}
		}
	});

	wrn.groupModel.online(false);
	wrn.groupModel.read();

})(wrn); //pass in global namespace

