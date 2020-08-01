var db = require('../config/database.js');

exports.create = function(req, res) {
	if (req.body.amount === undefined || isNaN(Number(req.body.amount)) || req.body.category === undefined || req.body.date === undefined
		|| req.body.is_expense === undefined || req.params.accountId === undefined) {
		return res.json(400, {message:"Bad Data"});
	}

	var accountId = req.params.accountId;

	//TODO Check if user_id == account.user_id before adding the record.

	var record = new db.recordModel();
	record.account_id = accountId;
	record.user_id = req.user._id;
	record.amount = req.body.amount;
	record.category	= req.body.category;
	record.date	= req.body.date;
	record.description = req.body.description;
	record.is_expense = req.body.is_expense;	

	record.save(function(err) {
		if (err) {
			console.log(err);
			return res.send(400);
		}

		if (record.is_expense) {
			db.accountModel.update({_id:accountId}, { $inc: { balance: -record.amount } }, function(err, nbRows, raw) {
				return res.json(200, record);
			});
		}
		else {
			db.accountModel.update({_id:accountId}, { $inc: { balance: record.amount } }, function(err, nbRows, raw) {
				return res.json(200, record);
			});
		}
	});
};

exports.delete = function(req, res) {
	if (req.params.accountId === undefined || req.params.recordId === undefined) {
		return res.json(400, {message:"Bad Data"});
	}

	var recordId = req.params.recordId;
	var accountId = req.params.accountId;

	db.recordModel.findOne({_id: recordId, account_id: accountId, user_id: req.user._id}, function(err, record) {
		if (err) {
			console.log(err);
			return res.send(400);
		}

		if (record.is_expense) {
			db.accountModel.update({_id:accountId}, { $inc: { balance: record.amount } }, function(err, nbRows, raw) {
				record.remove();
				return res.json(200, record);
			});
		}
		else {
			db.accountModel.update({_id:accountId}, { $inc: { balance: -record.amount } }, function(err, nbRows, raw) {
				record.remove();
				return res.json(200, record);
			});
		}		
	});
};

