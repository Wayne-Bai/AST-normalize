var fs = require('fs');
var path = require('path');
var pkg = require('./PKG/weiboPkgCss');
var log = require('../tools/log');
var cpf = require('./PKG/cpFile');
var writeMappingFile = require('./PKG/writeMappingFile')
var walk = require('../tools/dirWalker');
var mkdirP = require('../tools/mkdirP');

console.time('Package-Time');

function showUsage(){
	console.log('\n\033[91m' + 'Usage: node css/main.js fromDir toDir [projectPath] [-verbose][-noMD5]'  + '\033[0m\n');
	process.exit(1);
}
if(process.argv.length < 5){
	showUsage();
}
var from = process.argv[2], to = process.argv[3], projectPath = process.argv[4];

if(!from || !fs.existsSync(from)){
	console.log('need fromDir');
	showUsage();
}
if(!to || !fs.existsSync(to)){
	console.log('need toDir');
	showUsage();
}

//默认有md5处理,有'-noMD5'参数时不做md5计算,也不替换图片md5地址.
var noMD5 = process.argv.slice(3).join(" ").indexOf('-noMD5') !== -1;

if(!noMD5 && !projectPath){
	console.log('need projectPath to build MD5 mapping path, such as : t4/style or t4/apps/data or t4/appstyle/webim ...');
	showUsage();
}

//获得打包路径的列表
console.log('Finding files. Please wait...\n');

var files = walk(from), cssList = files.css, otherFiles = files.other;

//先把目标目录建立好
var target;
cssList.concat(otherFiles).forEach(function(uri){
	target = uri.replace(path.resolve(from),path.resolve(to));
	if(!fs.existsSync(path.dirname(target))){
		mkdirP(path.dirname(target),0777);
	}
});


console.log('Copy files(images) . Please wait...\n');
//复制非css文件(图片等,同时计算图片md5,以后续在css中替换其路径)
otherFiles.forEach(function(uri){
	cpf(from,to,uri,noMD5);
});


pkg(from,to,cssList,noMD5);

if(!noMD5){
	//输出md5映射文件
	writeMappingFile(from,to,projectPath);
}

console.log('\n################ Package CSS SUCCESS! ##################\n');
console.timeEnd('Package-Time');

//.packaged.txt表明可用于仿真测试,勿删!
fs.writeFileSync(path.join(path.resolve(to) ,".packaged.txt"), 'packaged at: ' + (new Date().getTime()) + '\n');
process.exit(0);