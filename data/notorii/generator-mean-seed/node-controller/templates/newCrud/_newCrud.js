/**
@module <%= optControllerName %>
@class <%= optControllerName %>

@toc
1. search
2. read
3. save
3.1. saveBulk
3.5. saveActual (private function)
4. delete1
*/

'use strict';

var Q = require('q');
var lodash = require('lodash');

var dependency =require('../../../dependency.js');
var pathParts =dependency.buildPaths(__dirname, {});

var CrudMod =require(pathParts.services+'crud/crud.js');
var LookupMod =require(pathParts.services+'lookup/lookup.js');

var self;

var defaults = {
};

/**
<%= optControllerNameCaps %> module constructor
@class <%= optControllerNameCaps %>
@constructor
@param options {Object} constructor options
**/
function <%= optControllerNameCaps %>(options){
    this.opts = lodash.merge({}, defaults, options||{});

	self = this;
}

/**
@toc 1.
@method search
@param {Object} data
	@param {String} [searchString] Text to search for
	@param {Array} [searchFields =['title']] Fields to search searchString within		//TODO - set default
		@example ['title', 'description']
	@param {Array} [skipIds] _id fields to skip (will be added to query AFTER they are converted to mongo ids (if necessary))
		@example ['324234', '328sakd23', '23lkjafl83']
	@param {Object} [fields ={_id:1, title:1}] Fields to return		//TODO - set default
		@example {_id:1, title:1, priority:1}
	@param {Number} [skip =0] Where to start returning from (like a cursor)
	@param {Number} [limit =20] How many to return
@param {Object} params
@return {Object} (via Promise)
		@param {Number} code
		@param {String} msg
		@param {Array} results
**/
<%= optControllerNameCaps %>.prototype.search = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'<%= optControllerNameCaps %>.search ', results:false};

	var defaults ={
		'limit':20,
		'fields':{'_id':1, 'title':1},		//TODO
		'searchFields':['title']		//TODO
	};
	if(data.fields ===undefined) {
		data.fields = defaults.fields;
	}
	if(data.limit ===undefined) {
		data.limit = defaults.limit;
	}
	if(data.searchFields ===undefined) {
		data.searchFields = defaults.searchFields;
	}

	var query ={};
	var ppSend =CrudMod.setSearchParams(data, query, {});
	
	LookupMod.search(db, '<%= optControllerNameUnderscore %>', ppSend, function(err, ret1) {
		deferred.resolve(ret1);
	});

	return deferred.promise;
};

/**
Reads one or more <%= optControllerName %>s
@toc 2.
@method read
@param {Object} data One of '_id' or '_ids' or 'fullQuery' is required
	@param {String} [_id] Id for object to lookup. Will be converted to mongo object id if necessary.
	@param {Array} [_ids] Ids to look up object info on Will be converted to mongo object ids if necessary.
	@param {Object} [fullQuery] Full mongo query to use directly for read
	@param {Array} [fields ={'_id':1, 'title':1}] Mongo query for which fields in the record to return. Use the empty object {} to get all fields.		//TODO - set default
		@example {'_id':1, 'title':1, 'priority':1}
	@param {Object} [query] Additional query for lookup (will be added to the id(s) query).
@param {Object} params
@return {Object} (via Promise)
	@param {Array} results
**/
<%= optControllerNameCaps %>.prototype.read = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'<%= optControllerNameCaps %>.read ', results:false};

	var ppSend = {
		'collection':'<%= optControllerNameUnderscore %>'
	};
	if(data._ids !==undefined) {		//for bulk read, return less info
		ppSend.defaults = {
			'fields':{'_id':1, 'title':1}		//TODO
		};
	}
	else if(data.fields !== undefined)
	{
		ppSend.defaults =
		{
			'fields': data.fields
		};
	}
	else
	{
		ppSend.defaults =
		{
			'fields':{}
		};
	}
	CrudMod.read(db, data, ppSend, function(err, ret1) {
		deferred.resolve(ret1);
	});

	return deferred.promise;
};

