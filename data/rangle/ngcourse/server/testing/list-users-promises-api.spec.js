'use strict';

var supertest = require('supertest-as-promised');
var assert = require('chai').assert;

var request = supertest('https://ngcourse.herokuapp.com');

describe('Get user list tests (promises)', function() {

  it ('Should be able to get the list of users', function() {
    return request.get('/api/v1/users')
      .expect(200);
  });
});
