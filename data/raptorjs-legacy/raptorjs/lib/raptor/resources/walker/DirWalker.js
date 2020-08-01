/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define.Class(
    'raptor/resources/walker/DirWalker',
    function(require) {
        'use strict';
        
        var resources = require('raptor/resources');
        
        var DirWalker = function(callbackFunc, thisObj, options) {
            this.callbackThisObj = thisObj;
            this.callbackFunc = callbackFunc;
            
            if (options) {
                
                this.resourceFilter = options.resourceFilter;
                this.dirTraverseFilter = options.dirTraverseFilter;
            }
        };
        
        DirWalker.prototype = {
            walkDir: function(dir) {
                if (typeof dir === 'string') {
                    dir = resources.findResource(dir);
                }
                
                this._handleResource(dir);
            },

            _handleResource: function(resource) {
                var callbackThisObj = this.callbackThisObj,
                    resourceFilter = this.resourceFilter,
                    dirTraverseFilter = this.dirTraverseFilter;
                
                if (!resourceFilter || resourceFilter.call(callbackThisObj, resource)) {
                    this.callbackFunc.call(callbackThisObj, resource);
                }
                
                if (resource.isDirectory()) {
                    if (!dirTraverseFilter || dirTraverseFilter.call(callbackThisObj, resource) !== false) {
                        resource.forEachChild(this._handleResource, this);
                    }
                }
            }
        };
        
        return DirWalker;
    });