/**
Creates or updates a <%= optControllerName %>
@toc 3.
@method save
@param {Object} data
	@param {Object} <%= optControllerName %> The data to save. If '_id' field is present, it will update; otherwise it will create
@param {Object} params
	@param {Boolean} [bulk] True if called from bulk call
@return {Object} (via Promise)
	@param {Object} <%= optControllerName %>
**/
<%= optControllerNameCaps %>.prototype.save = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'<%= optControllerNameCaps %>.save ', <%= optControllerName %>:{}};
	
	saveActual(db, data, params)
	.then(function(ret1) {
		deferred.resolve(ret1);
	}, function(err) {
		deferred.reject(err);
	});

	return deferred.promise;
};

/**
Creates or updates multiple <%= optControllerName %>s
@toc 3.1.
@method saveBulk
@param {Object} data
	@param {Array} <%= optControllerName %> Array of <%= optControllerName %> objects to save. For each <%= optControllerName %> object, if '_id' field is present, it will update; otherwise it will create
@param {Object} params
@return {Object} (via Promise)
	@param {Array} <%= optControllerName %> Array of <%= optControllerName %> objects
**/
<%= optControllerNameCaps %>.prototype.saveBulk = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'<%= optControllerNameCaps %>.saveBulk ', <%= optControllerName %>:[] };
	
	var ii, dataTemp;
	var promises =[];
	// var deferreds =[];
	for(ii = 0; ii < data.<%= optControllerName %>.length; ii++) {
		//need closure inside for loop
		(function(ii) {
			// deferreds[ii] =Q.defer();		//do it anyway and just immediately resolve for ones that already have _id field
			
			dataTemp ={
				<%= optControllerName %>: data.<%= optControllerName %>[ii]
			};
			promises[ii] =self.save(db, dataTemp, {bulk:true});
			// promises[ii] =deferreds[ii].promise;
		})(ii);
	}
	
	Q.all(promises).then(function(ret1) {
		for(ii =0; ii<ret1.length; ii++) {
			if(ret1[ii].<%= optControllerName %> !==undefined) {
				ret.<%= optControllerName %>[ii] =ret1[ii].<%= optControllerName %>;
			}
			else {
				ret.<%= optControllerName %>[ii] =false;
			}
		}
		deferred.resolve(ret);
	}, function(err) {
		deferred.reject(ret);
	});

	return deferred.promise;
};

/**
@toc 3.5.
@method saveActual
@param {Object} data
	@param {Object} <%= optControllerName %> The data to save. If '_id' field is present, it will update; otherwise it will create
@param {Object} params
	@param {Boolean} [bulk] True if called from bulk call
@return {Object} (via Promise)
	@param {Object} <%= optControllerName %>
*/
function saveActual(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'<%= optControllerNameCaps %> saveActual ', <%= optControllerName %>:{} };
	
	CrudMod.save(db, data.<%= optControllerName %>, {'collection':'<%= optControllerNameUnderscore %>'}, function(err, ret1) {
		ret.msg +=ret1.msg;
		if(ret1.result) { 
			ret.<%= optControllerName %> =ret1.result;
		}
		else {
			ret.<%= optControllerName %> =data.<%= optControllerName %>;
		}
		
		deferred.resolve(ret);
	});
	
	return deferred.promise;
}


/**
Remove one or more <%= optControllerName %>s
@toc 4.
@method delete1
@param {Object} data
	@param {String} [<%= optControllerName %>_id] Id of <%= optControllerName %> to delete. one of '_id' or '_ids' is required
	@param {Array} [_ids] Ids of <%= optControllerName %>s to delete (will be converted to mongo object ids if necessary). one of '_id' or '_ids' is required
@param {Object} params
@return {Object} (via Promise)
	@param {Object}<%= optControllerName %>
**/
<%= optControllerNameCaps %>.prototype.delete1 = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'<%= optControllerNameCaps %>.delete1 '};

	data._id = data.<%= optControllerName %>_id;
	delete data.<%= optControllerName %>_id;
	
	var ppSend ={
		'collection':'<%= optControllerNameUnderscore %>'
	};
	CrudMod.delete1(db, data, ppSend, function(ret1) {
		deferred.resolve(ret1);
	});

	return deferred.promise;
};


/**
Module exports
@method exports
@return {<%= optControllerNameCaps %>} <%= optControllerNameCaps %> constructor
**/
module.exports = new <%= optControllerNameCaps %>({});