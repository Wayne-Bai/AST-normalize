/**
 * A handy class use to manage the Android Like Shared Preferences.<br>
 * In Desktop it create simple text documents.<br>
 * <br>
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	ratalaika / ratalaikaGames
 */

/**
 * Class constructor.
 */
Flixel.plugin.store.FlxPreferences = function(name)
{
	this.preferences = new Flixel.plugin.store.FlxSave();
	this.preferences.bind(name);
};


/**
 * The reference to the Preferences object.
 */
Flixel.plugin.store.FlxPreferences.prototype.preferences = null;

/**
 * Static initializer.
 */
Flixel.plugin.store.FlxPreferences.initPreferences = function(name)
{
	name = (name === undefined) ? "FlixelPref" : name;
	return new Flixel.plugin.store.FlxPreferences(name);
};

/**
 * Get a boolean value from the preferences.
 * 
 * @param key
 *            The key of the boolean.
 * @param def
 *            The default value.
 * @return The boolean attached to the key, or the default value if it is not
 *         found.
 */
Flixel.plugin.store.FlxPreferences.prototype.getBoolean = function(key, def)
{
	return (this.preferences.data[key] === undefined) ? def : this.preferences.data[key];
};

/**
 * Get a integer value from the preferences.
 * 
 * @param key
 *            The key of the integer.
 * @param def
 *            The default value.
 * @return The integer attached to the key, or the default value if it is not
 *         found.
 */
Flixel.plugin.store.FlxPreferences.prototype.getInt= function(key, def)
{
	return (this.preferences.data[key] === undefined) ? def : this.preferences.data[key];
};

/**
 * Get a float value from the preferences.
 * 
 * @param key
 *            The key of the float.
 * @param def
 *            The default value.
 * @return The float attached to the key, or the default value if it is not
 *         found.
 */
Flixel.plugin.store.FlxPreferences.prototype.getFloat= function(key, def)
{
	return (isNaN(this.preferences.data[key]) || this.preferences.data[key] === undefined || this.preferences.data[key] === null) ? def : this.preferences.data[key];
};

/**
 * Get a string value from the preferences.
 * 
 * @param key
 *            The key of the string.
 * @param def
 *            The default value.
 * @return The string attached to the key, or the default value if it is not
 *         found.
 */
Flixel.plugin.store.FlxPreferences.prototype.getString= function(key, def)
{
	return (this.preferences.data[key] === undefined) ? def : this.preferences.data[key];
};

/**
 * Get a long value from the preferences.
 * 
 * @param key
 *            The key of the long.
 * @param def
 *            The default value.
 * @return The long attached to the key, or the default value if it is not
 *         found.
 */
Flixel.plugin.store.FlxPreferences.prototype.getLong= function(key, def)
{
	return (this.preferences.data[key] === undefined) ? def : this.preferences.data[key];
};

/**
 * Set a boolean value from the preferences.
 * 
 * @param key
 *            The key of the boolean.
 * @param value
 *            The boolean value.
 */
Flixel.plugin.store.FlxPreferences.prototype.setBoolean= function(key, value)
{
	this.preferences.data[key] = value;
	this.preferences.flush();
};

/**
 * Set a integer value from the preferences.
 * 
 * @param key
 *            The key of the integer.
 * @param value
 *            The integer value.
 */
Flixel.plugin.store.FlxPreferences.prototype.setInt= function(key, value)
{
	this.preferences.data[key] = value;
	this.preferences.flush();
};

/**
 * Set a float value from the preferences.
 * 
 * @param key
 *            The key of the float.
 * @param value
 *            The float value.
 */
Flixel.plugin.store.FlxPreferences.prototype.setFloat= function(key, value)
{
	this.preferences.data[key] = value;
	this.preferences.flush();
};

/**
 * Set a string value from the preferences.
 * 
 * @param key
 *            The key of the string.
 * @param value
 *            The string value.
 */
Flixel.plugin.store.FlxPreferences.prototype.setString= function(key, value)
{
	this.preferences.data[key] = value;
	this.preferences.flush();
};

/**
 * Set a long value from the preferences.
 * 
 * @param key
 *            The key of the long.
 * @param value
 *            The long value.
 */
Flixel.plugin.store.FlxPreferences.prototype.setLong= function(key, value)
{
	this.preferences.data[key] = value;
	this.preferences.flush();
};

/**
 * Remove the preference attached to the string
 * 
 * @param key
 *            The key of the preference.
 */
Flixel.plugin.store.FlxPreferences.prototype.removePreference = function(key)
{
	this.preferences.data[key] = null;
	this.preferences.flush();
};

/**
 * Clear all the preferences. THEY CAN'T BE RECOVERED!!! USE AT YOUR OWN RISK!!!
 */
Flixel.plugin.store.FlxPreferences.prototype.clearPreferences = function()
{
	this.preferences.erase();
	this.preferences.flush();
};