/* jshint expr:true */
/* global require, describe, it, before, console */

'use strict';

var expect = require('chai').expect;


var versionReporter = require('../version-reporter');
var express = require('express');
var supertest = require('supertest');
var pkg = require('../../package.json');

describe('the version reporter middleware', function () {

  it('should return the proper powered by and version header', function(done) {
    var app = express();
    app.use(versionReporter.getMiddleware());
    app.use('/',function(req,res,next) { res.status(200).send({data:'ok'}); });
    var expectedVersion = pkg.version;
    supertest(app)
      .get('/')
      .end(function (err, res) {
        expect(res.headers['x-powered-by']).to.be.equal('Koast');
        expect(res.headers['x-koast-version']).to.be.equal(pkg.version);
        done();
      });

  });

});
