var emailValidator = require('./validators/email.validator.js');
var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	created: { type: Date, default: new Date(), required: true },
	email: { type: String, trim: true, unique: true, required: true, validate: emailValidator },
	active: { type: Boolean, default: true },
	verified: { type: Boolean, default: false },
	verifyToken: String,
	forgotPasswordToken: String,
	forgotPasswordExpires: Date,
	closeAccountToken: String,
	closeAccountExpires: Date
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });


module.exports = mongoose.model('User', userSchema);