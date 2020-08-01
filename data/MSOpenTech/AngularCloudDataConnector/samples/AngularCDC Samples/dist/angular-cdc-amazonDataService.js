/* Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information. */
/// <reference path="../../../lib/angularjs/angular.d.ts" />
/// <reference path="../../../lib/jquery/jquery.d.ts" />
/// <reference path="../../../dist/angular-cdc.d.ts" />
var AngularCloudDataConnector;
(function (AngularCloudDataConnector) {
    var AWSDataService = (function () {
        function AWSDataService() {
            this.tableNames = new Array();
        }
        AWSDataService.prototype.initSource = function (AccountId, RoleArn, idPool, region, tableNames) {
            AWS.config.region = region;
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                AccountId: AccountId,
                IdentityPoolId: idPool,
                RoleArn: RoleArn
            });
            AWS.config.credentials.get(function (credentialsResults) {
            });
            this.AWSClient = new AWS.DynamoDB();
            this.tableNames = tableNames;
        };
        // the callback is called with an array of objects { tableName: <tableName>, table: <array> }
        AWSDataService.prototype.get = function (updateCallback, lastSyncDates) {
            this.dataAvailableCallback = updateCallback;
            var count = 0;
            var total = this.tableNames.length;
            var tableName;
            for (var x = 0; x < total; x++) {
                tableName = this.tableNames[x];
                var lastSyncDate = lastSyncDates[tableName];
                this._getTable(tableName, function (resultElement) {
                    count++;
                    updateCallback([resultElement]);
                    if (count === total) {
                    }
                }, lastSyncDate);
            }
        };
        AWSDataService.prototype._getTable = function (tableName, callback, lastDate) {
            var _this = this;
            var Table = new AWS.DynamoDB({ params: { TableName: tableName } });
            var firstCall = false;
            if (!lastDate) {
                lastDate = new Date(null);
                firstCall = true;
            } // Since the server sets the updateData and we are doing a sort on date we assume we will never miss an item as long as we query from our latest update date.
            this.AWSClient.scan({ TableName: tableName }, function (err, table) {
                if (err) {
                    console.log(err);
                    callback(null);
                }
                else {
                    var items = [];
                    for (var i = 0; i < table.Items.length; i++) {
                        // create the item with the correct mapping for DynamoDB
                        var item = {};
                        for (var x in table.Items[i]) {
                            item[x] = table.Items[i][x].S;
                        }
                        items.push(item);
                    }
                    if (_this.deletedItem)
                        items.push(_this.deletedItem);
                    var result = { 'tableName': tableName, 'table': items };
                    callback(result);
                    _this.deletedItem = null;
                }
            });
        };
        //remove an entity
        AWSDataService.prototype.remove = function (tableName, entity, onsuccess, onerror) {
            var dynDB = new AWS.DynamoDB();
            this.deletedItem = entity;
            this.deletedItem.sync_deleted = true;
            dynDB.deleteItem({
                "TableName": tableName,
                "Key": { "id": { "S": entity.id + "" } },
                "ReturnValues": "ALL_OLD"
            }, onsuccess, onerror);
        };
        //update an entity
        AWSDataService.prototype.update = function (tableName, entity, onsuccess, onerror) {
            var dynDB = new AWS.DynamoDB();
            var item = {};
            for (var i in entity) {
                if (typeof (entity[i]) != 'function' && i !== 'id')
                    item[i] = { "Value": { "S": entity[i] }, "Action": "PUT" };
            }
            dynDB.updateItem({
                'TableName': tableName,
                "Key": { "id": { "S": entity.id } },
                "AttributeUpdates": item,
                "Expected": {}
            }, function (e) {
            }, onerror);
        };
        //add an entity
        AWSDataService.prototype.add = function (tableName, entity, onsuccess, onerror) {
            var dynDB = new AWS.DynamoDB();
            delete entity.$$hashKey;
            entity.id = Math.random() + '';
            // create the item with the correct mapping for DynamoDB
            var item = {};
            for (var i in entity) {
                if (typeof (entity[i]) != 'function')
                    item[i] = { "S": entity[i] };
            }
            dynDB.putItem({
                'TableName': tableName,
                "Item": item,
                "Expected": {}
            }, onsuccess, onerror);
        };
        return AWSDataService;
    })();
    AngularCloudDataConnector.AWSDataService = AWSDataService;
})(AngularCloudDataConnector || (AngularCloudDataConnector = {}));
// Angular
var angularCDCAWS = new AngularCloudDataConnector.AWSDataService();
angular.module('AngularCDC.AWS', []).value('angularCDCAWS', angularCDCAWS);
