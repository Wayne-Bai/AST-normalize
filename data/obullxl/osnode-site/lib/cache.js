/**
 * 缓存模块-总控制器
 */

var config = require('../config.js');

exports.get = function(key) {
	return require('./cache-' + config.cache_type + '.js').get(key);
};

exports.set = function(key, obj) {
	require('./cache-' + config.cache_type + '.js').set(key, obj);
};

exports.exist = function(key) {
	return require('./cache-' + config.cache_type + '.js').exist(key);
};

exports.keySet = function() {
	return require('./cache-' + config.cache_type + '.js').keySet();
};

exports.remove = function(key) {
	require('./cache-' + config.cache_type + '.js').remove(key);
	;
};

exports.removeAll = function() {
	require('./cache-' + config.cache_type + '.js').removeAll();
};
