"use strict";

var async = require("async"),
    _ = require("underscore");

var log = require("./logger").get("data"),
    config = require("./config.js"),
    routes,
    env = require("./env.js"),
    alamidValidators = require("./helpers/alamidValidators.js");

/**
 * calls the remote validator via request and returns the result
 * @param {String} modelUrl
 * @param {!Object} modelData
 * @param {Function} callback
 */
function remoteValidation(modelUrl, modelData, callback) {

    var request,
    //will be set after app.init
        routes = config.routes;

    if (env.isServer()) {
        throw new Error("(alamid) You cannot call remoteValidation on the server");
    }

    request = require("../client/helpers/request.js");

    //make full path
    var url = "";

    if (config.basePath !== undefined && config.basePath !== null) {
        url += config.basePath;
    }

    url += routes.validators + "/" + modelUrl;

    //make request here
    request("create", url, modelData, function (err, response) {

        if (err) {
            response = {
                status : "error",
                message : "(alamid) Request-Error '" + err.message + "'",
                data : {
                    error : "requestError"
                }
            };
        }

        callback(response.data);
    });
}

/**
 * does the actual validation at the local environment (used on server & client)
 * @param {!Object} schema
 * @param {!Object} modelData
 * @param {!Function} callback
 */
function localValidation(schema, modelData, callback) {

    var result = {
        result : true,
        failedFields : {}
    };

    function runFieldValidation(field, fieldValidationDoneCallback) {

        var syncFieldValidationResponse,
            expectedCalls = 0,
            calls = 0;


        function markResult(validationResult) {

            if (validationResult !== true) {

                if (result.failedFields[field] === undefined) {
                    result.failedFields[field] = [];
                }

                result.failedFields[field].push(validationResult);

                result.result = false; //overall result
            }
        }

        function runValidatorCallback(validationResult) {

            calls++;

            if (validationResult !== undefined) {
                markResult(validationResult);
            }

            if(calls === expectedCalls) {
                fieldValidationDoneCallback();
            }
        }

        //default alamid validators
        if (schema[field].required === true) {
            if (alamidValidators.checkRequired(modelData[field]) !== true) {
                markResult("required");
            }
        }
        if (schema[field]["enum"] instanceof Array) {
            if (alamidValidators.checkEnum(modelData[field], schema[field]["enum"]) !== true) {
                markResult("enum");
            }
        }
        if (typeof schema[field].min === "number") {
            if (alamidValidators.checkMin(modelData[field], schema[field].min) !== true) {
                markResult("min");
            }
        }
        if (typeof schema[field].max === "number") {
            if (alamidValidators.checkMax(modelData[field], schema[field].max) !== true) {
                markResult("max");
            }
        }

        //does validation result exist?
        if (schema[field].validate !== undefined) {

            var validators = schema[field].validate;

            //arrayify!
            if (!_(validators).isArray()) {
                validators = [validators];
            }

            expectedCalls = validators.length;

            _(validators).each(function (validator) {

                //async code - directly calls the callback
                syncFieldValidationResponse = validator.call(modelData, modelData[field], function (asyncFieldValidationResult) {
                    runValidatorCallback(asyncFieldValidationResult);
                });

                //sync code
                if (syncFieldValidationResponse !== undefined) {
                    runValidatorCallback(syncFieldValidationResponse);
                }
            });
        }
        else {
            expectedCalls++;
            //no validation found
            runValidatorCallback(true);
        }
    }

    //START
    async.forEach(_.keys(schema), runFieldValidation, function (err) {

        if (err) {
            throw err;
        }

        callback(result);
    });
}

/**
 * merge failedFields of localValidation to the global failedFields object
 * @param overallResult
 * @param resultToAppend
 * @return {*}
 */
function extendFailedFields(overallResult, resultToAppend) {

    _(resultToAppend.failedFields).each(function (failedField, key) {

        if (overallResult.failedFields[key] === undefined) {
            overallResult.failedFields[key] = failedField;
        }
        else {
            overallResult.failedFields[key] = overallResult.failedFields[key].concat(failedField);
        }
    });

    return overallResult;
}

/**
 * Validate model-data on shared, local and remote schemas.
 * If used on client, the validator will also call remote validation
 * @param {Object} sharedSchema
 * @param {Object} localSchema
 * @param {String} modelUrl
 * @param {Object} modelData
 * @param {String} remote
 * @param {Function} callback
 */
function validate(sharedSchema, localSchema, modelUrl, modelData, remote, callback) {

    var overallResult = {
        result : false,
        failedFields : {}
    };

    async.series({
            //validate SHARED Schema locally
            localSharedVal : function (cb) {


                localValidation(sharedSchema, modelData, function (sharedResult) {

                    overallResult.result = sharedResult.result;
                    overallResult.shared = sharedResult;

                    //maybe don't skip here
                    if (sharedResult.result === false) {
                        extendFailedFields(overallResult, sharedResult);
                    }

                    //check for second full-validation if shared worked out
                    cb(null);
                });
            },
            //validate LocalSchema if existent locally
            localVal : function (cb) {

                if (sharedSchema === localSchema) {
                    //SharedSchema and LocalSchema are identically. Skipping localSchema-Validation.
                    cb(null);
                    return;
                }

                localValidation(localSchema, modelData, function (localResult) {

                    overallResult.local = localResult;

                    if (localResult.result === false) {

                        overallResult.result = false;
                        extendFailedFields(overallResult, localResult);

                        cb(new Error("Validation failed"));
                        return;
                    }

                    cb(null);
                });
            },
            //validate remotely
            remoteValidation : function (cb) {

                if (remote === false || env.isServer()) {
                    //needed to call the final callback
                    cb(new Error("Remote is disabled. Skipping."));
                    return;
                }

                remoteValidation(modelUrl, modelData, function (remoteResult) {

                    if (remoteResult.result === false) {
                        overallResult.result = false;
                        extendFailedFields(overallResult, remoteResult);
                    }

                    overallResult.remote = remoteResult;

                    cb();
                });
            }
        },
        function (err) {
            callback(overallResult);
        });
}

exports.localValidation = localValidation;
exports.validate = validate;
exports.remoteValidation = remoteValidation;