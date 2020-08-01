(function() {
    'use strict';

    angular.module('app.mockapi', ['app', 'ngMockE2E'])
        .run(mockApiConfig);

    /* @ngInject */
    function mockApiConfig($httpBackend) {
        $httpBackend.whenGET(/\.html$/).passThrough();
        $httpBackend.whenGET(/^stream/).passThrough();
        $httpBackend.whenPOST('/api').respond(function(method, url, jsonData) {
            var data = JSON.parse(jsonData);
            var command = data.Command;
            delete data.Command;

            if (requests[command] !== 'undefined') {
                var output = requests[command](data);
                console.log({
                    command: command,
                    input: data,
                    output: output
                });
                return output;
            }

            console.warn({
                error: 404,
                command: command,
                input: data
            });
            return [404, {}, {}];
        });
    }

    angular.module('app').requires.push('app.mockapi');

    var requests = {
        GetTrackByID: function() {
            return [200, {}, {}];
        },
        GetTracks: function(data) {
            var output = [];

            for (var i = data.Start; i < data.Start + data.Limit; i++) {
                output.push(getMockTrack(i));
            }

            return [200, output, {}];
        },
        GetAlbums: function(data) {
            var output = [];

            for (var i = data.Start; i < data.Start + data.Limit; i++) {
                output.push(getMockAlbum(i));
            }

            return [200, output, {}];
        },
        GetArtists: function(data) {
            var output = [];

            for (var i = data.Start; i < data.Start + data.Limit; i++) {
                output.push(getMockArtist(i));
            }

            return [200, output, {}];
        },
        SearchTracks: function(data) {
            var output = [];

            for (var i = data.Start; i < data.Start + data.Limit; i++) {
                output.push(getMockTrack(i));
            }

            return [200, output, {}];
        },
        SearchAlbums: function(data) {
            var output = [];

            for (var i = data.Start; i < data.Start + data.Limit; i++) {
                output.push(getMockAlbum(i));
            }

            return [200, output, {}];
        },
        SearchArtists: function(data) {
            var output = [];

            for (var i = data.Start; i < data.Start + data.Limit; i++) {
                output.push(getMockArtist(i));
            }

            return [200, output, {}];
        },
        GetTracksByArtist: function(data) {
            var output = [];

            for (var i = data.Start; i < data.Start + data.Limit; i++) {
                output.push(getMockTrack(i));
            }

            return [200, output, {}];
        },
        GetTracksByAlbum: function(data) {
            var output = [];

            for (var i = data.Start; i < data.Start + data.Limit; i++) {
                output.push(getMockTrack(i));
            }

            return [200, output, {}];
        },
        GetAlbumsByArtist: function(data) {
            var output = [];

            for (var i = data.Start; i < data.Start + data.Limit; i++) {
                output.push(getMockAlbum(i));
            }

            return [200, output, {}];
        },
        GetToken: function() {
            return [200, {
                Token: 'abcdefghijklmnopqrstuvxyz'
            }, {}];
        },
        GetSession: function() {
            return [200, {
                Session: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            }, {}];
        },
        ConvertTrackByID: function(data) {
            return [200, {
                Result: 'Success',
                FileName: data.String
            }, {}];
        },
        LFMNowPlayingTrack: function() {
            return [200, {

            }, {}];
        },
        LFMScrobbleTrack: function() {
            return [200, {

            }, {}];
        },
        GetUserPreferences: function() {
            return [200, {
                ScrobblingEnabled: 1
            }, {}];
        }
    };

    function getMockTrack(id) {
        return {
            ID: id,
            Name: 'Track ' + id,
            Duration: 60
        };
    }

    function getMockAlbum(id) {
        return {
            ID: id,
            Name: 'Album ' + id
        };
    }

    function getMockArtist(id) {
        return {
            ID: id,
            Name: 'Artist ' + id
        };
    }
})();
