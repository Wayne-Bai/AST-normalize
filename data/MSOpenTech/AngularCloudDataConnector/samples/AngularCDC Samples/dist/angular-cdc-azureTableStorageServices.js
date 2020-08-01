var AzureStorageTableApi = (function () {
    function AzureStorageTableApi(secretKey, accountName) {
        this.secretKey = secretKey;
        this.accountName = accountName;
        if (!jQuery || !jQuery.ajax) {
            throw "JQuery is required";
        }
        if (!CryptoJS || !CryptoJS.enc || !CryptoJS.HmacSHA256 || !CryptoJS.enc.Base64 || !CryptoJS.enc.Utf8) {
            throw "CryptoJS is required";
        }
    }
    AzureStorageTableApi.prototype.getSignature = function (stringToSign) {
        return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(CryptoJS.enc.Utf8.parse(stringToSign), CryptoJS.enc.Base64.parse(this.secretKey)));
    };
    AzureStorageTableApi.prototype.xhrParams = function (xhr, path) {
        var date = (new Date()).toUTCString();
        var stringToSign = date + "\n" + "/" + this.accountName + "/" + path;
        xhr.setRequestHeader('Authorization', "SharedKeyLite " + this.accountName + ":" + this.getSignature(stringToSign));
        xhr.setRequestHeader('x-ms-date', date);
        xhr.setRequestHeader('x-ms-version', '2014-02-14');
        xhr.setRequestHeader('Accept', 'application/json;odata=nometadata');
        xhr.setRequestHeader('DataServiceVersion', '3.0;NetFx');
        xhr.setRequestHeader('MaxDataServiceVersion', '3.0;NetFx');
        return xhr;
    };
    AzureStorageTableApi.prototype.getTable = function (tableName, callback) {
        var that = this;
        var path = "Tables('" + tableName + "')";
        var urlPath = "https://" + this.accountName + ".table.core.windows.net/" + path;
        jQuery.ajax({
            url: urlPath,
            type: 'GET',
            success: function (data) {
                that.getListItemsInTable(tableName, tableName, callback);
                //do something to data
            },
            beforeSend: function (xhr) {
                xhr = that.xhrParams(xhr, path);
            },
            error: function (rcvData) {
                if (rcvData && rcvData.status === 404) {
                    var path = "Tables()";
                    var urlPath = "https://" + that.accountName + ".table.core.windows.net/" + path;
                    var jsondata = '{"TableName":"' + tableName + '"}';
                    jQuery.ajax({
                        url: urlPath,
                        data: jsondata,
                        type: 'POST',
                        success: function (data) {
                            that.getListItemsInTable(tableName, tableName, callback);
                            //do something to data
                        },
                        beforeSend: function (xhr) {
                            xhr = that.xhrParams(xhr, path);
                            xhr.setRequestHeader('Content-Length', jsondata.length + "");
                            xhr.setRequestHeader('Content-Type', "application/json");
                        },
                        error: function (rcvData) {
                            console.log(rcvData);
                        }
                    });
                }
                console.log(rcvData);
            }
        });
    };
    AzureStorageTableApi.prototype.getListItemsInTable = function (tableName, partitionKey, callback) {
        var that = this;
        var path = tableName;
        var urlPath = "https://" + this.accountName + ".table.core.windows.net/" + path;
        jQuery.ajax({
            url: urlPath + encodeURI("?$filter=PartitionKey eq '" + partitionKey + "'"),
            type: 'GET',
            success: function (data) {
                callback(data.value);
                //do something to data
            },
            beforeSend: function (xhr) {
                xhr = that.xhrParams(xhr, path);
            },
            error: function (rcvData) {
                callback([]);
                console.log(rcvData);
            }
        });
    };
    AzureStorageTableApi.prototype.insertEntity = function (tableName, data, callback, errorCallback) {
        var that = this;
        var path = tableName + '()';
        var urlPath = "https://" + this.accountName + ".table.core.windows.net/" + path;
        if (!data.PartitionKey || !data.RowKey) {
            throw "PartitionKey and RowKey is required";
        }
        var jsondata = JSON.stringify(data);
        jQuery.ajax({
            url: urlPath,
            type: 'POST',
            data: jsondata,
            success: function (data) {
                callback(data);
            },
            beforeSend: function (xhr) {
                xhr = that.xhrParams(xhr, path);
                xhr.setRequestHeader('Content-Length', jsondata.length + "");
                xhr.setRequestHeader('Content-Type', "application/json");
            },
            error: function (rcvData) {
                console.log(rcvData);
                errorCallback(rcvData);
            }
        });
    };
    AzureStorageTableApi.prototype.updateEntity = function (tableName, data, callback, errorCallback) {
        var that = this;
        var path = tableName + "(PartitionKey='" + data.PartitionKey + "',RowKey='" + data.RowKey + "')";
        var urlPath = "https://" + this.accountName + ".table.core.windows.net/" + path;
        delete data.RowKey;
        delete data.PartitionKey;
        var jsondata = JSON.stringify(data);
        jQuery.ajax({
            url: urlPath,
            type: 'GET',
            data: jsondata,
            success: function (d) {
                jQuery.ajax({
                    url: urlPath,
                    type: 'PUT',
                    data: jsondata,
                    success: function (data) {
                        callback(data);
                    },
                    beforeSend: function (xhr) {
                        xhr = that.xhrParams(xhr, path);
                        xhr.setRequestHeader('If-Match', "W/\"datetime'" + encodeURIComponent(d.Timestamp) + "'\"");
                        xhr.setRequestHeader('Content-Type', "application/json");
                    },
                    error: function (rcvData) {
                        console.log(rcvData);
                        errorCallback(rcvData);
                    }
                });
            },
            beforeSend: function (xhr) {
                xhr = that.xhrParams(xhr, path);
            },
            error: function (rcvData) {
                console.log(rcvData);
                errorCallback(rcvData);
            }
        });
    };
    AzureStorageTableApi.prototype.deleteEntity = function (tableName, entity, callback, errorCallback) {
        var that = this;
        var path = tableName + "(PartitionKey='" + entity.PartitionKey + "',RowKey='" + entity.RowKey + "')";
        var urlPath = "https://" + this.accountName + ".table.core.windows.net/" + path;
        jQuery.ajax({
            url: urlPath,
            type: 'GET',
            success: function (d) {
                jQuery.ajax({
                    url: urlPath,
                    type: 'DELETE',
                    success: function (data) {
                        callback(data);
                    },
                    beforeSend: function (xhr) {
                        xhr = that.xhrParams(xhr, path);
                        xhr.setRequestHeader('If-Match', "W/\"datetime'" + encodeURIComponent(d.Timestamp) + "'\"");
                    },
                    error: function (rcvData) {
                        console.log(rcvData);
                        errorCallback(rcvData);
                    }
                });
            },
            beforeSend: function (xhr) {
                xhr = that.xhrParams(xhr, path);
            },
            error: function (rcvData) {
                errorCallback(rcvData);
                console.log(rcvData);
            }
        });
    };
    return AzureStorageTableApi;
})();
;
/// <reference path="azurestoragetableapi.ts" />
/* Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information. */
/// <reference path="../../../lib/angularjs/angular.d.ts" />
/// <reference path="../../../lib/jquery/jquery.d.ts" />
/// <reference path="../../../dist/angular-cdc.d.ts" />
var AngularCloudDataConnector;
(function (AngularCloudDataConnector) {
    var AzureTableStorageService = (function () {
        function AzureTableStorageService() {
            this.tableNames = new Array();
        }
        AzureTableStorageService.prototype.addSource = function (accountName, secretKey, tableNames) {
            var client = new AzureStorageTableApi(secretKey, accountName);
            this.azureClient = client;
            this.tableNames = tableNames;
        };
        // the callback is called with an array of objects { tableName: <tableName>, table: <array> }
        AzureTableStorageService.prototype.get = function (updateCallback, lastSyncDates) {
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
                    } //!+ request is finished.  Might be interesting to have a callback to top level code called at this point.
                }, lastSyncDate);
            }
        };
        AzureTableStorageService.prototype._getTable = function (tableName, callback, lastDate) {
            this.azureClient.getTable(tableName, function (table) {
                var result = { 'tableName': tableName, 'table': table };
                callback(result);
            });
        };
        AzureTableStorageService.prototype.remove = function (tableName, entity, onsuccess, onerror) {
            this.azureClient.deleteEntity(tableName, entity, onsuccess, onerror);
        };
        AzureTableStorageService.prototype.update = function (tableName, entity, onsuccess, onerror) {
            delete entity.$$hashKey;
            this.azureClient.updateEntity(tableName, entity, onsuccess, onerror);
        };
        AzureTableStorageService.prototype.add = function (tableName, entity, onsuccess, onerror) {
            delete entity.$$hashKey;
            this.azureClient.insertEntity(tableName, entity, onsuccess, onerror);
        };
        return AzureTableStorageService;
    })();
    AngularCloudDataConnector.AzureTableStorageService = AzureTableStorageService;
})(AngularCloudDataConnector || (AngularCloudDataConnector = {}));
// Angular
var angularCDCAzureTableStorageServices = new AngularCloudDataConnector.AzureTableStorageService();
angular.module('AngularCDC.AzureTableStorageServices', []).value('angularCDCAzureTableStorageServices', angularCDCAzureTableStorageServices);
