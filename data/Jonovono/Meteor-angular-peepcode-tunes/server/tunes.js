Albums = new Meteor.Collection("albums");
Playlist = new Meteor.Collection("playlist");

Meteor.publish("albums", function() {
	return Albums.find({});
});

Meteor.publish("playlist", function() {
	return Playlist.find({});
});
// 
// Meteor.publish("player", function() {
// 	return Player.find({});
// });


if (Meteor.isClient) {
	console.log("CLIENT");
  Template.hello.greeting = function () {
    return "Welcome to tunes.";
  };

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });
}

if (Meteor.isServer) {
	console.log("ALBUM COUNT");
	console.log(Albums.find().count());
	console.log("PLAYLIST COUNT");
	console.log(Playlist.find().count());
	console.log("SERVE");
  Meteor.startup(function () {
	console.log("START");
	if (Albums.find().count() === 0) {
		console.log("NO ALBUMS");
		var data = [{
		    "title": "Bound - Zen Bound Ingame Music",
		    "artist": "Ghost Monkey",
		    "tracks": [{
		        "title": "Care",
		        "url": "music/blue.mp3"
		    },
		    {
		        "title": "Rope and Wood",
		        "url": "music/jazz.mp3"
		    },
		    {
		        "title": "Problem Solvent",
		        "url": "music/minimalish.mp3"
		    },
		    {
		        "title": "Unpaint My Skin",
		        "url": "music/slower.mp3"
		    },
		    {
		        "title": "Nostalgia",
		        "url": "music/blue.mp3"
		    },
		    {
		        "title": "Interludum",
		        "url": "music/jazz.mp3"
		    },
		    {
		        "title": "Grind",
		        "url": "music/minimalish.mp3"
		    },
		    {
		        "title": "Diagrams",
		        "url": "music/slower.mp3"
		    },
		    {
		        "title": "Hare",
		        "url": "music/blue.mp3"
		    },
		    {
		        "title": "Carefree",
		        "url": "music/jazz.mp3"
		    },
		    {
		        "title": "Tunnel At The End Of Light",
		        "url": "music/minimalish.mp3"
		    }]
		},
		{
		    "title": "Where the Earth Meets the Sky",
		    "artist": "Tom Heasley",
		    "tracks": [{
		        "title": "Ground Zero",
		        "url": "music/blue.mp3"
		    },
		    {
		        "title": "Western Sky",
		        "url": "music/jazz.mp3"
		    },
		    {
		        "title": "Monterey Bay",
		        "url": "music/minimalish.mp3"
		    },
		    {
		        "title": "Where the Earth Meets the Sky",
		        "url": "music/slower.mp3"
		    }]
		}];
		console.log(data);
		Playlist.insert({albums: []});
		
		
		for (var i = 0; i < data.length; i++) {
			console.log("FOR");
			Albums.insert(data[i]);
		}		
    // code to run on server at startup
  }
});
}

// Meteor.publish('albums', function () {
//   return Albums.find({});
// });