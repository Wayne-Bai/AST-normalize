module.exports = {
  all: {
    files: {
      'dist/<%= pkg.name %>.amd.js': [
        'dist/<%= pkg.name %>.amd.js'
      ],
      'dist/<%= pkg.name %>-<%= pkg.version %>.amd.js': [
        'dist/<%= pkg.name %>-<%= pkg.version %>.amd.js'
      ]
    }
  }
};
