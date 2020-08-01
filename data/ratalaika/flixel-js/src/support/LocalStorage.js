/**
 * A singleton object to access the device localStorage area.<br>
 *
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author ratalaika / ratalaikaGames
 */
var LocalStorage = function(tag, name)
{
	this.saveTag = tag + "." + name;

	// Load previous data if local Storage is supported
	if (Flixel.FlxG.device.localStorage === true) {
		var keys = JSON.parse(localStorage.getItem(this.saveTag)) || [];
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			this._data[key] = JSON.parse(localStorage.getItem(this.generateTag(key)));
		}
	}
};

/**
 * The storage save tag.
 */
LocalStorage.prototype.saveTag = null;
/**
 * Variable to hold the object data
 */
LocalStorage.prototype._data = {};
/**
 * Internal instance for singelton stuff.
 */
LocalStorage._instance = null;

/**
 * a fucntion to check if the given key is a reserved word
 */
LocalStorage.prototype.isReserved = function(key)
{
	return (key === "add" || key === "remove" || key === "isReserved" || key === "_data");
};

/**
 * Add new keys to localStorage and set them to the given default values if they
 * do not exist
 * 
 * @name add
 * @memberOf me.save
 * @function
 * @param {Object}
 *            props key and corresponding values
 * @example // Initialize "score" and "lives" with default values me.save.add({
 *          score : 0, lives : 3 });
 */
LocalStorage.prototype.add = function(props)
{
	var keys = Object.keys(props);

	// Loop through all the keys
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];

		if (this.isReserved(key))
			return;

		this._data[key] = props[key];
		if (Flixel.FlxG.device.localStorage === true) {
			localStorage.setItem(this.generateTag(key), JSON.stringify(props[key]));
		}
	}

	// Save keys
	if (Flixel.FlxG.device.localStorage === true) {
		localStorage.setItem(this.saveTag, JSON.stringify(Object.keys(this._data)));
	}
};

/**
 * Remove a key from localStorage
 * 
 * @name delete
 * @memberOf me.save
 * @function
 * @param {String}
 *            key key to be removed
 * @example // Remove the "score" key from localStorage me.save.remove("score");
 */
LocalStorage.prototype.remove = function(key)
{
	if (!this.isReserved(key)) {
		// Check if the value exists
		if (typeof this._data[key] !== 'undefined') {
			delete this._data[key];

			// Check if we can write in the local storage
			if (Flixel.FlxG.device.localStorage === true) {
				localStorage.removeItem(this.generateTag(key));
				localStorage.setItem(this.saveTag, JSON.stringify(Object.keys(this._data)));
			}
		}
	}
};

/**
 * Clear some information.
 * 
 * @param name
 *            The information name.
 */
LocalStorage.prototype.clear = function()
{
	var keys = JSON.parse(localStorage.getItem(this.saveTag)) || [];
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		this.remove(key);
	}
};

/**
 * Generate a localStorage Tag.
 * 
 * @param name
 *            The information name.
 */
LocalStorage.prototype.generateTag = function(key)
{
	var tag = this.saveTag;

	if (key !== undefined)
		tag += "." + key;

	return tag;
};