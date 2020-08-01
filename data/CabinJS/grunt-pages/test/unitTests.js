/* global before */
var pages = require('../tasks/pages.js');
var grunt = require('grunt');
var sinon = require('sinon');
var _ = require('lodash');
require('should');

var lib;
var failStub = sinon.stub(grunt.fail, 'fatal');

describe('grunt-pages library', function () {

  describe('getMetadataEnd', function () {

    before(function () {
      lib = pages(grunt);
    });

    it('should return the index of the file string where the metadata ends', function () {
      var fileString = ' {title: "test", people: { me: true}}';
      lib.getMetadataEnd(fileString, 2).should.eql(fileString.length);
    });

    it('should return false if there isn\'t a closing } for every opening {', function () {
      var fileString = '{title: "test", people: { me: true}';
      lib.getMetadataEnd(fileString, 1).should.not.be.ok;
    });

  });

  describe('parsePostData', function () {

    before(function () {
      lib = pages(grunt);
    });

    it('should log an error if there isn\'t an opening { before a } in the file string', function () {
      lib.parsePostData(__dirname + '/fixtures/unit/posts/badobjectformat.md');
      failStub.lastCall.args[0].should.include('The metadata for the following post is formatted incorrectly:');
    });

    describe('when parsing JavaScript Object metadata', function () {

      it('should log an error if the post metadata is not a valid JavaScript Object', function () {
        lib.parsePostData(__dirname + '/fixtures/unit/posts/badobjectmetadata.md');
        failStub.lastCall.args[0].should.include('The metadata for the following post is formatted incorrectly:');
      });

      it('should return the post metadata and markdown if the metadata is a valid JavaScript Object', function () {
        lib.parsePostData(__dirname + '/fixtures/unit/posts/goodobjectmetadata.md').title.should.eql('Good Post :)');
        lib.parsePostData(__dirname + '/fixtures/unit/posts/goodobjectmetadata.md').markdown.should.eql('\n\n# Hello');
      });

    });

  });

  describe('setData', function () {

    var data = { test: 'testval' };

    describe('when options.data is an Object', function () {

      it('should add the options.data property directly to the templateData object', function () {
        var templateData = {};

        lib = pages.call(_.extend(grunt, {
          testOptions: {
            data: data
          }
        }), grunt);
        lib.setData(templateData);
        templateData.data.should.eql(data);
      });
    });

    describe('when options.data is a String', function () {

      it('should read a JSON file specified by the options.data property and copy it directly to the templateData object', function () {
        var templateData = {};

        lib = pages.call(_.extend(grunt, {
          testOptions: {
            data: 'test/fixtures/unit/data/gooddata.json'
          }
        }), grunt);

        lib.setData(templateData);
        templateData.data.should.eql(data);
      });

      it('should log an error if the JSON file specified by the options.data String is invalid', function () {
        lib = pages.call(_.extend(grunt, {
          testOptions: {
            data: 'test/fixtures/unit/data/baddata.json'
          }
        }), grunt);

        lib.setData({});
        failStub.lastCall.args[0].should.include('Data could not be parsed');
      });

    });

    it('should log an error if the options.data format is not an Object or String', function () {
      lib = pages.call(_.extend(grunt, {
        testOptions: {
          data: 4
        }
      }), grunt);
      lib.setData({});
      failStub.lastCall.args[0].should.include('`options.data` format not recognized.');
    });
  });

  describe('getPostUrl', function () {

    it('should log an error if the dest property isn\'t specified', function () {
      lib = pages.call(_.extend(grunt, {
        testContext: {
          data: {
            url: 'test'
          }
        }
      }), grunt);

      lib.getPostUrl({});
      failStub.lastCall.args[0].should.include('Please specify the dest property in your config.');
    });

    it('should log an error if the post doesn\'t contain metadata specified as a :variable in its URL', function () {
      lib = pages.call(_.extend(grunt, {
        testContext: {
          data: {
            dest: 'dest',
            url: 'posts/:title'
          }
        }
      }), grunt);

      lib.getPostUrl({});
      failStub.lastCall.args[0].should.include('Required title attribute not found');
    });

    it('should return the post destination after replacing the :variables in the URL with its metadata', function () {
      lib = pages.call(_.extend(grunt, {
        testContext: {
          data: {
            url: 'posts/:title/',
            dest: 'dest'
          }
        }
      }), grunt);

      lib.getPostUrl({
        title: 'Cool Post'
      }).should.include('posts/cool-post/');
    });

    it('should ignore .html when replacing the :variables in the URL with its metadata', function () {
      lib = pages.call(_.extend(grunt, {
        testContext: {
          data: {
            url: 'posts/:title.html',
            dest: 'dest'
          }
        }
      }), grunt);

      lib.getPostUrl({
        title: 'Cool Post'
      }).should.include('posts/cool-post.html');
    });

  });

  describe('getDestFromUrl', function () {

    lib = pages.call(_.extend(grunt, {
      testContext: {
        data: {
          dest: 'dest'
        }
      }
    }), grunt);

    describe('if the post\'s url ends with a /', function () {
      it('should return the post destinations by adding index.html to the URL', function () {
        lib.getDestFromUrl('blog/').should.eql('dest/blog/index.html');
      });
    });

    describe('if the post\'s url doesn\'t begin with a /', function () {
      it('should add a / to the begining of the post dest', function () {
        lib.getDestFromUrl('blog').should.eql('dest/blog.html');
      });
    });

    describe('if the post\'s url doesn\'t end with a /', function () {
      it('should return the post destinations by adding .html to the URL', function () {
        lib.getDestFromUrl('about').should.eql('dest/about.html');
      });
    });
  });

  describe('shouldRenderPage', function () {

    it('should return false when the page is configured as the options.pagination.listPage', function () {
      lib = pages.call(_.extend(grunt, {
        testOptions: {
          pagination: {
            listPage: 'list/index.jade'
          }
        }
      }), grunt);
      lib.shouldRenderPage('list/index.jade').should.not.be.ok;
    });

    it('should return false when the page is a .dotfile', function () {
      lib.shouldRenderPage('.about.jade').should.not.be.ok;
    });

    it('should return false when the options.templateEngine is set and the template extension is not from that engine', function () {
      lib = pages.call(_.extend(grunt, {
        testOptions: {
          templateEngine: 'ejs'
        }
      }), grunt);
      lib.shouldRenderPage('about.jade').should.not.be.ok;
    });

    it('should return false when the page is configured as the options.pagination.listPage', function () {
      lib = pages.call(_.extend(grunt, {
        testOptions: {
          pagination: {
            listPage: 'list/index.jade'
          }
        }
      }), grunt);
      lib.shouldRenderPage('list/index.jade').should.not.be.ok;
    });

    it('should return true if the page doesn\'t match any of the above situations', function () {
      lib.shouldRenderPage('about.jade').should.be.ok;
    });

  });

  describe('reducePostContent', function () {

    it('should reduce the content of templateData.posts when logging template data about posts and pages', function () {
      lib.reducePostContent({ posts: [{ content: 'testdataforeverandever' }] }).should.eql({ posts: [{ content: 'testdataforeverandever'.substr(0, 10) + '...' }] });
    });

    it('should reduce the content of templateData.post when logging template data about posts', function () {
      lib.reducePostContent({ post: { content: 'testdataforeverandever' }}).should.eql({ post: { content: 'testdataforeverandever'.substr(0, 10) + '...' }});
    });

    it('should not modify the passed in object', function () {
      var passedInObject = { post: { content: 'testdataforeverandever' }};
      lib.reducePostContent(passedInObject);
      passedInObject.should.eql({ post: { content: 'testdataforeverandever' }});
    });
  });

  describe('getPostGroups', function () {

    it('should return post groups based on the pagination.postsPerPage\'s value', function () {
      lib.getPostGroups([1, 2, 3, 4], { postsPerPage: 2 }).should.eql([{
        posts: [1, 2],
        id: 0
      }, {
        posts: [3, 4],
        id: 1
      }]);
    });

  });

  describe('getListPageUrl', function () {

    it('should log an error if `options.pagination.listPage` doesn\'t exist', function () {
      lib = pages.call(_.extend(grunt, {
        testOptions: {
          pageSrc: 'test/fixtures/unit/pages'
        }
      }), grunt);

      lib.getListPageUrl(1, { listPage: 'test/fixtures/unit/typo.jade' });

      failStub.lastCall.args[0].should.include('No `options.pagination.listPage` found at ');
    });

    it('should log an error when the pagination.url doesn\'t contain \':id\'', function () {
      lib = pages.call(_.extend(grunt, {
        testContext: {
          data: {
            dest: 'dest'
          }
        }
      }), grunt);

      lib.getListPageUrl(1, {
        listPage: 'test/fixtures/unit/pages/blog/index.jade',
        url: 'pages/:i/index.html'
      });

      failStub.lastCall.args[0].should.include('The `options.pagination.url` must include an \':id\' variable which is replaced by the list page\'s identifier.');
    });

    describe('when options.pageSrc is set', function () {

      it('should log an error if `options.pagination.listPage` isn\'t located inside the options.pageSrc directory', function () {
        lib = pages.call(_.extend(grunt, {
          testOptions: {
            pageSrc: 'test/fixtures/unit/pages'
          }
        }), grunt);

        lib.getListPageUrl(1, { listPage: 'test/fixtures/unit/pages.jade' });

        failStub.lastCall.args[0].should.include('The `options.pagination.listPage` must be within the options.pageSrc directory.');
      });

      it('should return the listPage\'s relative location to options.pageSrc as the url of page 0', function () {
        lib = pages.call(_.extend(grunt, {
          testContext: {
            data: {
              dest: 'dest'
            }
          },
          testOptions: {
            pageSrc: 'test/fixtures/unit/pages'
          }
        }), grunt);

        lib.getListPageUrl(0, { listPage: 'test/fixtures/unit/pages/blog/index.jade' }).should.eql('blog/');
      });

      it('should replace options.pageSrc\'s basename with the pagination.url including the page\'s id', function () {
        lib = pages.call(_.extend(grunt, {
          testContext: {
            data: {
              dest: 'dest'
            }
          },
          testOptions: {
            pageSrc: 'test/fixtures/unit/pages'
          }
        }), grunt);

        lib.getListPageUrl(1, {
          listPage: 'test/fixtures/unit/pages/blog/index.jade',
          url: ':id/index.html'
        }).should.eql('blog/1/');
      });
    });

    describe('when options.pageSrc is not set', function () {

      it('should return an empty string as the url of page 0', function () {
        lib = pages.call(_.extend(grunt, {
          testContext: {
            data: {
              dest: 'dest'
            }
          },
          testOptions: {}
        }), grunt);

        lib.getListPageUrl(0, { listPage: 'test/fixtures/unit/pages/blog/index.jade' }).should.eql('');
      });

      it('should return pagination.url replaced with the page\'s id as the url of every other list page', function () {
        lib = pages.call(_.extend(grunt, {
          testContext: {
            data: {
              dest: 'dest'
            }
          }
        }), grunt);

        lib.getListPageUrl(1, {
          listPage: 'test/fixtures/unit/pages/blog/index.jade',
          url: 'pages/:id/'
        }).should.eql('pages/1/');
      });
    });
  });
});