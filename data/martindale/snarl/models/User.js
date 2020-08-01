var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = mongoose.SchemaTypes.ObjectId
  , passportLocalMongoose = require('passport-local-mongoose');

// this defines the fields associated with the model,
// and moreover, their type.
var UserSchema = new Schema({
    username: { type: String, required: true }
  , email: { type: String }
  , created: { type: Date, required: true, default: Date.now }
  , status: { type: String, enum: ['pending', 'member'], default: 'pending' }
  , image: {
      url: { type: String, default: '' }
    }
  , _starred: [ { type: ObjectId, ref: 'Course'} ]
});

// attach the passport fields to the model
UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model('User', UserSchema);

// export the model to anything requiring it.
module.exports = {
  User: User
};
