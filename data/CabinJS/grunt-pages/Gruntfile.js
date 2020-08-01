var pygmentize = require('pygmentize-bundled');
module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var globalConfig = {};

  grunt.initConfig({
    globalConfig: globalConfig,

    pages: {

      // Tests EJS template rendering, default post URL formatting destinations,
      // page destinations/content, templateEngine page filtering and options.data as a String
      target1: {
        src: 'test/fixtures/integration/input/posts/',
        dest: 'dest1',
        layout: 'test/fixtures/integration/input/target1/layouts/post.ejs',
        url: 'blog/posts/:title/',
        options: {
          pageSrc: 'test/fixtures/integration/input/target1/pages',

          // ignored.jade file in option.pageSrc is expected to be ignored
          templateEngine: 'ejs',

          // Test passing data as a String
          data: 'test/fixtures/integration/input/target1/data/data.json',

          // Test RSS config using default options
          rss: {

            // Required properties
            title: 'Blog of Blogs',
            description: 'The Description',
            url: 'http://the.url.com',

            // Optional properties
            author: 'The Author',
            pubDate: new Date(1000) // Must pass date for output to match
          }
        }
      },

      // Tests Jade template rendering, custom post URL formatting, and pagination, custom post grouping, and custom urls
      target2: {
        src: 'test/fixtures/integration/input/posts/',
        dest: 'dest2',
        layout: 'test/fixtures/integration/input/target2/layouts/post.jade',
        url: function (post, options) {
          return 'blog/posts/' + options.formatPostUrl(post.title) + '/';
        },
        options: {

          // Test using a different post url format
          formatPostUrl: function (urlSegment) {
            return urlSegment.replace(/[^a-zA-Z0-9]/g, '_');
          },
          pageSrc: 'test/fixtures/integration/input/target2/pages',

          // Instead of sorting by date descending, sort by date ascending
          sortFunction: function (a, b) {
            return a.date - b.date;
          },

          // Test passing data as an Object
          data: {
            test: 'object'
          },

          // Test RSS config using all custom options
          rss: {
            path: 'rss/rss.xml',
            numPosts: 1,
            author: 'The Author',
            title: 'Blog of Blogs',
            description: 'The Description',
            url: 'http://the.url.com',
            image_url: 'http://the.url.com/image.jpg',
            docs: 'The Docs',
            managingEditor: 'The Managing Editor',
            webMaster: 'The Web Master',
            copyRight: '2044 Industries Inc.',
            language: 'sp',
            categories: ['stuff', 'things', 'items', 'widgets'],
            ttl: '40',
            pubDate: new Date(1000) // Must pass date for output to match
          },

          // First pagination config object tests default pagination grouping
          // using a custom url
          pagination: [{
            postsPerPage: 1,
            listPage: 'test/fixtures/integration/input/target2/pages/blog/index.jade',
            url: 'list/:id/index.html'

          // Second pagination config tests a custom post grouping by the 'tags'
          // metadata property
          }, {
            listPage: 'test/fixtures/integration/input/target2/pages/blog/index.jade',
            getPostGroups: function (posts) {
              var postGroups = {};
              posts.forEach(function (post) {
                post.tags.forEach(function (tag) {
                  tag = tag.toLowerCase();
                  if (postGroups[tag]) {
                    postGroups[tag].posts.push(post);
                  } else {
                    postGroups[tag] = {
                      posts: [post]
                    };
                  }
                });
              });

              return grunt.util._.map(postGroups, function (postGroup, id) {
                return {
                  id: id,
                  posts: postGroup.posts
                };
              });
            }
          }]
        }
      },

      // Tests default pagination behavior without using other pages(via options.pageSrc)
      target3: {
        src: 'test/fixtures/integration/input/posts/',
        dest: 'dest3',
        layout: 'test/fixtures/integration/input/target2/layouts/post.jade',
        url: 'blog/posts/:title/',
        options: {
          pagination: {
            postsPerPage: 1,
            listPage: 'test/fixtures/integration/input/target2/pages/blog/index.jade'
          }
        }
      },

      // Tests Handlebars template rendering and custom marked options
      target4: {
        src: 'test/fixtures/integration/input/posts/',
        dest: 'dest4',
        layout: 'test/fixtures/integration/input/handlebars/layouts/post.handlebars',
        url: 'blog/posts/:title/',
        options: {
          partials: 'test/fixtures/integration/input/handlebars/partials/**/*.handlebars',
          // Test overriding marked options
          markedOptions: function (marked) {
            var codeBlockNum = 0;
            return {
              renderer: new marked.Renderer(),
              highlight: function (code, lang, callback) {
                // Use [pygments](http://pygments.org/) for syntax highlighting
                pygmentize({ lang: lang, format: 'html' }, code, function (err, result) {
                  callback(err, '<span>' + codeBlockNum + '</span>' + result.toString());
                  codeBlockNum++;
                });
              }
            };
          }
        }
      }
    },
    mdlint: ['README.md'],
    clean: {
      build: ['dest*'],
      cache: ['.grunt']
    },
    copy: {
      styles: {
        files: [{
          expand: true,
          flatten: true,
          src: ['test/fixtures/integration/input/styles/*'],
          dest: 'dev/styles/'
        }]
      }
    },
    simplemocha: {
      options: {
        globals: ['should'],
        timeout: 10000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      },
      all: {
        src: ['test/*.js']
      },
      spec: {
        src: ['test/<%= globalConfig.file %>.js']
      }
    },
    connect: {
      server: {
        options: {
          port: 9001,
          base: 'dev',
          keepalive: true
        }
      }
    },
    concurrent: {
      tasks: ['connect:server', 'watch', 'open'],
      test: ['simplemocha:all', 'jshint', 'mdlint'],
      options: {
        logConcurrentOutput: true
      }
    },
    watch: {
      options: {
        livereload: true
      },
      src: {
        files: ['tasks/*.js', 'test/fixtures/integration/input/**'],
        tasks: ['jshint', 'build']
      },
      tests: {
        files: ['test/*.js']
      }
    },
    jshint: {
      options: {
        bitwise: true,
        indent: 2,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        nonew: true,
        quotmark: 'single',
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        trailing: true,
        eqnull: true,
        node: true,
        expr: true,
        evil: true,
        globals: {
          describe: true,
          it: true,
          before: true
        }
      },
      files: {
        src:  ['*.js', 'test/*.js', 'tasks/*.js']
      }
    },
    shell: {
      debugtest: {
        options: {
          stdout: true
        },
        command: 'node --debug-brk $(which grunt) test'
      }
    },
    'node-inspector': {
      dev: {}
    }
  });

  grunt.loadTasks('./tasks');
  grunt.registerTask('build', ['clean:build', 'copy', 'pages:paginated']);
  grunt.registerTask('test', ['clean', 'jshint', 'simplemocha:all', 'mdlint', 'clean']);
  grunt.registerTask('default', ['concurrent']);

  grunt.registerTask('bench', 'Runs a grunt-pages config and measures performance', function (target) {
    grunt.option('bench', true);
    grunt.task.run('clean', 'pages:' + target);
  });

  grunt.registerTask('spec', 'Runs a task on a specified file', function (fileName) {
    globalConfig.file = fileName;
    grunt.task.run('simplemocha:spec');
  });
};
