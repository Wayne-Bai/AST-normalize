'use strict';

var supertest = require('supertest');
var assert = require('chai').assert;

var request = supertest('https://ngcourse.herokuapp.com');

describe('Get user list tests', function() {

  it ('Should be able to get the list of users', function(done) {
    request.get('/api/v1/users')
      .expect(200, done);
  });
});
