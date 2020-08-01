
/**
  Mailer
  
  Provides mail functionality to the application, with full unicode support.
  
  Transports available are SMTP, Amazon SES (Simple Email Service) and sendmail.
  
  » References:
  
    http://github.com/andris9/nodemailer
    
  » Usage:
  
    app.use('mailer');
    
    app.mailer.sendMail({
      from: "Sender <name@domain.com>",
      to: "receiver@example.com",
      subject: "Hello",
      text: "Hello World",
      html: "<p>Hello World</p>"
    }, function(err, res) {
      doSomething();
    });

 */

var app = protos.app,
    util = require('util'),
    nodemailer = protos.requireDependency('nodemailer', 'Mailer Middleware', 'mailer'),
    Application = app.constructor;
    
// http://www.nodemailer.org/

function Mailer(config, middleware) {
  
  // Set middleware instance
  app[middleware] = this;
  
  // Set configuration
  this.config = protos.extend({
    default: 'sendmail'
  }, config);
  
  createTransports.call(this);
  
}

/**
  Renders the html & plain text version of a message, using a view partial
  
  The view partial should provide output depending on the situation:
  
  a) Render the HTML version when the 'html' view local is true
  b) Render the Text version when the 'text' view local is true
  
  @param {string} partial View partial name to render
  @param {object} locals Locals object to pass to the partial
  @return {object} Object containing {text, html}
  @public
 */

Mailer.prototype.renderMessage = function(partial, locals) {
  
  var mailHtml, mailText;
  var mail_template = app.views.partials[partial];

  // Set html boolean
  locals.html = true;
  delete locals.text;

  // Render html template
  mailHtml = mail_template(locals);

  // Set plain boolean
  locals.text = true;
  delete locals.html;
  
  // Create registration email text
  mailText = mail_template(locals);
  
  // Return object containing rendered template
  return {
    html: mailHtml.trim(),
    text: mailText.trim()
  }
}

/**
  Sends mail using the default transport
  
  @param {object} data
  @public
 */

Mailer.prototype.sendMail = function(data, callback) {
  return this.default.sendMail(data, callback);
}

function createTransports() {
  
  var cfg, transport;
  
  for (var t in this.config) {
    cfg = this.config[t];
    if (typeof cfg == 'string') {
      cfg = [cfg, {}];
    } else if (util.isArray(cfg)) {
      if (cfg.length == 1) cfg.push({});
    } else {
      throw new Error("Mailer: array config expected");
    }
    this[t] = nodemailer.createTransport(cfg[0], cfg[1]);
  }
  
}

module.exports = Mailer;
