/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/models/model', function(S, Model, IO, Magix) {
    return Model.extend({
        sync: function(callback) {
            var pathInfos = Magix.local('APIPathInfo');
            var apiPath = Magix.config('apiPath');
            var url = this.get('url');
            var path = apiPath + pathInfos.loader + '/' + pathInfos.ver + '/';
            if (url) {
                path += url;
            } else {
                var cName = this.get('cName') || pathInfos.action;
                path += 'symbols/' + cName + '.json';
            }
            IO({
                url: path,
                dataType: 'json',
                success: function(data) {
                    if (S.isArray(data)) {
                        data = {
                            list: data
                        };
                    }
                    callback(null, data);
                },
                error: function(xhr, msg) {
                    callback(msg);
                }
            });
        }
    });
}, {
    requires: ['magix/model', 'ajax', 'magix/magix']
});