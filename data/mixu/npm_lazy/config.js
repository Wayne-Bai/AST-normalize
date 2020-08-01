var path = require('path'),
    homePath = path.normalize(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']);

module.exports = {
  // Logging config
  loggingOpts: {
    // Print to stdout with colors
    logToConsole: true,
    // Write to file
    logToFile: false,

    // This should be a file path.
    filename: homePath + '/npm_lazy.log'
  },

  // Cache config

  // `cacheDirectory`: Directory to store cached packages.
  //
  // Note: Since any relative path is resolved relative to the current working
  // directory when the server is started, you should use a full path.

  cacheDirectory: homePath + '/.npm_lazy',

  // `cacheAge`: maximum age before an index is refreshed from remoteUrl
  // - negative value means no refresh (e.g. once cached, never update the package.json metadata)
  // - zero means always refresh (e.g. always ask the registry for metadata)
  // - positive value means refresh every n milliseconds
  //   (e.g. 60 * 60 * 1000 = expire metadata every 60 minutes)
  //
  // Note: if you want to use `npm star` and other methods which update
  // npm metadata, you will need to set cacheAge to 0. npm generally wants the latest
  // package metadata version so caching package metadata will interfere with it.

  // Recommended setting: 0
  cacheAge: 0,

  // Request config

  // max milliseconds to wait for each HTTP response
  httpTimeout: 10000,
  // maximum number of retries per HTTP resource to get
  maxRetries: 5,
  // whether or not HTTPS requests are checked against Node's list of CAs
  // set false if you are using your own npm mirror with a self-signed SSL cert
  rejectUnauthorized: true,

  // Remote and local URL

  // external url to npm_lazy, no trailing /
  externalUrl: 'http://localhost:8080',
  // registry url with trailing /
  remoteUrl: 'https://registry.npmjs.org/',
  // bind port and host
  port: 8080,
  host: '0.0.0.0',

  // Proxy config
  // You can also configure this using the http_proxy and https_proxy environment variables
  // cf. https://wiki.archlinux.org/index.php/proxy_settings
  proxy: {
    // http: 'http://1.2.3.4:80/',
    // https: 'http://4.3.2.1:80/'
  }
};
