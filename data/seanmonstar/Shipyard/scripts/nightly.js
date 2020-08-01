var child = require('child_process'),
	fs = require('fs'),
	path = require('path'),
	build = require('./build');

var dest;

function sub(command, next) {
	child.exec(command, { cwd: path.join(__dirname, '../') },
		function(err, stdout, stderr) {
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
		if (err) {
			console.log('ERROR: ' + err);
			process.exit(1);
		} else {
			next();
		}
	});
}


function all() {
	build.__all(cp);
}

function cp() {
	var contents = fs.readFileSync(path.join(__dirname, '../shipyard-all.js'));
	fs.writeFileSync(dest, contents);
	console.log('File copied to ' + dest);
}

function main() {
	// MAIN
	// 1. pull master
	// 2. build all
	// 3. cp file to destination
	sub('git fetch origin', function() {
		sub('git reset --hard origin/master', all);
	});
}

if (require.main === module) {
	var dest = process.argv[2];
	main(dest);
}
