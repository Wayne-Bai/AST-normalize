module.exports = {
  '*': {

    /*
      see https://github.com/paypal/lusca
     */
    csrf: false,
    csp: {
      enabled: false,
      policy: {
        'default-src': '*'
      },
      reportOnly: false,
      reportUri: false
    },
    xframe: false,
    p3p: false,
    hsts: {
      enabled: false,
      maxAge: 31536000,
      includeSubDomains: true
    },

    /*
      see https://github.com/troygoode/node-cors
     */
    cors: {
      enabled: false,
      origin: '*',
      methods: ['GET', 'PUT', 'POST'],
      headers: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 31536000
    }
  },
  development: {
    csp: {
      reportOnly: true,
      reportUri: '/csp/report'
    }
  },
  production: {}
};
