"use strict";
//Inspired by the great mongoose-project: https://github.com/LearnBoost/mongoose/blob/master/lib/schema.js

var value = require("value");

var supportedTypes = [
        "String",
        "Number",
        "Boolean",
        "Date",
        "Array",
        "Object"
    ],
    fnName = /function ([a-z]+?)\(/i;

/**
 * determine the type of an object
 * inspired by mongoose
 *
 * @param obj
 * @return {*}
 */
function determineType(obj) {
    var type,
        typeValue,
        name;

    if (value(obj).typeOf(Object)) {
        type = obj.type || "Object";
    } else {
        type = obj;
    }

    typeValue = value(type);

    if (typeValue.typeOf(String)) {
        name = type.charAt(0).toUpperCase() + type.substring(1);

        return supportedTypes.indexOf(name) === -1 ? "String" : name;
    } else if (typeValue.typeOf(Function)) {
        name = type.toString().match(fnName)[1];
    } else if (typeValue.typeOf(Object)) {
        if (type.type) {
            name = type.type;
        } else {
            return "Object";
        }
    } else {
        name = type.constructor.toString().match(fnName)[1];
    }

    if (supportedTypes.indexOf(name) === -1) {
        throw new TypeError("(alamid) Type '" + name + "' is not supported");
    }

    return name;
}

/**
 * extract keys, types, defaults from the schema object
 *
 * @param {Object} schema
 * @return {Object}
 */
function processSchema(schema) {

    var key,
        fieldDefinition,
        type,
        keys = [],
        defaults = {},
        types = {},
        setters = {};

    for (key in schema) {
        if (schema.hasOwnProperty(key)) {

            keys.push(key);

            fieldDefinition = schema[key];
            //determine supported types
            type = determineType(fieldDefinition);

            types[key] = type;

            // Check if there is a default defined.
            if (fieldDefinition.hasOwnProperty("default")) {
                //defaults can be functions
                if (value(fieldDefinition["default"]).typeOf(Function)) {
                    defaults[key] = fieldDefinition["default"]();
                } else {
                    defaults[key] = fieldDefinition["default"];
                }
            }

            if (value(fieldDefinition.set).typeOf(Function)) {
                setters[key] = [fieldDefinition.set];
            } else if (value(fieldDefinition.set).typeOf(Array)) {
                setters[key] = fieldDefinition.set;
            }
        }
    }

    return {
        keys : keys,
        defaults : defaults,
        types : types,
        setters : setters
    };
}

/**
 * get all writeable fields
 * @param schema
 * @returns {Array}
 */
function getWriteableFields(schema) {
    return getFields(schema, "writeable");
}

/**
 * get all readable fields
 * @param schema
 * @returns {Array}
 */
function getReadableFields(schema) {
    return getFields(schema, "readable");
}

/**
 * checks if data contains fields that are not writeable
 * return an array of invalidFields
 * array.length = 0 means everything is easy!
 * @param schema
 * @param data
 * @returns {Array}
 */
function getUnwriteableFieldsForData(schema, data) {
    var invalidFields = [],
        writeableFields = getWriteableFields(schema);

    for (var field in data) {
        if (data.hasOwnProperty(field)) {
            if (writeableFields.indexOf(field) === -1) {
                invalidFields.push(field);
            }
        }
    }
    return invalidFields;
}

/**
 * get all fields that don't have attr = false
 * @param schema
 * @param attr
 * @returns {Array}
 */
function getFields(schema, attr) {

    var fields = [];

    for (var property in schema) {
        if (schema.hasOwnProperty(property)) {

            if (schema[property][attr] !== false) {
                fields.push(property);
            }
        }
    }

    return fields;

}

/**
 * @param {Object} model
 * @param {Object} schema
 */
function applySchema(model, schema) {
    var schemaData = processSchema(schema);

    model._keys = schemaData.keys;
    model._defaults = schemaData.defaults;
    model._types = schemaData.types;
    model._setters = schemaData.setters;
}

exports.processSchema = processSchema;
exports.getReadableFields = getReadableFields;
exports.getWriteableFields = getWriteableFields;
exports.getUnwriteableFieldsForData = getUnwriteableFieldsForData;
exports.applySchema = applySchema;