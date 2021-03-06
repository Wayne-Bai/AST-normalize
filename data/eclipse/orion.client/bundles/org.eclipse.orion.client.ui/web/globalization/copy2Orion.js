/*******************************************************************************
 * @license Licensed Materials - Property of IBM (c) Copyright IBM Corporation
 *          2014, 2015. All Rights Reserved.
 * 
 * Note to U.S. Government Users Restricted Rights: Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 ******************************************************************************/
/**
 * Usage: node copyf.js
 */

/*global __dirname Buffer console process require*/
/*jslint regexp:false laxbreak:true*/

// compat shim for v0.6-0.8 differences
//require('../lib/compat');

var child_process = require('child_process');
var dfs = require('deferred-fs'), Deferred = dfs.Deferred;
var path = require('path');
var IS_WINDOWS = process.platform === 'win32';

var pathToTranslationRoot = 'C:/IDSDev/translations/';
var pathToDestBundle = 'C:/IDSDev/OrionSource/org.eclipse.orion.client/bundles/';
var configFile = 'C:/temp/config.js';
var pathToCWDDir = path.resolve(__dirname, './');
/**
 * Pass varargs to get numbered parameters, or a single object for named parameters.
 * eg. format('${0} dollars and ${1} cents', 3, 50);
 * eg. format('${dollars} dollars and ${cents} cents', {dollars:3, cents:50});
 * @param {String} str String to format.
 * @param {varags|Object} arguments 
 */
function format(str/*, args..*/) {
	var maybeObject = arguments[1];
	var args = (maybeObject !== null && typeof maybeObject === 'object') ? maybeObject : Array.prototype.slice.call(arguments, 1);
	return str.replace(/\$\{([^}]+)\}/g, function(match, param) {
		return args[param];
	});
}

/**
 * @param {Object} [options]
 * @returns {Deferred} Doesn't reject (but perhaps it should -- TODO)
 */
function execCommand(cmd, options, suppressError) {
	options = options || {};
	suppressError = typeof suppressError === 'undefined' ? false : suppressError;
	var d = new Deferred();
	console.log(cmd);
	child_process.exec(cmd, {
		cwd: options.cwd || pathToCWDDir,
		stdio: options.stdio || 'inherit'
	}, function (error, stdout, stderr) {
		if (error && !suppressError) {
			console.log(error.stack || error);
		}
		if (stdout) { console.log(stdout); }
		d.resolve();
	});
	return d;
}

/** @returns {String} command for performing recursive copy of src directory to dest directory. */
function getCopyDirCmd(src, dest) {
	return IS_WINDOWS ? format('xcopy /e /h /q /y /i "${0}" "${1}"', src, dest) : format("cp -R ${0}/* ${1}", src, dest);
}

function getCopyFileCmd(src, dest) {
	return IS_WINDOWS ? format('xcopy /y "${0}" "${1}"', src, dest) : format("cp -R ${0}/* ${1}", src, dest);
}

function section(name) {
	console.log('-------------------------------------------------------\n' + name + '\n');
}

function copySingleFile(copyEntry) {
	var pathToDest = path.resolve(__dirname, copyEntry.dest);
	var pathToSource = path.resolve(__dirname, copyEntry.source);
	var pathToDestConfig = path.resolve(__dirname, copyEntry.destConfig);
	var pathToConfigFile = path.resolve(__dirname, configFile);
	/*
	 * Copy steps begin here
	 */
	return dfs.exists(pathToDest).then(function(exists) {
		if (!exists) {
			section('Creating destination dir ' + pathToDest);
			return dfs.mkdir(pathToDest);
		}
	}).then(function() {
		return execCommand(getCopyFileCmd(pathToSource, pathToDest)).then(function() {
			section(configFile);
			section(pathToDestConfig);
			return execCommand(getCopyFileCmd(pathToConfigFile, pathToDestConfig));}
		);
	});
}

function exitFail(error) {
	if (error) { console.log('An error occurred: ' + (error.stack || error)); }
	process.exit(1);
}

function exitSuccess() { process.exit(0); }

