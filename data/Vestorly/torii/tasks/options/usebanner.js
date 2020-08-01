module.exports = {
  addVersion: {
    options: {
      position: 'top',
      banner: "/**\n" +
              " * Torii version: <%= pkg.version %>\n" +
              " * Built: <%= new Date().toString() %>\n" +
              " */",
      linebreak: true
    },
    files: {
      src: ['dist/*.amd.js', 'dist/torii.js'],
    }
  }
};
