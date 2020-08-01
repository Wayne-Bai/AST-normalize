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

/**
 * Utility class to support sub-attributes in an XML attribute. Each sub-attribute must
 * be separated by a semicolon. Within each sub-attribute, the name/value pair must
 * be split using an equal sign. However, the name for the first sub-attribute
 * is optional and a default name can be provided when reading the sub-attributes.
 *
 * <p>
 * Sub-attribute format:
 * (<attr-value>)?(<attr-name>=<attr-value>;)*(<attr-name>=<attr-value>)
 *
 *
 *
 */
define.Class(
    'raptor/templating/compiler/AttributeSplitter',
    ['raptor'],
    function(raptor, require) {
        'use strict';
        
        var strings = require('raptor/strings'),
            TypeConverter = require('raptor/templating/compiler/TypeConverter'),
            regExp = /"(?:[^"]|\\")*"|'(?:[^']|\\')*'|==|===|[;=]/g;
        
        /**
         *
         */
        var AttributeSplitter = function() {
            
        };
        
        /**
         * Parses the provided string to find the sub-attributes that it contains.
         * The parsed output can be either returned as an array or a map. By default,
         * the parsed output is returned as a map where each property corresponds
         * to a sub-attribute. However, if the order of the sub-attributes is important
         * then the "ordered" option can be set to "true" and
         * an array will instead be returned where each element in the array is an object
         * with a name and value property that corresponds to the matching sub-attribute.
         *
         * <p>
         * Supported options:
         * <ul>
         *  <li>ordered (boolean, defaults to "false") - If true then an array is returned (see above). Otherwise, an object is returned.
         * </ul>
         *
         * @memberOf raptor/templating/compiler$AttributeSplitter
         * @param attr {String} The attribute to split
         * @param types {Object} Type definitions for the possible sub-attributes.
         * @param options
         * @returns
         */
        AttributeSplitter.parse = function(attr, types, options) {
            
            if (!options) {
                options = {};
            }
            var partStart = 0,
                ordered = options.ordered === true,
                defaultName = options.defaultName,
                removeDashes = options.removeDashes === true,
                matches,
                equalIndex = -1,
                result = ordered ? [] : {},
                handleError = function(message) {
                    if (options.errorHandler) {
                        options.errorHandler(message);
                        return;
                    }
                    else {
                        throw raptor.createError(new Error(message));
                    }
                },
                finishPart = function(endIndex) {
                    if (partStart === endIndex) {
                        //The part is an empty string... ignore it
                        return;
                    }
                    
                    var name,
                        value;
                    
                    if (equalIndex != -1) {
                         name = strings.trim(attr.substring(partStart, equalIndex));
                         value = attr.substring(equalIndex+1, endIndex);
                    }
                    else {
                        if (defaultName) {
                            name = defaultName;
                            value = attr.substring(partStart, endIndex);
                            if (!strings.trim(value).length) {
                                return; //ignore empty parts
                            }
                        }
                        else {
                            name = attr.substring(partStart, endIndex);
                        }
                    }
                    
                    if (name) {
                        name = strings.trim(name);
                    }

                    if (!strings.trim(name).length && !strings.trim(value).length) {
                        equalIndex = -1;
                        return; //ignore empty parts
                    }
                    
                    if (types) {
                        var type = types[name] || types['*'];
                        if (type) {
                            if (value != null) {
                                value = TypeConverter.convert(value, type.type, type.allowExpressions !== false);
                            }
                            if (type.name) {
                                name = type.name;
                            }
                        }
                        else {
                            handleError('Invalid sub-attribute name of "' + name + '"');
                        }
                    }

                    if (name && removeDashes) {
                        name = name.replace(/-([a-z])/g, function(match, lower) {
                            return lower.toUpperCase();
                        });
                    }

                    if (ordered) {
                        result.push({name: name, value: value});
                    }
                    else {
                        result[name] = value;
                    }

                    equalIndex = -1; //Reset the equal index
                };
            
            /*
             * Keep searching the string for the relevant tokens.
             *
             * NOTE: The regular expression will also return matches for JavaScript strings,
             *       but they are just ignored. This ensures that semicolons inside strings
             *       are not treated as
             */
            while((matches = regExp.exec(attr))) {
                //console.error(matches[0]);
                
                if (matches[0] == ';') {
                    finishPart(matches.index);
                    partStart = matches.index+1;
                    equalIndex = -1;
                }
                else if (matches[0] == '=') {
                    if (equalIndex == -1) {
                        equalIndex = matches.index;
                    }
                }
                
            }
            
            finishPart(attr.length);
            
            //console.error("AttributeSplitter - result: ", result);
            
            return result;
        };

        return AttributeSplitter;
    });