var fs = require('fs');
var path = require('path');
var log = require('../../tools/log');
var cssMD5 = require('../../tools/md5.js').cssMD5;

var file,hash,index;
var copyFile = function ( from, to ,noMD5) {
	file = fs.readFileSync(from,'binary');
	fs.writeFileSync(to, file, 'binary');
	if(!noMD5){
		hash = cssMD5(from,file);//copy图片的同时计算其md5 hash值,以便于后续在css中替换路径
		index = to.lastIndexOf('.');
		fs.writeFileSync(to.substr(0,index) + '_' + hash + to.substr(index), file, 'binary');
		hash = index = null;
	}
	file = null;
	log.info('> copy ' + to + ' done.');
};

module.exports = function ( fromBase, toBase,uri,noMD5 ) {
	var source = path.resolve(uri), target = source.replace(path.resolve(fromBase),path.resolve(toBase));
	copyFile(source, target,noMD5);
};