/*
  #!/usr/local/bin/node
  -*- coding:utf-8 -*-
 
  Copyright 2013 yanghua Inc. All Rights Reserved.
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  ---
  Created with Sublime Text 2.
  User: yanghua
  Date: 11/10/13
  Time: 11:03 AM
  Desc: fixedAsset type - the proxy of fixedAsset type
 */

var mysqlClient = require("../libs/mysqlUtil");

/**
 * get all fixed asset types
 * @param  {Function} callback the callback func
 * @return {null}            
 */
exports.getAllFATypes = function (callback) {
    debugProxy("/proxy/faType/getAllFATypes");
    mysqlClient.query({
        sql     : "SELECT * FROM ASSETTYPE",
        params  : {}
    }, function (err, rows) {
        if (err || !rows) {
            return callback(new ServerError(), null);
        }

        callback(null, rows);
    });
};