/*
 Copyright (c) Shelloid Systems LLP. All rights reserved.
 The use and distribution terms for this software are covered by the
 GNU Lesser General Public License 3.0 (https://www.gnu.org/licenses/lgpl.html)
 which can be found in the file LICENSE at the root of this distribution.
 By using this software in any fashion, you are agreeing to be bound by
 the terms of this license.
 You must not remove this notice, or any other, from this software.
 */

var proxyBase = lib_require("db/proxy-base");
var utils = lib_require("utils");

var support = {
	type: "mongodb",
	modName: "mongodb",
	modVersion: "2.0",
	mod: null,//loaded dynamically
	syncOps: ["collection"],
	ops: ["insert", "remove", "rename", "save", "update", "distinct", 
	"count", "drop", "findAndModify", "findAndRemove", "find", "findOne", 
	"createIndex", "ensureIndex", "indexInformation", "dropIndex", 
	"dropAllIndexes", "reIndex", "mapReduce", "group", "options",
	"isCapped", "indexExists", "geoNear", "geoHaystackSearch", 
	"indexes", "stats", "initializeUnorderedBulkOp", "initializeOrderedBulkOp",
	"parallelCollectionScan"],
};

exports.support = support;

exports.createProxy = function(db){
	return new MongoProxy(db);
}

exports.createPool = function(config){
	var mongoClient = support.mod.MongoClient;
	if(!config.url){
		throw new Error("Mongodb config must contain URL parameter.");
	}
	//url format: mongodb://user:pass@host:port/dbname
	var createFn = 	function (callback) {
		mongoClient.connect(config.url, function(err, db){
			if(err){
				sh.error("Couldn't connect to mongodb instance");
			}
			callback(err, db);			
		});
	};

	var destroyFn = function (db) {
		if(db){
			db.close();
		}
	};
	
	return proxyBase.createPool(config, createFn, destroyFn);
}

function MongoProxy(db){
	//Note: this.client refers to DB object.
	proxyBase.ProxyBase.call(this, db);
}

MongoProxy.prototype = Object.create(proxyBase.ProxyBase.prototype);

MongoProxy.prototype.collection = function(name){
	this.collection = this.client.collection(name);
}

MongoProxy.prototype.find = function(criteria, callback){
	if(!this.collection){
		throw new Error("Collection not selected for mongodb");
	}else{
		if(utils.isFunction(criteria)){
			callback = criteria;
			criteria = undefined;			
		}
		this.collection.find(criteria).toArray(callback);
	}
}

MongoProxy.prototype.genericQuery = function(name, params, callback){
	params.push(callback);
	if(!this.collection){
		throw new Error("Collection not selected for mongodb");
	}else{
		this.collection[name].apply(this.collection, params);
	}
}
