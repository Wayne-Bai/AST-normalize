if (Meteor.isServer) {
	Meteor.methods({
		checkDb: function (word) {
			if (UserDictionary.findOne({word: word}) === undefined) {
				console.log(word + ": query returned undefined");
				longmanAPICall(word)
		  } else {
				console.log(word + ": query returned an object");
				console.log(UserDictionary.findOne({word: word}));
				// word was already in db - call the helper function from here
			}
		}
	})
}

function longmanAPICall(word) {
  var url = "http://api.wordnik.com//v4/word.json/" + word + "/definitions?includeRelated=false&includeTags=false&useCanonical=false&api_key=d103d202714dcea7f420d0d9ca90ddc01f1203225c8df91b6";
  results = Meteor.http.call("GET", url);
	wordnikEntry = results.content;
  wordnikParsed = JSON.parse(wordnikEntry);
	json = {word: word, entry: wordnikParsed[0]["text"]};
  UserDictionary.insert(json)



	// call the helper function from here
}


