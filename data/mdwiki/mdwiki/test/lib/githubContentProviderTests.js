'use strict';

var request = require('request'),
    should = require('should'),
    Q = require('q'),
    sinon = require('sinon'),
    errors = require('../../lib/errors'),
    GitHubContentProvider = require('../../lib/githubContentProvider.js');

describe('githubContentProvider Tests', function () {
  var GITHUB_USER = 'janbaer';
  var GITHUB_REPO = 'wiki-content';

  var provider = new GitHubContentProvider(GITHUB_USER, GITHUB_REPO);

  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  describe('getPageContent tests', function () {
    describe('When the page exists', function () {
      var pageContent = 'content of index.md';
      beforeEach(function () {
        sandbox.stub(request, 'get').yields(null, { statusCode: 200 }, pageContent);
      });

      it('should return the content of the page', function (done) {
        provider.getPageContent('index')
          .then(function (content) {
            should.exists(content);
            content.should.be.equal(pageContent);
          })
          .done(done);
      });
    });

    describe('When the page not exists', function () {
      beforeEach(function () {
        sandbox.stub(request, 'get').yields(null, { statusCode: 404 }, null);
      });

      it('should reject a filenotfounderror', function (done) {
        var lastError;

        provider.getPageContent('index')
            .catch(function (error) {
              lastError = error;
            })
            .done(function () {
              should.exists(lastError);
              lastError.should.be.an.instanceof(errors.FileNotFoundError);
              done();
            });
      });
    });

    describe('When the github returns a error', function () {
      beforeEach(function () {
        sandbox.stub(request, 'get').yields(new Error('server error'), null, null);
      });

      it('should reject this error', function (done) {
        var lastError;

        provider.getPageContent('index')
            .catch(function (error) {
              lastError = error;
            })
            .done(function () {
              should.exists(lastError);
              lastError.message.should.be.equal('server error');
              done();
            });
      });
    });
  });

  describe('getPageContentAsHtml tests', function () {
    describe('When the page exists', function () {
      beforeEach(function () {
        sandbox.stub(request, 'get').yields(null, { statusCode: 200 }, '# Test');
      });

      it('should return the content of the page as html', function (done) {
        provider.getPageContentAsHtml('index')
          .then(function (content) {
            should.exists(content);
            content.should.be.equal('<h1 id="test">Test</h1>\n');
          })
          .done(done);
      });
    });
  });

  describe('When the user wants to get a single page', function () {
    describe('When some pages exists', function () {
      beforeEach(function () {
        sandbox.stub(request, 'get').yields(null, { statusCode: 200 }, '{ "name": "page1.md", "sha": "123" }');
      });

      it('should return this page', function (done) {
        provider.getPage('page1')
          .then(function (page) {
            should.exists(page);
            page.should.have.property('name', 'page1');
            page.should.have.property('sha', '123');
          })
          .done(done);
      });
    });
  });

  describe('getPages tests', function () {
    describe('When some pages exists', function () {
      beforeEach(function () {
        sandbox.stub(request, 'get').yields(null, { statusCode: 200 }, '[ { "name": "page1.md", "sha": "123" } ]');
      });

      it('should return this pages', function (done) {
        provider.getPages()
          .then(function (pages) {
            should.exists(pages);
            pages.should.have.lengthOf(1);
          })
          .done(done);
      });
    });

    describe('When not only pages exists', function () {
      beforeEach(function () {
        sandbox.stub(request, 'get').yields(null, { statusCode: 200 }, '[ { "name": "page2.md", "sha": "123" }, { "name": "otherfile.pdf", "sha": "456" } ]');
      });

      it('should return only the pages', function (done) {
        provider.getPages()
          .then(function (pages) {
            should.exists(pages);
            pages.should.have.lengthOf(1);
          })
          .done(done);
      });
    });

    describe('When the user or repository not exists', function () {
      beforeEach(function () {
        sandbox.stub(request, 'get').yields(null, { statusCode: 404 }, null);
      });

      it('should reject an RepositoryNotExistsError', function (done) {
        var lastError;

        provider.getPages()
          .catch(function (error) {
            lastError = error;
          })
          .done(function () {
            should.exists(lastError);
            //lastError.should.be.an.instanceof(errors.RepositoryNotExistsError);
            done();
          });
      });
    });

  });

  describe('search tests', function () {
    describe('When git returns items', function () {
      beforeEach(function () {
        sandbox.stub(request, 'get').yields(null, { statusCode: 200 }, '{ "total_count": 1, "items": [ { "name": "page1.md" } ] }');
      });

      it('should parse and return a searchresult', function (done) {
        provider.search('git')
          .then(function (items) {
            should.exists(items);
            items.should.have.lengthOf(1);
          })
          .done(done);
      });
    });
  });

  describe('Update page tests', function () {
    describe('When user wants to update an existing page', function () {
      var requestStub;

      beforeEach(function () {
        requestStub = sandbox.stub(request, 'put').yields(null, { statusCode: 200 }, '{}');
        sandbox.stub(provider, 'getPage').returns(new Q({ name: 'git', sha: '123456'}));
      });

      it('Should send the expected message to github and return the new html content', function (done) {
        var lastError;
        var expectedUrl = 'https://api.github.com/repos/janbaer/wiki-content/contents/git.md?access_token=12345678';
        var expectedMessage = {
          message: 'this is a update for git page',
          content: 'I2NvbnRlbnQgb2YgZ2l0IHBhZ2U=',
          branch: 'master',
          sha: '123456',
        };
        var expectedHtml = '<h1 id="content-of-git-page">content of git page</h1>\n';

        provider.oauth = '12345678';
        provider.savePage('this is a update for git page', 'git', '#content of git page')
          .catch(function (error) {
            lastError = error;
          })
          .done(function (response) {
            should.not.exists(lastError);
            response.should.have.property('body', expectedHtml);
            requestStub.calledWithMatch({ url: expectedUrl, headers: { 'user-agent': 'mdwiki' }, body: expectedMessage, json: true}).should.be.true;
            done();
          });
      });
    });
  });

  describe('create page tests', function () {
    describe('When the users wants to create a new page', function () {
      var requestStub;

      beforeEach(function () {
        requestStub = sandbox.stub(request, 'put').yields(null, { statusCode: 200 }, '{}');
        sandbox.stub(provider, 'getPage').returns(Q.reject(new errors.FileNotFoundError('page not found', 'git')));
      });

      it('Should send a new page to github and return it as html', function (done) {
        var lastError;
        var expectedUrl = 'https://api.github.com/repos/janbaer/wiki-content/contents/newPage.md?access_token=12345678';
        var expectedMessage = {
          message: 'created a new page',
          content: 'I2NvbnRlbnQgb2YgbmV3IHBhZ2U=',
          branch: 'master'
        };
        var expectedHtml = '<h1 id="content-of-new-page">content of new page</h1>\n';

        provider.oauth = '12345678';
        provider.savePage('created a new page', 'newPage', '#content of new page')
          .catch(function (error) {
            lastError = error;
          })
          .done(function (response) {
            should.not.exists(lastError);
            response.should.have.property('body', expectedHtml);
            requestStub.calledWithMatch({ url: expectedUrl, headers: { 'user-agent': 'mdwiki' }, body: expectedMessage, json: true}).should.be.true;
            done();
          });
      });
    });
  });

  describe('delete page tests', function () {
    describe('When user wants to delete an existing page', function () {
      var requestStub;

      beforeEach(function () {
        requestStub = sandbox.stub(request, 'del').yields(null, { statusCode: 200 }, '{}');
        sandbox.stub(provider, 'getPage').returns(new Q({ name: 'git', sha: '123456'}));
      });

      it('Should send the expected message to github and return just ok', function (done) {
        var lastError;
        var expectedUrl = 'https://api.github.com/repos/janbaer/wiki-content/contents/git.md?access_token=12345678';
        var expectedMessage = {
          message: 'Delete the page git',
          branch: 'master',
          sha: '123456',
        };

        provider.oauth = '12345678';
        provider.deletePage('git')
          .catch(function (error) {
            lastError = error;
          })
          .done(function () {
            should.not.exists(lastError);
            requestStub.calledWithMatch({ url: expectedUrl, headers: { 'user-agent': 'mdwiki' }, body: expectedMessage, json: true}).should.be.true;
            done();
          });
      });
    });
  });


  afterEach(function () {
    sandbox.restore();
  });
});