var folderTemplate = [
	'org.eclipse.orion.client.webtools/web/webtools/nls/dummy_language/messages',
	'org.eclipse.orion.client.cf/web/cfui/nls/dummy_language/messages',
	'org.eclipse.orion.client.users/web/profile/nls/dummy_language/messages',
	'org.eclipse.orion.client.javascript/web/javascript/nls/dummy_language/messages',
	'org.eclipse.orion.client.javascript/web/javascript/nls/dummy_language/problems',
	'org.eclipse.orion.client.help/web/orion/help/nls/dummy_language/messages',
	'org.eclipse.orion.client.editor/web/orion/editor/nls/dummy_language/messages',
	'org.eclipse.orion.client.git/web/git/nls/dummy_language/gitmessages',
	'org.eclipse.orion.client.ui/web/orion/compare/nls/dummy_language/messages', 
	'org.eclipse.orion.client.ui/web/orion/content/nls/dummy_language/messages',
	'org.eclipse.orion.client.ui/web/orion/crawler/nls/dummy_language/messages',
	'org.eclipse.orion.client.ui/web/orion/edit/nls/dummy_language/messages',
	'org.eclipse.orion.client.ui/web/orion/mixloginstatic/nls/dummy_language/messages',
	'org.eclipse.orion.client.ui/web/orion/navigate/nls/dummy_language/messages',
	'org.eclipse.orion.client.ui/web/orion/nls/dummy_language/messages',
	'org.eclipse.orion.client.ui/web/orion/operations/nls/dummy_language/messages',
	'org.eclipse.orion.client.ui/web/orion/problems/nls/dummy_language/messages',
	'org.eclipse.orion.client.ui/web/orion/search/nls/dummy_language/messages',
	'org.eclipse.orion.client.ui/web/orion/settings/nls/dummy_language/messages',
	'org.eclipse.orion.client.ui/web/orion/shell/nls/dummy_language/messages',
	'org.eclipse.orion.client.ui/web/orion/sites/nls/dummy_language/messages',
	'org.eclipse.orion.client.ui/web/orion/stringexternalizer/nls/dummy_language/messages',
	'org.eclipse.orion.client.ui/web/orion/widgets/nls/dummy_language/messages'
];

var allLanguages = [
	{name: "Chinese (Simplified)", locale: "zh", prefix: "zh"},
	{name: "Chinese (Traditional)", locale: "zh-tw", prefix: "zh_TW"},
	{name: "Japanese", locale: "ja", prefix: "ja"},
	{name: "French", locale: "fr", prefix: "fr"},
	{name: "German", locale: "de", prefix: "de"},
	{name: "Spanish", locale: "es", prefix: "es"},
	{name: "Italian", locale: "it", prefix: "it"},
	{name: "Portuguese (Brazilian)", locale: "pt-br", prefix: "pt_BR"}
];

function generateCopyArray(sourceRoot, destRoot) {
	var copyArray = [];
	allLanguages.forEach(function(language) {
		var sourceTemplate = folderTemplate.map(function(folder){
			return sourceRoot + language.prefix + "/" + folder.replace("/dummy_language/", "/" + "root" + "/") + ".js";
		}); 
		var destTemplate = folderTemplate.map(function(folder){
			return destRoot + folder.replace(/dummy_language.*/, language.locale);
		}); 
		var destTemplateConfig = folderTemplate.map(function(folder){
			return destRoot + folder.replace("/dummy_language/", "/") + ".js";
		}); 
		for(var i = 0; i < sourceTemplate.length; i++) {
			copyArray.push({source: sourceTemplate[i], dest: destTemplate[i], destConfig: destTemplateConfig[i]});
		}
	});
	return copyArray;
}

/**
 * @returns {Promise}
 */
function processFile() {
	var result =  generateCopyArray(pathToTranslationRoot, pathToDestBundle);
	var buildPromise = new Deferred();
    var promises = [];
	result.forEach(function(wrapper) {
		promises.push(copySingleFile(wrapper));
	}.bind(this));
	Deferred.all(promises, function(error) { console.log(error); }).then(buildPromise.resolve, buildPromise.reject);
	return buildPromise;
}
/*
 * The fun starts here
 */
processFile().then(exitSuccess,	exitFail);
