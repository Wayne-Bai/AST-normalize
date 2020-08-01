// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview Inject request executors.
 *
 * @author kyawtun@yathit.com (Kyaw Tun)
 */

goog.provide('ydn.db.crud.Storage.inject_executor');
goog.require('ydn.db.crud.Storage');
goog.require('ydn.db.crud.req.IndexedDb');
goog.require('ydn.db.crud.req.SimpleStore');
goog.require('ydn.db.crud.req.WebSql');


/**
 * @return {!ydn.db.crud.req.IRequestExecutor}
 */
ydn.db.crud.Storage.prototype.newExecutor = function() {
  var type = this.getType();
  if (type == ydn.db.base.Mechanisms.IDB) {
    return new ydn.db.crud.req.IndexedDb(this.db_name, this.schema);
  } else if (type == ydn.db.base.Mechanisms.WEBSQL || type == ydn.db.base.Mechanisms.SQLITE) {
    return new ydn.db.crud.req.WebSql(this.db_name, this.schema);
  } else if (type == ydn.db.base.Mechanisms.MEMORY_STORAGE ||
      type == ydn.db.base.Mechanisms.LOCAL_STORAGE ||
      type == ydn.db.base.Mechanisms.USER_DATA ||
      type == ydn.db.base.Mechanisms.SESSION_STORAGE) {
    return new ydn.db.crud.req.SimpleStore(this.db_name, this.schema);
  } else {
    throw new ydn.debug.error.InternalError('No executor for ' + type);
  }
};
