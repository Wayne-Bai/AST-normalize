var icon = angular.module('icon.services', []);

icon.factory('Icon', function ($http, $q, $timeout) {


    var icons = {

        icons: function () {
            var self = this;
            var deferred = $q.defer();
            if (!this.iconset) {
                $http.get('config/config.json').success(function (data) {
                    self.iconset = data['glyphs'];
                    var newData = data['glyphs'].map(function (d) {
                        d.css = 'icon-' + d.css;
                        return d;
                    });
                    deferred.resolve(newData);
                });
            } else {
                $timeout(function () {
                    deferred.resolve(self.iconset);
                }, 500);
            }
            return deferred.promise;
        }
    }


    return icons;
});