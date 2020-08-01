exports.get = function (req, res) {

	var models = req.app.db.models,
		User = models.User;

	User.find({}, function (err, doc){
		if (doc) {
			res.send(200, doc);
		} else {
			res.send(400, 'No data available.');
		}
	});

};