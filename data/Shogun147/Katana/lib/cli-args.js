var Fs = require('fs');

function bool(str) {
  return /^y|yes|ok|true$/i.test(str);
}

var cmd = require('commander');

// TODO:
// expose this as something like App.args
// allow custom options using something like:
// App.args.map({
//  'cli arg name': 'app conf name' or ['app conf name', coercion fn]
// });

cmd
  .option('-u, --url <url>',          'Base URL')
  .option('    --http [bool]',        'Enable/Disable HTTP', bool)
  .option('-h, --http-host <host>',   'HTTP Host')
  .option('-p, --http-port <port>',   'HTTP Port', parseInt)
  .option('    --https [bool]',       'Enable/Disable HTTPS', bool)
  .option('    --https-host <host>',  'HTTPS Host')
  .option('    --https-port <port>',  'HTTPS Port', parseInt)
  .option('    --https-key <key>',    'HTTPS Private Key')
  .option('    --https-cert <cert>',  'HTTPS Public x509 Certificate')
  .option('    --https-ca <ca>',      'HTTPS Authority Certificate')
  .option('-c, --cookies [bool]',     'Enable/Disable cookies', bool)
  .option('-s, --session [bool]',     'Enable/Disable session', bool)
  .option('-m, --multiparser [bool]', 'Enable/Disable multiparser', bool)
  .option('-t, --statics [bool]',     'Enable/Disable statics', bool)
.parse(process.argv);

['httpsKey', 'httpsCert', 'httpsCa'].forEach(function(key) {
  cmd[key] && (cmd[key] = Fs.readFileSync(App.root + cmd[key]));
});

(cmd.http  !== undefined) && App.set('http', cmd.http);
(cmd.https !== undefined) && App.set('https', cmd.https);
(cmd.cookies     !== undefined) && App.set('cookies enabled',     cmd.cookies);
(cmd.session     !== undefined) && App.set('session enabled',     cmd.session);
(cmd.multiparser !== undefined) && App.set('multiparser enabled', cmd.multiparser);
(cmd.statics     !== undefined) && App.set('statics enabled',     cmd.statics);

cmd.url       && App.set('baseUrl',    cmd.url);
cmd.httpHost  && App.set('http host',  cmd.httpHost);
cmd.httpPort  && App.set('http port',  cmd.httpPort);
cmd.httpsHost && App.set('https host', cmd.httpsHost);
cmd.httpsPort && App.set('https port', cmd.httpsPort);
cmd.httpsKey  && App.set('https key',  cmd.httpsKey);
cmd.httpsCert && App.set('https cert', cmd.httpsCert);
cmd.httpsCa   && App.set('https ca',   cmd.httpsCa);
