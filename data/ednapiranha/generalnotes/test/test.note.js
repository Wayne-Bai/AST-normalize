'use strict';

process.env.NODE_ENV = 'test'

var express = require('express');
var app = express();
var configurations = module.exports;
var settings = require('../settings')(app, configurations, express);

var should = require('should');
var redis = require('redis');
var client = redis.createClient();

var note = require('../lib/note');

client.select(app.set('redisnotes'), function (errDb, res) {
  console.log('TEST database connection status: ', res);
});

var currentId;
var req = {
  body: {
    text: 'test'
  },
  session: {
    email: 'test@test.com'
  },
  params: {}
}

describe('note', function () {
  after(function () {
    client.flushdb();
    console.log('cleared test database');
  });

  describe('add', function () {
    it('should add a note', function (done) {
      note.add(client, req, function (err, n) {
        currentId = n.id;
        should.exist(n);
        n.text.should.equal('test');
        done();
      });
    });

    it('should add a note with a link', function (done) {
      req.body.text = 'test http://generalgoods.net';
      note.add(client, req, function (err, n) {
        n.text.should.equal('test <a href="http://generalgoods.net" target="_blank">http://generalgoods.net</a>');
        done();
      });
    });

    it('should return with no note', function (done) {
      req.body.text = '';
      note.add(client, req, function (err, n) {
        should.exist(err);
        err.toString().should.equal('Error: Note cannot be empty');
        done();
      });
    });
  });

  describe('getAll', function () {
    it('should get all notes', function (done) {
      note.getAll(client, req, function (err, n) {
        should.exist(n);
        done();
      });
    });
  });

  describe('del', function () {
    it('should not delete a note', function (done) {
      req.session.email = 'invalid@test.com';
      req.params.id = currentId;
      note.del(client, req, function (err, resp) {
        should.exist(err);
        done();
      });
    });

    it('should delete a note', function (done) {
      req.session.email = 'test@test.com';
      note.del(client, req, function (err, resp) {
        should.exist(resp);
        done();
      });
    });
  });
});
