module.exports = {

  options: {
    preserveComments: false
  },

  'controllers': {
    files: [{
      src: 'dist/controllers.js',
      dest: 'dist/controllers.min.js'
    }]
  },

  'services': {
    files: [{
      src: 'dist/services.js',
      dest: 'dist/services.min.js'
    }]
  },


  'lib': {
    options: {
      sourceMap: false
    },
    files: {
      'dist/libs.min.js': ['dist/libs.min.js']
    }
  },

  'app': {
    options: {
      sourceMap: true
    },
    files: {
      './assets/app.min.js': ['./assets/app.js']
    }
  }

};