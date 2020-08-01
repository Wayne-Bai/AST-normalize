/*
 Copyright (c) Shelloid Systems LLP. All rights reserved.
 The use and distribution terms for this software are covered by the
 GNU Lesser General Public License 3.0 (https://www.gnu.org/licenses/lgpl.html)
 which can be found in the file LICENSE at the root of this distribution.
 By using this software in any fashion, you are agreeing to be bound by
 the terms of this license.
 You must not remove this notice, or any other, from this software.
 */

var utils = lib_require("utils");
var path = require("path");

function EasyDb(config, parentDomain) {
    this.queries = [];
    this.successH = [];
    this.errorH = null;
    this.finallyH = null;
	this.config = config;
    this.proxy = this.config.support.modProxy.createProxy();
    this.transaction = false;
    this.doneH = null;
	this.firstQuery = true;
	this.parentDomain = parentDomain;
	installQueryHandlers(this);
}

function installQueryHandlers(easyDb){
	var syncOps = easyDb.config.support.syncOps || [];
	
	var ops = easyDb.config.support.ops.concat(syncOps);
	
	easyDb.syncOps = syncOps;
	
	for(var i=0;i<ops.length; i++){
		var currOp = ops[i];
		(function(op, isSyncOp){
			easyDb[op] = function(queryParam){
				if (easyDb.successH.length < easyDb.queries.length){
					easyDb.successH.push(null);			
				}
				var param = queryParam;
				if(!utils.isFunction(queryParam)){
					 if(!easyDb.firstQuery){
						easyDb.throwError(sh.caller("Expecting a query generator function."));
					}
					if(!isSyncOp){
						easyDb.firstQuery = false;
					}
					param = Array.prototype.slice.call(arguments);
				}
				easyDb.queries.push({param: param, name: op});
				easyDb.lastCallWasQuery = true;
				return easyDb;
			}
		})(currOp, syncOps.contains(currOp));
	}
}

EasyDb.prototype.success = function (s) {
    this.successH.push(s);
    return this;
};

EasyDb.prototype.error = function (e) {
    this.errorH = e;
    return this;
};

EasyDb.prototype.finally = function (a) {
    this.finallyH = a;
    return this;
};

EasyDb.prototype.done = function (d) {
    this.doneH = d;
    return this;
};


EasyDb.prototype.clear = function () {
    if (this.finallyH)
        this.finallyH();
	var client = this.proxy.getClient();
	if(client){
		this.config.pool.release(client);
	}
    this.transaction = false;
    this.proxy.setClient(null);
	this.firstQuery = true;
};

EasyDb.prototype.throwError = function(msg){
	var easydb = this;
	var er = new Error(msg);
	if(easydb.parentDomain){
		easydb.parentDomain.emit('error', er);
	}else{
		throw er;
	}
}

EasyDb.prototype.processError = function(msg){
	var easydb = this;
	if(msg.stack){
		console.log("DB error stack: ", msg.stack);
	}
	if(easydb.errorH){
		easydb.errorH(msg);
	}else{
		easydb.throwError(msg);
	}
}

EasyDb.prototype.cancel = function () {//cancel pending queries.
    this.queries = [];
    this.successH = [];
	this.clear();//ADDED
	return this;
};

