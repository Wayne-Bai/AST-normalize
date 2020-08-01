angular.module("imgur", ["imgur.global","imgur.album","imgur.account"]);

angular.module("imgur.global", []).provider("$imgurGlobal", function(){
    var globalOptions = {};
    this.options = function(value){
        globalOptions = value;
    };
    this.$get = ["$resource", "$http", "$rootScope", function ($resource, $http, $rootScope) {
        function ImgurGlobal(opts) { 
            var self = this, options = this.options = angular.extend({}, globalOptions, opts);  
        }
        ImgurGlobal.prototype.returnOptions = function(){
            return this.options;
        };
        return {
            imgurGlobal: function(opts){
                return new ImgurGlobal(opts);
            }
        };
    }];
}).filter('merge', function () {
    return function merge() {
        var dst = {}
            ,src
            ,p
            ,args = [].splice.call(arguments, 0)
        ;

        while (args.length > 0) {
            src = args.splice(0, 1)[0];
            if (toString.call(src) == '[object Object]') {
                for (p in src) {
                    if (src.hasOwnProperty(p)) {
                        if (toString.call(src[p]) == '[object Object]') {
                            dst[p] = merge(dst[p] || {}, src[p]);
                        } else {
                            dst[p] = src[p];
                        }
                    }
                }
            }
        }

        return dst;
    };
  });

angular.module('imgur.album', ['imgur.global']).provider("$imgurAlbum", function(){
    var globalOptions = {};
    this.options = function(value){
        globalOptions = value;
    };

    this.$get = ["$resource", "$http", "$rootScope", "$imgurGlobal", "mergeFilter", "$q", function ($resource, $http, $rootScope, $imgurGlobal, mergeFilter, $q) {
        function ImgurAlbum(opts) {
            $http.defaults.useXDomain = true;
            var options = this.options = mergeFilter({}, $imgurGlobal.imgurGlobal().returnOptions(), globalOptions, opts);
            this.options.albumList = (typeof this.options.albumList === 'string')?[this.options.albumList]:this.options.albumList;
            this.call = $resource('https://api.imgur.com/3/album/:album',{},{
                get:{
                        headers:{'Authorization':'Client-ID '+ this.options.apiKey},
                        method:'GET'
                    }
                }); 
        }
        ImgurAlbum.prototype.getAlbum = function(cb){
            var prom = [];
            var albums = [];
            var self = this, options = this.options, call = this.call;

            options.albumList.forEach(function (id) {
                var promise = call.get({album:id}).$then(
                    function(value){
                        albums.push(value.data.data);
                    },
                    function(err){
                        $rootScope.$broadcast('getAlbumError', err.data);
                    }
                );
                prom.push(promise);
            });
            $q.all(prom).then(function () {
                $rootScope.$broadcast('getAlbumSuccess', albums);
                if(cb){cb(albums)};
            });

        };
        //Youre going to move this to a service or filter in the APP.
        ImgurAlbum.prototype.getAlbumImages = function(albums){
            var images = [];
            albums.forEach(function (album) {
                album.images.forEach(function (image) {
                    images.push(image);
                });
            });
            return images;
        };
        return {
            imgurAlbum: function(opts){
                return new ImgurAlbum(opts);
            }
        };
    }];
});

angular.module('imgur.account', ['imgur.global']).provider("$imgurAccount", function(){
    var globalOptions = {};
    this.options = function(value){
        globalOptions = value;
    };

    this.$get = ["$resource", "$http", "$rootScope", "$imgurGlobal", "mergeFilter", "$q", function ($resource, $http, $rootScope, $imgurGlobal, mergeFilter, $q) {
        function ImgurAccount(opts) {
            $http.defaults.useXDomain = true;
            var self = this, options = this.options = mergeFilter({}, $imgurGlobal.imgurGlobal().returnOptions(), globalOptions, opts);            
            this.call = $resource('https://api.imgur.com/3/account/:account/albums',{account:options.account},{
                get:{
                        headers:{'Authorization':'Client-ID '+ options.apiKey},
                        method:'GET'
                    }
                });
        }
        ImgurAccount.prototype.getAccountAlbums = function(cb){
            var self = this, options = this.options, call = this.call;
            this.call.get().$then(
                function(value){
                    $rootScope.$broadcast('getAccountAlbumSuccess', value.data.data);
                    if(cb){cb(value.data.data)};
                },
                function(err){
                    $rootScope.$broadcast('getAccountAlbumFailure', err.data.data);
                }
            );
        };
        return {
            imgurAccount: function(opts){
                return new ImgurAccount(opts);
            }
        };
    }];
});