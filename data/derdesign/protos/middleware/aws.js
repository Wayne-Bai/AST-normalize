
/** 
  Amazon Web Services
  
  » References:
  
    https://github.com/SaltwaterC/aws2js
    https://github.com/SaltwaterC/aws2js/wiki/S3-Client
    https://github.com/SaltwaterC/aws2js/wiki/EC2-Client
    
  » Configuration Options:

    {string} accessKey: AWS access key
    {string} secretKey: AWS secret key
    {object} clients: Object containing the clients to configure
    
  » Example:
  
    app.use('aws', {
      accessKey: 'username',
      secretKey: 'password',
      clients: {
        thumbs: {
          type: 's3',
          setBucket: 'my.cool.bucket',
        },
        cloud: {
          type: 'ec2',
          setRegion: 'ap-southeast-1'
        }
      }
    });
    
  » Client Configuration
    
    In the example above, each client configuration receives a 'type' property, which
    is the AWS Client to use. For more info on the supported clients, refer to the
    aws2js module documentation (link in References section).
    
    The rest of the properties of each client configuration are the specific methods
    supported by the client in question. In the example above (on the s3 client, thumbs)
    the 'setBucket' option is set to 'my.cool.bucket'.
    
    This is the same as manually running `s3.setBucket('my.cool.bucket')` after loading 
    the aws client. In other words, the methods and arguments for the aws client are exposed
    as properties. If the argument is passed as an array, then `Function.prototype.apply` will
    be used to pass the arguments to the aws client.
    
    Upon instantiation, each defined client will be available in `app.aws.{client}`. The clients
    are instances of aws2js clients. For more info, consult the References section above.

*/

var app = protos.app,
    util = require('util'),
    aws2js = protos.requireDependency('aws2js', 'AWS Middleware', 'aws'),
    isArray = util.isArray;

var accessKey, secretKey;

function AmazonWebServices(config, middleware) {

  var self = this;

  // Attach instance to application
  app[middleware] = this;

  // Middleware config
  config = protos.extend({
    accessKey: null,
    secretKey: null,
    clients: {}
  }, config);
  
  accessKey = config.accessKey;
  secretKey = config.secretKey;
  
  if (!accessKey && !secretKey) {
    throw new Error("Please specify the 'accessKey' and 'secretKey' in the config");
  }
  
  var clients = config.clients;
  
  // Configure each of the client aliases
  Object.keys(clients).forEach(function(alias) {
    
    // Check for service type
    if (!clients[alias].type) throw new Error("Missing type for client alias: " + alias);
    
    var opts = clients[alias],
        type = opts.type;
        
    var client = self.load(opts.type); delete opts.type;
    var key, args, method;
    
    // Call each property of the configuration objects with its parameters
    for (key in opts) {
      if (client.hasOwnProperty(key) && client[key] instanceof Function) {
        method = client[key];
        args = opts[key];
        method.apply(client, isArray(args) ? args : [args]);
      } else {
        throw new Error(util.format("Method not available in '%s' %s client: %s", alias, type, key));
      }
      
    }
    
    // Assign configured client to alias in instance
    self[alias] = client;
    
  });

}

AmazonWebServices.prototype.load = function(client) {
  return aws2js.load(client, accessKey, secretKey);
}

module.exports = AmazonWebServices;
