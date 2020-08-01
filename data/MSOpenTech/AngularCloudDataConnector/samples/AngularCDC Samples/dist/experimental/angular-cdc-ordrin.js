/* Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information. */
/// <reference path="../../../lib/angularjs/angular.d.ts" />
/// <reference path="../../../lib/jquery/jquery.d.ts" />
/// <reference path="../../../dist/angular-cdc.d.ts" />
var AngularCloudDataConnector;
(function (AngularCloudDataConnector) {
    var OrdrinService = (function () {
        function OrdrinService(http) {
            this.tableNames = new Array();
            this._serviceUrl = "https://sertactest.azure-mobile.net/api/ordrin"; //https://sertactest.azure-mobile.net/api/ordrin?zip=02141&city=cambridge&address=1+Cambridge+Center
            this._zip = "02141";
            this._city = "Cambridge";
            this._address = "1+Cambridge+Center";
            this._http = http;
            this.tableNames = ["restaurants"];
        }
        Object.defineProperty(OrdrinService.prototype, "Zip", {
            set: function (value) {
                this._zip = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OrdrinService.prototype, "City", {
            set: function (value) {
                this._city = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OrdrinService.prototype, "Address", {
            set: function (value) {
                this._address = value;
            },
            enumerable: true,
            configurable: true
        });
        OrdrinService.prototype.add = function (tableName, entity, onsuccess, onerror) {
            console.warn("Ordrin provider does not support adding data.");
        };
        OrdrinService.prototype.get = function (callback, lastSyncDates) {
            var request = this._serviceUrl + "?zip=" + this._zip + "&city=" + this._city + "&address=" + this._address;
            var that = this;
            this._http.get(request).success(function (data) {
                if (that._result) {
                    var table = that._result[0].table;
                    for (var index = 0; index < table.length; index++) {
                        if (table[index].deleted) {
                            table.splice(index, 1);
                            index--;
                            continue;
                        }
                        table[index].deleted = true;
                    }
                    that._result[0].table = table.concat(data);
                }
                else {
                    that._result = [
                        {
                            tableName: "restaurants",
                            table: data
                        }
                    ];
                }
                callback(that._result);
            });
        };
        OrdrinService.prototype.update = function (tableName, entity, onsuccess, onerror) {
            console.warn("Ordrin provider does not support updating data.");
        };
        OrdrinService.prototype.remove = function (tableName, entity, onsuccess, onerror) {
            console.warn("Ordrin provider does not support removing data.");
        };
        return OrdrinService;
    })();
    AngularCloudDataConnector.OrdrinService = OrdrinService;
})(AngularCloudDataConnector || (AngularCloudDataConnector = {}));
// Angular
angular.module('OrdrinDataModule', []).service('ordrinDataService', function ($http) {
    return new AngularCloudDataConnector.OrdrinService($http);
});
