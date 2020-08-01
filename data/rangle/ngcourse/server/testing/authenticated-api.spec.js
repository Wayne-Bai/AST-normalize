'use strict';

var supertest = require('supertest-as-promised');
var assert = require('chai').assert;

var request = supertest('https://ngcourse.herokuapp.com');

describe('Authenticated endpoint demo', function() {
  var authToken;
  var goodCredentials = { username: 'alice', password: 'x' };
  var badCredentials = { username: 'alice', password: 'WRONG' };

  it ('Should fail with bad credentials', function() {
    return request.post('/auth/login')
      .send(badCredentials)
      .expect(401);
  });

  it ('Should succeed with good credentials', function() {
    return request.post('/auth/login')
      .send(goodCredentials)
      .expect(200)
      .expect(function(response) {
        var body = JSON.parse(response.text);
        authToken = body.meta.token;
      });
  });

  it ('Should be able to access authenticated endpoint', function() {
    return request.post('/api/v2/tasks')
      .set('Authorization', 'Bearer ' + authToken)
      .expect(200);
  });
});
