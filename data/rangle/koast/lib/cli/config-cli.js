/* use strict */
var configInspector = require('../config-inspector');
var yargs = require('yargs');
argv = yargs.argv;

module.exports = exports = function (configOptions) {
  var debugInfo = configInspector.getConfigurationInformation(configOptions
    ._configurationInfo);

  if (!argv.mode || argv.mode === 'summary') {
    var summary = configInspector.getConfigurationSummary(debugInfo, {
      format: argv.format,
      display: argv.display,
      include: (argv.include) ? argv.include.split(',') : []._
    });
    if (summary.format === 'table') {
      console.log(summary.toString());
    } else if (summary.format === 'raw') {
      console.log(JSON.stringify(summary, null, ' '));
    }
  } else if (argv.mode === 'debug') {
    console.log(JSON.stringify(configOptions._configurationInfo, null, ' '));
  }

};

module.exports.help = function () {

  console.log('koast config inspector help');
  console.log('===========================');
  console.log('--mode  (summary | debug)');
  console.log('\tdisplay mode for output.');
  console.log('\tsummary(default): displays summary of configuration table');
  console.log(
    '\tdebug: displays json of config files loaded, other options are ignored'
  )
  console.log('--format (table | raw)');
  console.log('\tformat to display configuration in');
  console.log('\ttable (default): formats as table');
  console.log('\traw: displays summary as raw json');
  console.log('--include (P,V,AD,AE,BD,BE,S,SL,SSL)');
  console.log('\tcolumns from config summary to include in output');
  console.log('\tdefaults: P,V,SSL');
  console.log('\tP - json path of config value');
  console.log('\tV - final value of config segtting');
  console.log('\tAD - application default value');
  console.log('\tAE - application environment value');
  console.log('\tBD - koast default value');
  console.log('\tBE - koast environment value');
  console.log('\tS - source of the final/used configuration value');
  console.log('\tSL - location of the final/used configuration value');
  console.log('\tSSL - short form of S and SL combined');
  console.log('===========================');
  console.log('Example Usages:');
  console.log('koast configInfo --format raw --include P,V,S,SL');
  console.log('koast configInfo --format table --include P,V');

}