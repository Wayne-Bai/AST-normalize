// __Dependencies__
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var es = require('event-stream');
var baucis = require('../..');
var config = require('./config');
var deepPopulate = require('mongoose-deep-populate');

// __Private Module Members__
var app;
var server;

// __Fixture Schemata__
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;
var UserSchema = new Schema({});

var CommentSchema = new Schema({
  user  : {type: ObjectId, ref: 'user2'}
});

var PostSchema = new Schema({
  user    : {type: ObjectId, ref: 'user2'},
  comments: [{type: ObjectId, ref: 'comment'}],
  likes   : [{user: {type: ObjectId, ref: 'user2'}}],
  approved: {status: Boolean, user: {type: ObjectId, ref: 'user2'}}
});

PostSchema.plugin(deepPopulate, {});

mongoose.model('user2', UserSchema);
mongoose.model('comment', CommentSchema);
mongoose.model('post', PostSchema);

// __Module Definition__
var fixture = module.exports = {
  init: function (done) {
    mongoose.connect(config.mongo.url);

    var controller = baucis.rest('post');
    controller.query(function (request, response, next) {
      request.baucis.query.deepPopulate('comments.user');
      next();
    });

    app = express();
    app.use('/api', baucis());

    server = app.listen(8012);

    done();
  },
  deinit: function (done) {
    server.close();
    mongoose.disconnect();
    done();
  },
  create: function (done) {
    var User = mongoose.model('user2');
    var Post = mongoose.model('post');
    var Comment = mongoose.model('comment');

    var user = new User();
    var comment = new Comment({ user: user.id });
    var post = new Post({
      user: user.id,
      comments: [ comment.id ],
      likes   : [ { user: user.id } ],
      approved: { status: true, user: user.id }
    });

    var deferred = [
      User.remove.bind(User),
      Post.remove.bind(Post),
      Comment.remove.bind(Comment),
      user.save.bind(user),
      comment.save.bind(comment),
      post.save.bind(post)
    ];

    async.series(deferred, done);
  }
};
