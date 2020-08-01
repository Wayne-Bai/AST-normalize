(function (undefined) {
    angular.module('rails').provider('railsSerializer', function() {
        var defaultOptions = {
            underscore: undefined,
            camelize: undefined,
            pluralize: undefined,
            exclusionMatchers: []
        };

        /**
         * Configures the underscore method used by the serializer.  If not defined then <code>RailsInflector.underscore</code>
         * will be used.
         *
         * @param {function(string):string} fn The function to use for underscore conversion
         * @returns {railsSerializerProvider} The provider for chaining
         */
        this.underscore = function(fn) {
            defaultOptions.underscore = fn;
            return this;
        };

        /**
         * Configures the camelize method used by the serializer.  If not defined then <code>RailsInflector.camelize</code>
         * will be used.
         *
         * @param {function(string):string} fn The function to use for camelize conversion
         * @returns {railsSerializerProvider} The provider for chaining
         */
        this.camelize = function(fn) {
            defaultOptions.camelize = fn;
            return this;
        };

        /**
         * Configures the pluralize method used by the serializer.  If not defined then <code>RailsInflector.pluralize</code>
         * will be used.
         *
         * @param {function(string):string} fn The function to use for pluralizing strings.
         * @returns {railsSerializerProvider} The provider for chaining
         */
        this.pluralize = function(fn) {
            defaultOptions.pluralize = fn;
            return this;
        };

        /**
         * Configures the array exclusion matchers by the serializer.  Exclusion matchers can be one of the following:
         * * string - Defines a prefix that is used to test for exclusion
         * * RegExp - A custom regular expression that is tested against the attribute name
         * * function - A custom function that accepts a string argument and returns a boolean with true indicating exclusion.
         *
         * @param {Array.<string|function(string):boolean|RegExp} exclusions An array of exclusion matchers
         * @returns {railsSerializerProvider} The provider for chaining
         */
        this.exclusionMatchers = function(exclusions) {
            defaultOptions.exclusionMatchers = exclusions;
            return this;
        };

        this.$get = ['$injector', 'RailsInflector', 'RailsResourceInjector', function ($injector, RailsInflector, RailsResourceInjector) {
            defaultOptions.underscore = defaultOptions.underscore || RailsInflector.underscore;
            defaultOptions.camelize = defaultOptions.camelize || RailsInflector.camelize;
            defaultOptions.pluralize = defaultOptions.pluralize || RailsInflector.pluralize;

            function railsSerializer(options, customizer) {

                function Serializer() {
                    if (angular.isFunction(options)) {
                        customizer = options;
                        options = {};
                    }

                    this.exclusions = {};
                    this.inclusions = {};
                    this.serializeMappings = {};
                    this.deserializeMappings = {};
                    this.customSerializedAttributes = {};
                    this.preservedAttributes = {};
                    this.customSerializers = {};
                    this.nestedResources = {};
                    this.options = angular.extend({excludeByDefault: false}, defaultOptions, options || {});

                    if (customizer) {
                        customizer.call(this, this);
                    }
                }

                /**
                 * Accepts a variable list of attribute names to exclude from JSON serialization.
                 *
                 * @param attributeNames... {string} Variable number of attribute name parameters
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.exclude = function () {
                    var exclusions = this.exclusions;

                    angular.forEach(arguments, function (attributeName) {
                        exclusions[attributeName] = false;
                    });

                    return this;
                };

                /**
                 * Accepts a variable list of attribute names that should be included in JSON serialization.
                 * Using this method will by default exclude all other attributes and only the ones explicitly included using <code>only</code> will be serialized.
                 * @param attributeNames... {string} Variable number of attribute name parameters
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.only = function () {
                    var inclusions = this.inclusions;
                    this.options.excludeByDefault = true;

                    angular.forEach(arguments, function (attributeName) {
                        inclusions[attributeName] = true;
                    });

                    return this;
                };

                /**
                 * This is a shortcut for rename that allows you to specify a variable number of attributes that should all be renamed to
                 * <code>{attributeName}_attributes</code> to work with the Rails nested_attributes feature.
                 * @param attributeNames... {string} Variable number of attribute name parameters
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.nestedAttribute = function () {
                    var self = this;

                    angular.forEach(arguments, function (attributeName) {
                        self.rename(attributeName, attributeName + '_attributes');
                    });

                    return this;
                };

                /**
                 * Specifies an attribute that is a nested resource within the parent object.
                 * Nested resources do not imply nested attributes, if you want both you still have to specify call <code>nestedAttribute</code> as well.
                 *
                 * A nested resource serves two purposes.  First, it defines the resource that should be used when constructing resources from the server.
                 * Second, it specifies how the nested object should be serialized.
                 *
                 * An optional third parameter <code>serializer</code> is available to override the serialization logic
                 * of the resource in case you need to serialize it differently in multiple contexts.
                 *
                 * @param attributeName {string} The name of the attribute that is a nested resource
                 * @param resource {string | Resource} A reference to the resource that the attribute is a type of.
                 * @param serializer {string | Serializer} (optional) An optional serializer reference to override the nested resource's default serializer
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.resource = function (attributeName, resource, serializer) {
                    this.nestedResources[attributeName] = resource;

                    if (serializer) {
                        this.serializeWith(attributeName, serializer);
                    }

                    return this;
                };

                /**
                 * Specifies a custom name mapping for an attribute.
                 * On serializing to JSON the jsonName will be used.
                 * On deserialization, if jsonName is seen then it will be renamed as javascriptName in the resulting resource.
                 *
                 * @param javascriptName {string} The attribute name as it appears in the JavaScript object
                 * @param jsonName {string} The attribute name as it should appear in JSON
                 * @param bidirectional {boolean} (optional) Allows turning off the bidirectional renaming, defaults to true.
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.rename = function (javascriptName, jsonName, bidirectional) {
                    this.serializeMappings[javascriptName] = jsonName;

                    if (bidirectional || bidirectional === undefined) {
                        this.deserializeMappings[jsonName] = javascriptName;
                    }
                    return this;
                };

                /**
                 * Allows custom attribute creation as part of the serialization to JSON.
                 *
                 * @param attributeName {string} The name of the attribute to add
                 * @param value {*} The value to add, if specified as a function then the function will be called during serialization
                 *     and should return the value to add.
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.add = function (attributeName, value) {
                    this.customSerializedAttributes[attributeName] = value;
                    return this;
                };


                /**
                 * Allows the attribute to be preserved unmodified in the resulting object.
                 *
                 * @param attributeName {string} The name of the attribute to add
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.preserve = function(attributeName) {
                    this.preservedAttributes[attributeName] =  true;
                    return this;
                };

                /**
                 * Specify a custom serializer to use for an attribute.
                 *
                 * @param attributeName {string} The name of the attribute
                 * @param serializer {string | function} A reference to the custom serializer to use for the attribute.
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.serializeWith = function (attributeName, serializer) {
                    this.customSerializers[attributeName] = serializer;
                    return this;
                };

                /**
                 * Determines whether or not an attribute should be excluded.
                 *
                 * If the option excludeByDefault has been set then attributes will default to excluded and will only
                 * be included if they have been included using the "only" customization function.
                 *
                 * If the option excludeByDefault has not been set then attributes must be explicitly excluded using the "exclude"
                 * customization function or must be matched by one of the exclusionMatchers.
                 *
                 * @param attributeName The name of the attribute to check for exclusion
                 * @returns {boolean} true if excluded, false otherwise
                 */
                Serializer.prototype.isExcludedFromSerialization = function (attributeName) {
                    if ((this.options.excludeByDefault && !this.inclusions.hasOwnProperty(attributeName)) || this.exclusions.hasOwnProperty(attributeName)) {
                        return true;
                    }

                    if (this.options.exclusionMatchers) {
                        var excluded = false;

                        angular.forEach(this.options.exclusionMatchers, function (matcher) {
                            if (angular.isString(matcher)) {
                                excluded = excluded || attributeName.indexOf(matcher) === 0;
                            } else if (angular.isFunction(matcher)) {
                                excluded = excluded || matcher.call(undefined, attributeName);
                            } else if (matcher instanceof RegExp) {
                                excluded = excluded || matcher.test(attributeName);
                            }
                        });

                        return excluded;
                    }

                    return false;
                };

                /**
                 * Remaps the attribute name to the serialized form which includes:
                 *   - checking for exclusion
                 *   - remapping to a custom value specified by the rename customization function
                 *   - underscoring the name
                 *
                 * @param attributeName The current attribute name
                 * @returns {*} undefined if the attribute should be excluded or the mapped attribute name
                 */
                Serializer.prototype.getSerializedAttributeName = function (attributeName) {
                    var mappedName = this.serializeMappings[attributeName] || attributeName;

                    var mappedNameExcluded = this.isExcludedFromSerialization(mappedName),
                        attributeNameExcluded = this.isExcludedFromSerialization(attributeName);

                    if(this.options.excludeByDefault) {
                        if(mappedNameExcluded && attributeNameExcluded) {
                            return undefined;
                        }
                    } else {
                        if (mappedNameExcluded || attributeNameExcluded) {
                            return undefined;
                        }
                    }

                    return this.underscore(mappedName);
                };

                /**
                 * Determines whether or not an attribute should be excluded from deserialization.
                 *
                 * By default, we do not exclude any attributes from deserialization.
                 *
                 * @param attributeName The name of the attribute to check for exclusion
                 * @returns {boolean} true if excluded, false otherwise
                 */
                Serializer.prototype.isExcludedFromDeserialization = function (attributeName) {
                    return false;
                };

                /**
                 * Remaps the attribute name to the deserialized form which includes:
                 *   - camelizing the name
                 *   - checking for exclusion
                 *   - remapping to a custom value specified by the rename customization function
                 *
                 * @param attributeName The current attribute name
                 * @returns {*} undefined if the attribute should be excluded or the mapped attribute name
                 */
                Serializer.prototype.getDeserializedAttributeName = function (attributeName) {
                    var camelizedName = this.camelize(attributeName);

                    camelizedName = this.deserializeMappings[attributeName] ||
                        this.deserializeMappings[camelizedName] ||
                        camelizedName;

                    if (this.isExcludedFromDeserialization(attributeName) || this.isExcludedFromDeserialization(camelizedName)) {
                        return undefined;
                    }

                    return camelizedName;
                };

                /**
                 * Returns a reference to the nested resource that has been specified for the attribute.
                 * @param attributeName The attribute name
                 * @returns {*} undefined if no nested resource has been specified or a reference to the nested resource class
                 */
                Serializer.prototype.getNestedResource = function (attributeName) {
                    return RailsResourceInjector.getDependency(this.nestedResources[attributeName]);
                };

                /**
                 * Returns a custom serializer for the attribute if one has been specified.  Custom serializers can be specified
                 * in one of two ways.  The serializeWith customization method allows specifying a custom serializer for any attribute.
                 * Or an attribute could have been specified as a nested resource in which case the nested resource's serializer
                 * is used.  Custom serializers specified using serializeWith take precedence over the nested resource serializer.
                 *
                 * @param attributeName The attribute name
                 * @returns {*} undefined if no custom serializer has been specified or an instance of the Serializer
                 */
                Serializer.prototype.getAttributeSerializer = function (attributeName) {
                    var resource = this.getNestedResource(attributeName),
                        serializer = this.customSerializers[attributeName];

                    // custom serializer takes precedence over resource serializer
                    if (serializer) {
                        return RailsResourceInjector.createService(serializer);
                    } else if (resource) {
                        return resource.config.serializer;
                    }

                    return undefined;
                };


                /**
                 * Prepares the data for serialization to JSON.
                 *
                 * @param data The data to prepare
                 * @returns {*} A new object or array that is ready for JSON serialization
                 */
                Serializer.prototype.serializeData = function (data) {
                    var result = data,
                        self = this;

                    if (angular.isArray(data)) {
                        result = [];

                        angular.forEach(data, function (value) {
                            result.push(self.serializeData(value));
                        });
                    } else if (angular.isObject(data)) {
                        if (angular.isDate(data)) {
                            return data;
                        }
                        result = {};

                        this.serializeObject(result, data);

                    }

                    return result;
                };

                Serializer.prototype.serializeObject = function(result, data){


                    var tthis = this;
                    angular.forEach(data, function (value, key) {
                        // if the value is a function then it can't be serialized to JSON so we'll just skip it
                        if (!angular.isFunction(value)) {
                            tthis.serializeAttribute(result, key, value);
                        }
                    });
                    return data;
                };

                /**
                 * Transforms an attribute and its value and stores it on the parent data object.  The attribute will be
                 * renamed as needed and the value itself will be serialized as well.
                 *
                 * @param data The object that the attribute will be added to
                 * @param attribute The attribute to transform
                 * @param value The current value of the attribute
                 */
                Serializer.prototype.serializeAttribute = function (data, attribute, value) {
                    var serializer = this.getAttributeSerializer(attribute),
                        serializedAttributeName = this.getSerializedAttributeName(attribute);

                    // undefined means the attribute should be excluded from serialization
                    if (serializedAttributeName === undefined) {
                        return;
                    }

                    data[serializedAttributeName] = serializer ? serializer.serialize(value) : this.serializeData(value);
                };

                /**
                 * Serializes the data by applying various transformations such as:
                 *   - Underscoring attribute names
                 *   - attribute renaming
                 *   - attribute exclusion
                 *   - custom attribute addition
                 *
                 * @param data The data to prepare
                 * @returns {*} A new object or array that is ready for JSON serialization
                 */
                Serializer.prototype.serialize = function (data) {
                    var result = angular.copy(data),
                        self = this;

                    if (angular.isObject(result)) {
                        angular.forEach(this.customSerializedAttributes, function (value, key) {
                            if (angular.isArray(result)) {
                                angular.forEach(result, function (item, index) {
                                    var itemValue = value;
                                    if (angular.isFunction(value)) {
                                        itemValue = itemValue.call(item, item);
                                    }

                                    self.serializeAttribute(item, key, itemValue);
                                });
                            } else {
                                if (angular.isFunction(value)) {
                                    value = value.call(data, data);
                                }

                                self.serializeAttribute(result, key, value);
                            }
                        });
                    }

                    result = this.serializeData(result);

                    return result;
                };

                /**
                 * Iterates over the data deserializing each entry on arrays and each key/value on objects.
                 *
                 * @param data The object to deserialize
                 * @param Resource (optional) The resource type to deserialize the result into
                 * @returns {*} A new object or an instance of Resource populated with deserialized data.
                 */
                Serializer.prototype.deserializeData = function (data, Resource) {
                    var result = data,
                        self = this;

                    if (angular.isArray(data)) {
                        result = [];

                        angular.forEach(data, function (value) {
                            result.push(self.deserializeData(value, Resource));
                        });
                    } else if (angular.isObject(data)) {
                        if (angular.isDate(data)) {
                            return data;
                        }
                        result = {};

                        if (Resource) {
                            result = new Resource.config.resourceConstructor();
                        }

                        this.deserializeObject(result, data);

                    }

                    return result;
                };

                Serializer.prototype.deserializeObject = function (result, data) {

                    var tthis = this;
                    angular.forEach(data, function (value, key) {
                        tthis.deserializeAttribute(result, key, value);
                    });
                    return data;
                };


                /**
                 * Transforms an attribute and its value and stores it on the parent data object.  The attribute will be
                 * renamed as needed and the value itself will be deserialized as well.
                 *
                 * @param data The object that the attribute will be added to
                 * @param attribute The attribute to transform
                 * @param value The current value of the attribute
                 */
                Serializer.prototype.deserializeAttribute = function (data, attribute, value) {
                    var serializer,
                        NestedResource,
                        attributeName = this.getDeserializedAttributeName(attribute);

                    // undefined means the attribute should be excluded from serialization
                    if (attributeName === undefined) {
                        return;
                    }

                    serializer = this.getAttributeSerializer(attributeName);
                    NestedResource = this.getNestedResource(attributeName);

                    // preserved attributes are assigned unmodified
                    if (this.preservedAttributes[attributeName]) {
                        data[attributeName] = value;
                    } else {
                        data[attributeName] = serializer ? serializer.deserialize(value, NestedResource) : this.deserializeData(value, NestedResource);
                    }
                };

                /**
                 * Deserializes the data by applying various transformations such as:
                 *   - Camelizing attribute names
                 *   - attribute renaming
                 *   - attribute exclusion
                 *   - nested resource creation
                 *
                 * @param data The object to deserialize
                 * @param Resource (optional) The resource type to deserialize the result into
                 * @returns {*} A new object or an instance of Resource populated with deserialized data
                 */
                Serializer.prototype.deserialize = function (data, Resource) {
                    // just calls deserializeValue for now so we can more easily add on custom attribute logic for deserialize too
                    return this.deserializeData(data, Resource);
                };

                Serializer.prototype.pluralize = function (value) {
                    if (this.options.pluralize) {
                        return this.options.pluralize(value);
                    }
                    return value;
                };

                Serializer.prototype.underscore = function (value) {
                    if (this.options.underscore) {
                        return this.options.underscore(value);
                    }
                    return value;
                };

                Serializer.prototype.camelize = function (value) {
                    if (this.options.camelize) {
                        return this.options.camelize(value);
                    }
                    return value;
                };

                return Serializer;
            }

            railsSerializer.defaultOptions = defaultOptions;
            return railsSerializer;
        }];
    });
}());