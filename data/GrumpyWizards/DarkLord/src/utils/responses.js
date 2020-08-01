module.exports = {
	standard: function standard(res) {
		'use strict';

		return function (result) {
			res.status(result.status).send(result.data);
		};
	}
};