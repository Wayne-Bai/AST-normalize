var Promise = require("promised-io/promise").Promise;
var commandline = require('../modules/commandline');
var Command = commandline.Command;
var log = require('../modules/log');
var fs = require('fs');

var processes = {};


function ignoreLatexmkRunLog() {
    "use strict";
    var ignoreNext = false;
    return function(output) {
        if(ignoreNext) {
            ignoreNext = false;
            return false;
        } else {
            var isLatexMkLog = output.output === 'Latexmk: Run number 1 of rule \'pdflatex\'';
            ignoreNext = isLatexMkLog;
            return !isLatexMkLog;
        }
    };
}

function compile(repoDir) {
    "use strict";
		log('Compiling PDF', repoDir);
		processes[repoDir] = true;
        var compilePromise = new Promise();
        var commandsToRun = [];

        if(fs.existsSync(repoDir + '/dippa.pdf')) {
            log('Last compilation was successful');
            log('Updating the last successful file');
            var removeLastSuccessful = new Command('rm dippa_last_successful.pdf', repoDir);
            var copyLastSuccessful = new Command('mv dippa.pdf dippa_last_successful.pdf', repoDir);

            commandsToRun.push(removeLastSuccessful);
            commandsToRun.push(copyLastSuccessful);
        } else {
            log('Last compilation was unsuccessful ' + repoDir + '/dippa.pdf');
        }
        var removeTemp = new Command('rm tmp.pdf', repoDir);
        var latexmk = new Command('latexmk -silent -pdf -r ../../../latexmkrc -jobname=tmp dippa', repoDir);
        var copy = new Command('cp tmp.pdf dippa.pdf', repoDir);

        commandsToRun.push(removeTemp);
        commandsToRun.push(latexmk);
        commandsToRun.push(copy);

        commandline.runAll(commandsToRun).then(function(output) {
            var outputFiltered = output.filter(ignoreLatexmkRunLog());
            outputFiltered.forEach(function(outputItem) {
                log(['[latex compile]', outputItem.output].join(' '));
            });
            log('Compiling done', repoDir);
            processes[repoDir] = false;
            compilePromise.resolve(outputFiltered);
        }, function(e) {
            log.error('Compile failed');
            log.error(e);
        });

        return compilePromise;
}

function isCompiling(repoDir) {
    "use strict";
	return !!processes[repoDir];
}

module.exports = {
	compile: compile,
	isCompiling: isCompiling
};

log('PDF compiler initialized');