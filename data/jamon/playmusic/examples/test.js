/* Example usage script.
 *
 * Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ 
 */

var fs = require('fs');
var PlayMusic = require('../');

var pm = new PlayMusic();
var config = JSON.parse(fs.readFileSync("config.json"));
pm.init(config, function() {
    pm.getLibrary(function(library) {
        var song = library.data.items.pop();
        console.log(song);
        pm.getStreamUrl(song.id, function(streamUrl) {
            console.log(streamUrl);
        });
    });

    pm.search("bastille lost fire", 5, function(data) {
        var song = data.entries.sort(function(a, b) {
            return a.score < b.score;
        }).shift();
        console.log(song);
        pm.getStreamUrl(song.track.nid, function(streamUrl) {
            console.log(streamUrl);
        });
    }, function(err) {
        console.log(err);
    });

    pm.getPlayLists(function(data) {
        console.log(data.data.items);
    });

    pm.getPlayListEntries(function(data) {
        console.log(data.data.items);
    });

    pm.getStreamUrl("Thvfmp2be3c7kbp6ny4arxckz54", console.log);
});
