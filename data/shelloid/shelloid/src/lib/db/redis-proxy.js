/*
 Copyright (c) Shelloid Systems LLP. All rights reserved.
 The use and distribution terms for this software are covered by the
 GNU Lesser General Public License 3.0 (https://www.gnu.org/licenses/lgpl.html)
 which can be found in the file LICENSE at the root of this distribution.
 By using this software in any fashion, you are agreeing to be bound by
 the terms of this license.
 You must not remove this notice, or any other, from this software.
 */

var support;
var proxyBase = lib_require("db/proxy-base");

var support = {
	type : "redis",
	modName: "redis",
	modVersion: "0.12.1",
	mod: null,//loaded dynamically
	ops: 
	[
	"append",
    "auth",
    "bgrewriteaof",
    "bgsave",
    "bitcount",
    "bitop",
    "bitpos",
    "blpop",
    "brpop",
    "brpoplpush",
    "client kill",
    "client list",
    "client getname",
    "client pause",
    "client setname",
    "config get",
    "config rewrite",
    "config set",
    "config resetstat",
    "dbsize",
    "debug object",
    "debug segfault",
    "decr",
    "decrby",
    "del",
    "discard",
    "dump",
    "echo",
    "eval",
    "evalsha",
    "exec",
    "exists",
    "expire",
    "expireat",
    "flushall",
    "flushdb",
    "get",
    "getbit",
    "getrange",
    "getset",
    "hdel",
    "hexists",
    "hget",
    "hgetall",
    "hincrby",
    "hincrbyfloat",
    "hkeys",
    "hlen",
    "hmget",
    "hmset",
    "hset",
    "hsetnx",
    "hvals",
    "incr",
    "incrby",
    "incrbyfloat",
    "info",
    "keys",
    "lastsave",
    "lindex",
    "linsert",
    "llen",
    "lpop",
    "lpush",
    "lpushx",
    "lrange",
    "lrem",
    "lset",
    "ltrim",
    "mget",
    "migrate",
    "monitor",
    "move",
    "mset",
    "msetnx",
    "multi",
    "object",
    "persist",
    "pexpire",
    "pexpireat",
    "pfadd",
    "pfcount",
    "pfmerge",
    "ping",
    "psetex",
    "psubscribe",
    "pubsub",
    "pttl",
    "publish",
    "punsubscribe",
    "quit",
    "randomkey",
    "rename",
    "renamenx",
    "restore",
    "rpop",
    "rpoplpush",
    "rpush",
    "rpushx",
    "sadd",
    "save",
    "scard",
    "script exists",
    "script flush",
    "script kill",
    "script load",
    "sdiff",
    "sdiffstore",
    "select",
    "set",
    "setbit",
    "setex",
    "setnx",
    "setrange",
    "shutdown",
    "sinter",
    "sinterstore",
    "sismember",
    "slaveof",
    "slowlog",
    "smembers",
    "smove",
    "sort",
    "spop",
    "srandmember",
    "srem",
    "strlen",
    "subscribe",
    "sunion",
    "sunionstore",
    "sync",
    "time",
    "ttl",
    "type",
    "unsubscribe",
    "unwatch",
    "watch",
    "zadd",
    "zcard",
    "zcount",
    "zincrby",
    "zinterstore",
    "zlexcount",
    "zrange",
    "zrangebylex",
    "zrangebyscore",
    "zrank",
    "zrem",
    "zremrangebylex",
    "zremrangebyrank",
    "zremrangebyscore",
    "zrevrange",
    "zrevrangebyscore",
    "zrevrank",
    "zscore",
    "zunionstore",
    "scan",
    "sscan",
    "hscan",
    "zscan"]	
}

exports.support = support;
		
exports.createProxy = function(client){
	return new RedisProxy(client);
}

exports.createPool = function(config){
	var redis = support.mod;
	var createFn = 	function (callback) {
		config.port = config.port ? config.port : 6379;
		config.host = config.host ? config.host : "localhost";
		var client = redis.createClient(config.port, config.host);
		client.auth(config.password, function(err){
			callback(err, client);
		});
		client.on("error", function (err) {
			sh.error(sh.loc("Redis error for instance: " +config.name + ": "  + err));
		});
	};

	var destroyFn = function (client) {
		client.quit();
	};
	
	return proxyBase.createPool(config, createFn, destroyFn);
}

function RedisProxy(client){
	this.client = client;
}

RedisProxy.prototype = Object.create(proxyBase.ProxyBase.prototype);