function _execute_queries(easyDb) {
    if (easyDb.queries.length == 0) {
        if (easyDb.transaction) {
            easyDb.proxy.commit(
                function (err, rows) {
                    if (err) {
                        sh.error("COMMIT failed: " + err);
                        easyDb.processError(err);
                    } else {
                        if (easyDb.doneH)
                            easyDb.doneH();
                    }
                    easyDb.clear();
                }
            );
        } else {
            if (easyDb.doneH)
                easyDb.doneH();
            easyDb.clear();
        }
        return;
    }

    var queryInfo = easyDb.queries.shift();
	var queryParam = queryInfo.param;

	if(utils.isFunction(queryParam)){
		queryParam = queryParam();//generate the query
	}
	
	var fnName = queryInfo.name;
	
	if(easyDb.syncOps.contains(fnName)){
		var proxyFn = easyDb.proxy[fnName];
		if(proxyFn){
			var res = proxyFn.apply(easyDb.proxy, queryParam);
			var successH = easyDb.successH.shift();
			if(successH){
				successH(res);
			}
			_execute_queries(easyDb);
		}else{
			easyDb.processError("Synchronous DB operation: " + fnName + " not implemented.");
		}
		return;
	}
	
	
	var callback = 
        function (err) {	
            if (err) {
                sh.error("Query failed: " + JSON.stringify(queryParam) + " error: " + err);
                _rollback_txn(easyDb);
				easyDb.processError(err);				
            } else {			
                var successF = easyDb.successH.shift();
                if (successF) {
                    successF.apply(null, Array.prototype.slice.call(arguments, 1));
                }
                _execute_queries(easyDb);
            }
        };

	if(easyDb.proxy[fnName]){
		queryParam.push(callback);
		easyDb.proxy[fnName].apply(easyDb.proxy, queryParam);
	}else{
		easyDb.proxy.genericQuery(fnName, queryParam, callback);
	}    
}

function _rollback_txn(easyDb) {
    if (easyDb.transaction) {
        easyDb.transaction = false;
        easyDb.proxy.rollback(
            function (err, rows) {
                if (err) {
                    sh.error("cannot rollback transaction %s", err);
                }
                easyDb.clear();
            }
        );
    } else {
        easyDb.clear();
    }
}

EasyDb.prototype.execute = function(options){
	var easydb = this;
	var d = require('domain').create();
	d.add(easydb);
	d.on('error', function(er) {	
		_rollback_txn(easydb);
		easydb.processError(er);
	});
	d.run(function(){
		easydb.executeImpl();
	});	
}

EasyDb.prototype.executeImpl = function (options) {
    if (!options)
        options = {};
    var easyDb = this;
    this.config.pool.acquire(
        function (err, client) {
            if (err) {
                sh.log.error("Cannot acquire pool instance for pool %s. Error: %s", this.pool.name, err);
                if (easyDb.errorH)
                    easyDb.errorH(err);
                easyDb.clear();
            }
            else {
                easyDb.proxy.setClient(client);
                easyDb.transaction = options.transaction ? options.transaction : false;
                if (easyDb.transaction) {
                    proxy.startTransaction(
                        function (err, rows) {
                            if (err) {
                                sh.error("Start transaction failed: %s", err);
                                if (easyDb.errorH)
                                    easyDb.errorH(err);
                                easyDb.clear();
                            } else {
								process.nextTick(function(){
									_execute_queries(easyDb);
								});
                            }
                        }
                    );
                } else
					process.nextTick(function(){
						_execute_queries(easyDb);
					});
            }
        }
    );
};

module.exports = function (name, parentDomain, mod) {
	var config = shelloid.serverCtx.appCtx.config.databases[name];
	if(!config){
		throw new Error(sh.caller("Unknown DB name: " + name));
	}
    var db = new EasyDb(config, parentDomain);
	
	var annotations = [];
	if(mod){
		annotations.push(mod.annotations);
	}
	var maxDepth = 4;
	for(var i=1;i<maxDepth && i < __stack.length;i++){
		var p = path.normalize(__stack[i].getFileName()) + "/" + 
					__stack[i].getFunctionName();
		if(sh.annotations[p]){
			annotations.push(sh.annotations[p]);
		}
	}
	var globalHooks = sh.ext.hooks.db;
	if(globalHooks){
		for(var k=0;k< globalHooks.length;k++){
			globalHooks[k](db);
		}
	}
	for(var i=0;i<annotations.length;i++){
		var dbHooks = annotations[i].$hooks.db;
		if(dbHooks){
			for(var j=0;j<dbHooks.length;j++){
				dbHooks[j].handler(annotations[i], db);
			}
		}
	}
	return db;
};
