var Spaz; if (!Spaz) Spaz = {};

/***********
Spaz.Cache
************/
if (!Spaz.Cache) Spaz.Cache = {};

Spaz.Cache.sources  = {};
Spaz.Cache.statuses = {};
Spaz.Cache.screenNames = [];

// 'username':{ 'count':0 }
// this isn't used yet, but it really should be
Spaz.Cache.screenNamesAccesses = {};

// Spaz.Cache.maxScreenNames = 300;

Spaz.Cache.buildScreenNameCache = function() {
	return;
	// $('[user-screen_name]', '#'+Spaz.Section.friends.timeline).each( function() {
	// 	Spaz.Cache.addScreenName($(this).attr('user-screen_name'));
	// });
	// 
	// var numEntries = Spaz.Cache.screenNames.length;
	// 
	// if (numEntries > Spaz.Prefs.get('screennames-cache-max')) {
	// 	var diff = numEntries - Spaz.Prefs.get('screennames-cache-max');
	// 	sch.dump("numEntries is "+ numEntries + " > " + Spaz.Prefs.get('screennames-cache-max') + "; removing last "+diff+" entries");
	// 
	// 	Spaz.Cache.screenNames.splice(0, diff);
	// }
	// 
	// 
	// sch.dump('Spaz.Cache.screenNames = '+Spaz.Cache.screenNames.toString() + ' ['+Spaz.Cache.getScreenNamesCount()+']');
};

Spaz.Cache.addScreenName = function(name) {
	if (Spaz.Cache.screenNames.indexOf(name) == -1) {
		Spaz.Cache.screenNames.push(name)
		sch.debug('Added "'+name.toLowerCase()+'". Number of screen names is '+Spaz.Cache.getScreenNamesCount());
	}
};

Spaz.Cache.delScreenName = function(name) {
	if (Spaz.Cache.screenNames.indexOf(name)) {
		sch.dump('Spaz.Cache.delScreenName not yet implemented');
	}
	
};

Spaz.Cache.getScreenNames = function() {
	// return Spaz.Cache.screenNames;
	
	var screen_names = [];
	
	$('[user-screen_name]', '#'+Spaz.Section.friends.timeline).each(function() {
		name = $(this).attr('user-screen_name');
		if (screen_names.indexOf(name) == -1) {
			screen_names.push(name);
			// sch.dump('Added "'+name+'". Number of screen names is '+screen_names.length);
		}
	});
	
	return screen_names;
	
	// var numEntries = Spaz.Cache.screenNames.length;
	// 
	// if (numEntries > Spaz.Prefs.get('screennames-cache-max')) {
	// 	var diff = numEntries - Spaz.Prefs.get('screennames-cache-max');
	// 	sch.dump("numEntries is "+ numEntries + " > " + Spaz.Prefs.get('screennames-cache-max') + "; removing last "+diff+" entries");
	// 
	// 	Spaz.Cache.screenNames.splice(0, diff);
	// }
	
}

Spaz.Cache.getScreenNamesCount = function() {
	return Spaz.Cache.screenNames.length;
}


Spaz.Cache.getScreenNamesAsTags = function() {
	var tagnames = [];
	var names = Spaz.Cache.getScreenNames();
	return names;
};



/**
 * sources cache
 */
Spaz.Cache.getSource = function(key) {
	// sch.debug('SOURCE CACHE: looking for ' + key);
	if (Spaz.Cache.sources[key]) {
		// sch.debug('SOURCE CACHE: val for ' + key + ' is ' + Spaz.Cache.sources[key]);
		return Spaz.Cache.sources[key];
	}
	return false;
};
Spaz.Cache.setSource = function(key, val) {
	// sch.debug('SOURCE CACHE: setting ' + key + ' to ' + val);
	Spaz.Cache.sources[key]=val;
	sch.debug("Added to SOURCE CACHE; length:"+Spaz.Cache.sourcesSize());
};
Spaz.Cache.sourcesSize = function() {
	var x = 0;
	for(i in Spaz.Cache.sources) {
		x++;
	}
	return x;
};
Spaz.Cache.sourcesClear = function() {
	Spaz.Cache.sources = {}
	sch.debug('Cleared sources cache');
};
Spaz.Cache.sourcesDump = function() {
	var str = '';
	for(i in Spaz.Cache.sources) {
		str = str + 'Spaz.Cache.sources['+i+']='+Spaz.Cache.sources[i] + "\n";
	}
	return str;
};


/**
 * statuses cache
 */
Spaz.Cache.getStatus = function(key) {
	// sch.debug('STATUS CACHE: looking for ' + key);
	if (Spaz.Cache.statuses[key]) {
		// sch.debug('STATUS CACHE: val for ' + key + ' is ' + Spaz.Cache.statuses[key]);
		return Spaz.Cache.statuses[key];
	}
	return false;
};
Spaz.Cache.setStatus = function(key, val) {
	// sch.debug('STATUS CACHE: setting ' + key + ' to ' + val);
	Spaz.Cache.statuses[key]=val;
	sch.debug("Added to STATUS CACHE; length:"+Spaz.Cache.statusesSize());
};
Spaz.Cache.statusesSize = function() {
	var x = 0;
	for(i in Spaz.Cache.statuses) {
		x++;
	}
	return x;
};
Spaz.Cache.statusesClear = function() {
	Spaz.Cache.statuses = {}
	sch.debug('Cleared satuses cache');
}
Spaz.Cache.statusesDump = function() {
	var str = '';
	for(i in Spaz.Cache.statuses) {
		str = str + 'Spaz.Cache.statuses['+i+']='+Spaz.Cache.statuses[i] + "\n";
	}
	return str;
};