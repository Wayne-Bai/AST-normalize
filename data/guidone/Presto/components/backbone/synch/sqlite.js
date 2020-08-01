
var _ = require('/presto/components/underscore/underscore')._;
/*jshint laxbreak: true,eqnull: true,browser: true,jquery: true,devel: true,regexdash: true,multistr: true, white: false */
/*global define: true, require: true, module: true, Ti: true, L: true, Titanium: true, Class: true */


/**
* @class components.Backbone.sync.sqllite
* @param {Object} options
* @param {String} options.db_name Name of data base
* @param {String} options.table_name Sqlite table name
* @param {Object} options.columns Dictionary with columns
* @param {String} [options.primaryKey=autoincrement] Type of primary key, could be: autoincrement or guid. With guid on insert
* it will create a guid with Titanium or (if present) use the guid field
* @param {Object} [options.debug=false] Debug info
* @param {Array} options.views List of views available
*/
var syncGen = function(options) {

	// create the view object is needed
	if (options.views == null) {
		options.views = {
			'default': {
				db_name: options.db_name,
				table_name: options.table_name,
				columns: options.columns
			}
		};
	}
	if (options.primaryKey != 'autoincrement' && options.primaryKey != 'guid') {
		options.primaryKey = 'autoincrement';
	}

	return function(method,model,opts) {

	    var db;
		var sqlite_view = this.sqlite_view != null ? this.sqlite_view : 'default';
	    var current_view = options.views[sqlite_view];
	    var table = null;
	    var columns = null;
	    var dbName = null;

	    if (current_view != null) {
	    	table = current_view.table_name;
	    	columns = current_view.columns;
			dbName = current_view.db_name;
	    } else {
			dbName = options.db_name;
			table = options.table_name;
			columns = options.columns;
	    }

	    var primaryKey = options.primaryKey;
	    var debug = options.debug;
	    var columns_list = 'id,'+_.keys(columns).join(',');
	    var default_options = {
			table: options.db_name,
			limit: 10,
			offset: 0
	    };
	    opts = _.extend(default_options,opts);

		if (debug) {
	    	Ti.API.info('SyncSqlite: dbName:'+dbName+' table:'+table+' columns:'+JSON.stringify(columns));
	    }

	    var resp = null;
	    switch (method) {

	      case "update":

	        resp = function() {
	            var attrObj = {};
	            if (!model.id) {
	                model.id = model.idAttribute === ALLOY_ID_DEFAULT ? util.guid() : null;
	                attrObj[model.idAttribute] = model.id;
	                model.set(attrObj, {
	                    silent: true
	                });
	            }
	            var names = [], values = [], q = [];
	            for (var k in columns) {
	                names.push(k+' = ?');
	                values.push(model.get(k));
	                q.push("?");
	            }
	            values.push(model.id);
	            var sql = 'UPDATE "'+table+'" SET ' + names.join(",") + ' WHERE '+model.idAttribute+' = ?;';

	            db = Ti.Database.open(dbName);
	            db.execute("BEGIN;");

	            if (debug) {
		            Ti.API.info('SyncSqlite: UPDATE -> '+JSON.stringify(sql));
		            Ti.API.info('SyncSqlite: UPDATE -> '+JSON.stringify(values));
	            }

	            db.execute(sql, values);

	            if (null === model.id) {
	                var sqlId = "SELECT last_insert_rowid();";
	                var rs = db.execute(sqlId);
	                if (rs && rs.isValidRow()) {
	                    model.id = rs.field(0);
	                    attrObj[model.idAttribute] = model.id;
	                    model.set(attrObj, {
	                        silent: true
	                    });
	                } else Ti.API.warn("Unable to get ID from database for model: " + model.toJSON());
	                rs && rs.close();
	            }
	            db.execute("COMMIT;");
	            db.close();
	            return model.toJSON();
	        }();
	        break;

		case "create":

			resp = function() {

			    var attrObj = {};
			    if (!model.id) {
			        model.id = model.idAttribute === ALLOY_ID_DEFAULT ? util.guid() : null;
			        attrObj[model.idAttribute] = model.id;
			        model.set(attrObj, {
			            silent: true
			        });
			    }
			    var names = [];
			    var values = [];
			    var q = [];
			    // if autoincrement, then prepopulate
			    if (primaryKey == 'guid') {
					names.push('id');
					values.push(model.guid != null ? model.guid : Ti.Platform.createUUID());
					q.push('?');
				}
				// populate values
				for (var k in columns) {
					names.push(k);
					values.push(model.get(k));
					q.push("?");
				}
				var sql = 'INSERT INTO "' + table + '" (' + names.join(',') + ') VALUES (' + q.join(',') + ');';
				db = Ti.Database.open(dbName);
				db.execute("BEGIN;");
				try {
					db.execute(sql, values);
					if (null === model.id) {
						if (primaryKey == 'guid') {
							// with guid
							var guid = values[0];
							var sqlId = 'SELECT * FROM "'+table+'" WHERE id = ?';
							var rs = db.execute(sqlId,guid);
							if (rs && rs.isValidRow()) {
								model.id = guid;
								attrObj[model.idAttribute] = model.id;
								model.set(attrObj,{silent: true});
							} else {
								Ti.API.warn("Unable to get ID from database for model: " + model.toJSON());
							}
							rs && rs.close();

						} else {
							// with autoincrement
							var sqlId = "SELECT last_insert_rowid();";
							var rs = db.execute(sqlId);
							if (rs && rs.isValidRow()) {
								model.id = rs.field(0);
								attrObj[model.idAttribute] = model.id;
								model.set(attrObj,{silent: true});
							} else {
								Ti.API.warn("Unable to get ID from database for model: " + model.toJSON());
							}
							rs && rs.close();
						}
					}
					db.execute("COMMIT;");
				} catch(e) {
					Ti.API.error('ERRORINSQLSYNCH '+JSON.stringify(e));
					db.execute("ROLLBACK;");
					throw {
						message: 'Sqlite error: Duplicated id'
					}
				}
				db.close();
				return model.toJSON();
			}();
		break;

			case 'read':
			var sql = null;
			if (opts.query != null) {
				sql = opts.query;
			} else {
		        sql = 'SELECT '+columns_list+' FROM "'+table+'"';
		        // calculate query clause
		        var queryClause = '';
		        // filter by class name
		        if (model.contentClassName != null && model.contentClassName != '') {
			        queryClause += 'tag = \''+model.contentClassName+'\'';
		        }
		        // append passed query
		        if (opts.where != null && opts.where != '') {
			        if (queryClause !== '') {
				        queryClause += ' AND ';
			        }
			        queryClause += opts.where;
		        }
		        // append to sql
		        if (queryClause !== '') {
		        	sql += ' WHERE '+queryClause;
		        }
		        // order by
		        if (opts.order != null) {
			        sql += ' ORDER BY '+opts.order;
		        }
		        // limit
		        if (opts.limit != null) {
			        sql += ' LIMIT '+opts.offset+','+opts.limit;
		        }
	        }

	        db = Ti.Database.open(dbName);
	        var rs;

	        if (debug) {
		       	Ti.API.info('SyncSqlite: options -> '+JSON.stringify(opts));
		       	Ti.API.info('SyncSqlite: sql -> '+sql);
			   	Ti.API.info('SyncSqlite: params -> '+JSON.stringify(opts.params));
	        }
	        rs = opts.params != null ? db.execute(sql,opts.params) : db.execute(sql);
	        var len = 0;
	        var values = [];
	        while (rs.isValidRow()) {
	            var o = {};
	            var fc = 0;
	            fc = _.isFunction(rs.fieldCount) ? rs.fieldCount() : rs.fieldCount;
	            _.times(fc, function(c) {
	                var fn = rs.fieldName(c);
	                o[fn] = rs.fieldByName(fn);

	                if (columns[fn] == 'date' && o[fn] != null) {
		                o[fn] = moment(o[fn]).toDate();
	                }
	            });
	            values.push(o);
	            len++;
	            rs.next();
	        }
	        rs.close();
	        db.close();

	         if (debug) {
	         	Ti.API.info('SyncSqlite: resp -> '+len);
	         }

	        // non deve stare qua, senno' raddoppia
	        //model.length = len;
	        resp = 1 === len ? values[0] : values;

	        break;

	      case "delete":
	        var sql = 'DELETE FROM "'+table+'" WHERE ' + model.idAttribute + '=?';
	        db = Ti.Database.open(dbName);
	        db.execute(sql, model.id);
	        db.close();
	        model.id = null;
	        resp = model.toJSON();
	    }
	    if (resp) {
	        _.isFunction(opts.success) && opts.success(resp);
	        "read" === method && model.trigger("fetch");
	    } else _.isFunction(opts.error) && opts.error(resp);
	}
}

var ALLOY_DB_DEFAULT = "_alloy_";
var ALLOY_ID_DEFAULT = "alloy_id";

module.exports.sync = syncGen;