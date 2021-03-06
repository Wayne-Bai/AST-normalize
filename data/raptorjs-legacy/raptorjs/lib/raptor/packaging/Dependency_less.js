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
    'raptor/packaging/Dependency_less',
    'raptor/packaging/Dependency',
    ['raptor'],
    function(raptor, require, exports, module) {
        'use strict';
        
        var raptorResources = require('raptor/resources');
        var promises = require('raptor/promises');
        
        var Dependency_less = function() {
            Dependency_less.superclass.constructor.apply(this, arguments);
            this.addProperty('path', {
                type: 'string'
            });
        };
        
        Dependency_less.prototype = {
            getKey: function(context) {
                return 'less:' + this.resolvePathKey(this.path, context);
            },
            
            toString: function(dependency) {
                return this.getResource().getPath();
            },
            
            getContentType: function() {
                return 'text/css';
            },
            
                        
            getResourcePath: function() {
                return this.path;
            },

            _addLessImports: function(imports, context) {
                if (this.imports) {
                    this.imports.forEach(function(importPath) {

                        var importResource = this.resolveResource(importPath, context);
                        if (importResource.exists()) {
                            imports.add(importResource);
                        }
                        else {
                            throw new Error('Import not found with path "' + importPath + '" (' + importResource.getURL() + ')');
                        }
                    }, this);
                }
            },

            _addLessResources: function(resources, context) {
                this._addLessImports(resources, context);
                
            },

            _getLessResources: function(context) {
                var resources = [];

                var resourceList = {
                    add: function(resource, source) {
                        resources.push({
                            resource: resource,
                            source: source
                        });
                    }
                };

                var resource = this.getResource(context);
                this._addLessResources(resourceList, context);
                resourceList.add(resource);

                return resources;
            },

            hasModifiedChecksum: function(context) {
                return true;
            },

            getModifiedChecksum: function(context) {
                var crypto = require('crypto');
                var resources = this._getLessResources(context);

                var shasum = crypto.createHash('sha1');
                resources.forEach(function(resourceInfo) {
                    var resource = resourceInfo.resource;
                    shasum.update(resource.getURL() + resource.lastModified());
                });
                var checksum = shasum.digest('hex');
                return checksum.substring(0, 8);
            },

            getCode: function(context) {
                var deferred = promises.defer();

                function onError(e) {
                    deferred.reject(e);
                }

                var Parser = require('less').Parser;

                try
                {
                    var resource = this.getResource(context);
                    var resources = this._getLessResources(context);

                    var lessSource = resources.map(function(resourceInfo) {
                        var source = resourceInfo.source || resourceInfo.resource.readAsString();
                        return source;
                    }).join('\n');

                    var result;
                    
                    if (!resource.isFileResource()) {
                        throw new Error('Only file resources are supported for LESS. Resource: ' + resource);
                    }

                    var file = resource.getFile();

                    var paths = [file.getParent()];

                    raptorResources.getSearchPath().forEachEntry(function(searchPathEntry) {
                        if (searchPathEntry.getDir) {
                            paths.push(searchPathEntry.getDir());
                        }
                    });

                    var parser = new Parser({
                        paths: paths,  // search paths for @import directives
                        filename: file.getAbsolutePath()
                    });

                    parser.parse(lessSource, function (e, root) {
                        if (e) {
                            onError(raptor.createError(new Error('Unable to parse Less file at path "' + resource.getURL() + '". Exception: ' + (e.stack || e)), e));
                        } else {
                            try {
                                result = root.toCSS();
                                deferred.resolve(result);
                            }
                            catch(e) {
                                onError(raptor.createError(new Error('Unable to generate CSS code for Less file at path "' + resource.getURL() + '". Exception: ' + e.message), e));
                            }
                        }
                    });
                }
                catch(e) {
                    onError(raptor.createError(new Error('Unable to parse Less file at path "' + resource.getURL() + '". Exception: ' + e.message), e));
                }
                
                return deferred.promise;
            },
            
            isCompiled: function() {
                return true;
            }
        };
        
        return Dependency_less;
    });
