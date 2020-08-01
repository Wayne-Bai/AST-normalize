var mongoose = require('mongoose');
var db = require('../infra/dataService').getMongoConnection();

var userSchema = new mongoose.Schema({
  login: String, // unique
  id: Number, // unique
  access_token: String, // unique
  avatar_url: String,
  gravatar_id: String,
  url: String,
  html_url: String,
  followers_url: String,
  following_url: String,
  gists_url: String,
  starred_url: String,
  subscriptions_url: String,
  organizations_url: String,
  repos_url: String,
  events_url: String,
  received_events_url: String,
  type: String,
  name: String,
  company: String,
  blog: String,
  location: String,
  email: String,
  hireable: Boolean,
  bio: String,
  public_repos: Number,
  followers: Number,
  following: Number,
  created_at: String,
  updated_at: String,
  public_gists: Number,
  gistcamp_joindate: String,
  tags: [{
    // tag_id   : Number,
    tag_name: String,
    tag_url: String,
    gists: [{
      gist_id: String
    }]
  }],
  followings: [], // element of array is "login" property of user 
  starred_gists: [], // starred gists, element of array is gist's id
  watch: [] // full user information
});

module.exports = db.model('User', userSchema);
