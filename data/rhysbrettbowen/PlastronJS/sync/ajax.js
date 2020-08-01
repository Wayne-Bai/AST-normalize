/*******************************************************************************
********************************************************************************
**                                                                            **
**  Copyright (c) 2012 Catch.com, Inc.                                        **
**                                                                            **
**  Licensed under the Apache License, Version 2.0 (the "License");           **
**  you may not use this file except in compliance with the License.          **
**  You may obtain a copy of the License at                                   **
**                                                                            **
**      http://www.apache.org/licenses/LICENSE-2.0                            **
**                                                                            **
**  Unless required by applicable law or agreed to in writing, software       **
**  distributed under the License is distributed on an "AS IS" BASIS,         **
**  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  **
**  See the License for the specific language governing permissions and       **
**  limitations under the License.                                            **
**                                                                            **
********************************************************************************
*******************************************************************************/

goog.provide('mvc.AjaxSync');

goog.require('goog.Uri.QueryData');
goog.require('goog.net.XhrManager');
goog.require('mvc.Sync');



/**
 * @constructor
 * @implements {mvc.Sync}
 * @param {Object|string|Function} url used to construct URLs.
 */
mvc.AjaxSync = function(url) {

  var baseFunction = function(model) {return '';};

  this.baseUrls_ = {
    create: baseFunction,
    read: baseFunction,
    update: baseFunction,
    del: baseFunction
  };

  if (goog.isString(url) || goog.isFunction(url)) {
    url = {
      create: url,
      read: url,
      update: url,
      del: url
    };
  }
  goog.object.extend(this.baseUrls_, goog.object.map(url, this.urlifyString));
  this.xhr_ = new goog.net.XhrManager();
  this.sendCount_ = 0;
};


/**
 * takes a string defining a url where :attribute will return that models
 * attribute. e.g.
 *
 * var obj = new mvc.Model({attrs:{'id': 'fred'}});
 * var urlGen = urlifyString("/object=:id/blah");
 * urlGen(obj); // returns "/object=fred/blah"
 *
 *
 * @param {Function|string} val to be changed to a function.
 * @return {function(mvc.Model):string} function that gives URL.
 */
mvc.AjaxSync.prototype.urlifyString = function(val) {
  return function(model) {
    var v = val;
    if (goog.isFunction(v))
      v = v(model);
    return v.replace(/:(\w+)/g,
        function(id) {
          return model.get(id.substring(1), '')
              .replace(/#/g, '%23').replace(/&/g, '%26');
        });
  };
};


/**
 * @inheritDoc
 */
mvc.AjaxSync.prototype.create = function(model, opt_callback) {

  this.xhr_.send('' + (this.sendCount_++), this.baseUrls_.create(model),
      'POST', goog.Uri.QueryData.createFromMap(model.toJson()).toString(),
      undefined, undefined,
      goog.bind(this.onCreateComplete_, this, model,
          (opt_callback || goog.nullFunction)));
};


/**
 * @inheritDoc
 */
mvc.AjaxSync.prototype.read = function(model, opt_callback) {
  this.xhr_.send('' + (this.sendCount_++), this.baseUrls_.read(model),
      'GET', undefined, undefined, undefined,
      goog.bind(this.onReadComplete_, this, model,
          (opt_callback || goog.nullFunction)));
};


/**
 * @inheritDoc
 */
mvc.AjaxSync.prototype.update = function(model, opt_callback) {
  this.xhr_.send('' + (this.sendCount_++), this.baseUrls_.update(model),
      'PUT', goog.Uri.QueryData.createFromMap(model.toJson()).toString(),
      {'Content-Type' : 'application/x-www-form-urlencoded'}, undefined,
      goog.bind(this.onUpdateComplete_, this, model,
          (opt_callback || goog.nullFunction)));
};


/**
 * @inheritDoc
 */
mvc.AjaxSync.prototype.del = function(model, opt_callback) {
  this.xhr_.send('' + (this.sendCount_++), this.baseUrls_.del(model),
      'DELETE', undefined, undefined, undefined,
      goog.bind(this.onDelComplete_, this, model,
          (opt_callback || goog.nullFunction)));
};


/**
 * override this to do processing on returned data
 *
 * @private
 * @param {mvc.Model} model being processed.
 * @param {Function} callback to be called when done.
 * @param {goog.events.Event} e the completed xhr event.
 */
mvc.AjaxSync.prototype.onCreateComplete_ = function(model, callback, e) {
  var xhr = e.target;
  model.set('id', xhr.getResponseJson()['result']['id']);
  callback.call(model, model, e);
};


/**
 * override this to do processing on returned data
 *
 * @private
 * @param {mvc.Model} model being processed.
 * @param {Function} callback to be called when done.
 * @param {goog.events.Event} e the completed xhr event.
 */
mvc.AjaxSync.prototype.onReadComplete_ = function(model, callback, e) {
  var xhr = e.target;
  var json = xhr.getResponseJson()['result'];
  model.set(json);
  callback.call(model, model, e);
};


/**
 * override this to do processing on returned data
 *
 * @private
 * @param {mvc.Model} model being processed.
 * @param {Function} callback to be called when done.
 * @param {goog.events.Event} e the completed xhr event.
 */
mvc.AjaxSync.prototype.onUpdateComplete_ = function(model, callback, e) {
  callback.call(model, model, e);
};


/**
 * override this to do processing on returned data
 *
 * @private
 * @param {mvc.Model} model being processed.
 * @param {Function} callback to be called when done.
 * @param {goog.events.Event} e the completed xhr event.
 */
mvc.AjaxSync.prototype.onDelComplete_ = function(model, callback, e) {
  callback.call(model, model, e);
};
