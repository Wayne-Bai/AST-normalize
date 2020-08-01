
/**
 Port of the functionality from Rails Active Support Inflection classes 
 into Javascript. Based on inflection-js by Ryan Schuft.
 
 Version: 0.0.2
 
 References:
 
    https://github.com/protos/inflection/
    http://code.google.com/p/inflection-js/
    http://en.wikipedia.org/wiki/English_plural
  
 */

function Inflect() {

}

// List of nouns that use the same form for both singular and plural.
// All items should remain entirely in lower case to correctly match Strings.
Inflect.prototype._uncountable_words = ['equipment', 'information', 'rice', 'money', 'species', 'series', 'fish', 
'sheep', 'moose', 'deer', 'news'];

// Rules to translate from the singular form of a noun to its plural form.
Inflect.prototype._plural_rules = [
  [new RegExp('(m)an$', 'gi'), '$1en'],
  [new RegExp('(pe)rson$', 'gi'), '$1ople'],
  [new RegExp('(child)$', 'gi'), '$1ren'],
  [new RegExp('^(ox)$', 'gi'), '$1en'],
  [new RegExp('(ax|test)is$', 'gi'), '$1es'],
  [new RegExp('(octop|vir)us$', 'gi'), '$1i'],
  [new RegExp('(alias|status)$', 'gi'), '$1es'],
  [new RegExp('(bu)s$', 'gi'), '$1ses'],
  [new RegExp('(buffal|tomat|potat)o$', 'gi'), '$1oes'],
  [new RegExp('([ti])um$', 'gi'), '$1a'],
  [new RegExp('sis$', 'gi'), 'ses'],
  [new RegExp('(?:([^f])fe|([lr])f)$', 'gi'), '$1$2ves'],
  [new RegExp('(hive)$', 'gi'), '$1s'],
  [new RegExp('([^aeiouy]|qu)y$', 'gi'), '$1ies'],
  [new RegExp('(x|ch|ss|sh)$', 'gi'), '$1es'],
  [new RegExp('(matr|vert|ind)ix|ex$', 'gi'), '$1ices'],
  [new RegExp('([m|l])ouse$', 'gi'), '$1ice'],
  [new RegExp('(quiz)$', 'gi'), '$1zes'],
  [new RegExp('s$', 'gi'), 's'],
  [new RegExp('$', 'gi'), 's']
];

// Rules to translate from the plural form of a noun to its singular form.
Inflect.prototype._singular_rules = [
  [new RegExp('(m)en$', 'gi'), '$1an'],
  [new RegExp('(pe)ople$', 'gi'), '$1rson'],
  [new RegExp('(child)ren$', 'gi'), '$1'],
  [new RegExp('([ti])a$', 'gi'), '$1um'],
  [new RegExp('((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$', 'gi'), '$1$2sis'],
  [new RegExp('(hive)s$', 'gi'), '$1'],
  [new RegExp('(tive)s$', 'gi'), '$1'],
  [new RegExp('(curve)s$', 'gi'), '$1'],
  [new RegExp('([lr])ves$', 'gi'), '$1f'],
  [new RegExp('([^fo])ves$', 'gi'), '$1fe'],
  [new RegExp('([^aeiouy]|qu)ies$', 'gi'), '$1y'],
  [new RegExp('(s)eries$', 'gi'), '$1eries'],
  [new RegExp('(m)ovies$', 'gi'), '$1ovie'],
  [new RegExp('(x|ch|ss|sh)es$', 'gi'), '$1'],
  [new RegExp('([m|l])ice$', 'gi'), '$1ouse'],
  [new RegExp('(bus)es$', 'gi'), '$1'],
  [new RegExp('(o)es$', 'gi'), '$1'],
  [new RegExp('(shoe)s$', 'gi'), '$1'],
  [new RegExp('(cris|ax|test)es$', 'gi'), '$1is'],
  [new RegExp('(octop|vir)i$', 'gi'), '$1us'],
  [new RegExp('(alias|status)es$', 'gi'), '$1'],
  [new RegExp('^(ox)en', 'gi'), '$1'],
  [new RegExp('(vert|ind)ices$', 'gi'), '$1ex'],
  [new RegExp('(matr)ices$', 'gi'), '$1ix'],
  [new RegExp('(quiz)zes$', 'gi'), '$1'],
  [new RegExp('s$', 'gi'), '']
];

// List of words that should not be capitalized for title case
Inflect.prototype._non_titlecased_words = ['and', 'or', 'nor', 'a', 'an', 'the', 'so', 'but', 'to', 'of', 'at', 'by', 
'from', 'into', 'on', 'onto', 'off', 'out', 'in', 'over', 'with', 'for'];

// Regular Expressions used for converting between String formats
Inflect.prototype.id_suffix = new RegExp('(_ids|_id)$', 'g');
Inflect.prototype.underbar = new RegExp('_', 'g');
Inflect.prototype.space_or_underbar = new RegExp('[ _]', 'g');
Inflect.prototype.uppercase = new RegExp('([A-Z])', 'g');
Inflect.prototype.underbar_prefix = new RegExp('^_');

/**
  Renders a singular English language noun into its plural form
  
  @param {string} str
  @param {string} override
  @return {string}
  @public
 */

Inflect.prototype.pluralize = function (str, override) {
  return this.apply_rules(
  str, this._plural_rules, this._uncountable_words, override);
}

/**
  Renders a plural english noun into its singular form
  
  @param {string} str
  @param {string} override
  @return {string}
  @public
 */

Inflect.prototype.singularize = function (str, override) {
  return this.apply_rules(
  str, this._singular_rules, this._uncountable_words, override);
}

/**
  Renders a lower case underscored word into camel case
  
  @param {string} str
  @param {boolean} lowFirstLetter
  @return {string}
  @public
 */

var dashRegex = /(-)+/g;

Inflect.prototype.camelize = function (str, lowFirstLetter) {
  str = str.toLowerCase().replace(dashRegex, '_');
  var str_path = str.toLowerCase().split('/');
  for (var i = 0; i < str_path.length; i++) {
    var str_arr = str_path[i].split('_');
    var initX = ((lowFirstLetter && i + 1 === str_path.length) ? (1) : (0));
    for (var x = initX; x < str_arr.length; x++) {
      str_arr[x] = str_arr[x].charAt(0).toUpperCase() + str_arr[x].substring(1);
    }
    str_path[i] = str_arr.join('');
  }
  str = str_path.join('::');
  return str;
}

/**
  Renders a camel cased word into words separated by underscores
  
  @param {string} str
  @return {string}
  @public
 */

Inflect.prototype.underscore = function (str) {
  var str_path = str.split('::');
  for (var i = 0; i < str_path.length; i++) {
    str_path[i] = str_path[i].replace(this.uppercase, '_$1');
    str_path[i] = str_path[i].replace(this.underbar_prefix, '');
  }
  str = str_path.join('/').toLowerCase();
  return str;
}

/**
  Renders a lower case and underscored word into human readable form
  
  @param {string} str
  @param {boolean} lowFirstLetter
  @return {string}
  @public
 */

Inflect.prototype.humanize = function (str, lowFirstLetter) {
  str = str.toLowerCase().replace(this.id_suffix, '').replace(this.underbar, ' ');
  if (!lowFirstLetter) str = this.capitalize(str);
  return str;
}

/**
  Renders all characters to lower case and then makes the first upper
  
  @param {string} str
  @return {string}
  @public
 */

Inflect.prototype.capitalize = function (str) {
  str = str.toLowerCase().substring(0, 1).toUpperCase() + str.substring(1);
  return str;
}

/**
  Renders all underscores and spaces as dashes
  
  @param {string} str
  @return {string}
  @public
 */

Inflect.prototype.dasherize = function (str) {
  str = str.replace(this.space_or_underbar, '-');
  return str;
}

/**
  Renders words into title casing
  
  @param {string} str
  @return {string}
  @public
 */

Inflect.prototype.titleize = function (str) {
  str = str.toLowerCase().replace(this.underbar, ' ');
  var str_arr = str.split(' ');
  for (var x = 0; x < str_arr.length; x++) {
    var d = str_arr[x].split('-');
    for (var i = 0; i < d.length; i++) {
      if (this._non_titlecased_words.indexOf(d[i].toLowerCase()) < 0) {
        d[i] = this.capitalize(d[i]);
      }
    }
    str_arr[x] = d.join('-');
  }
  str = str_arr.join(' ');
  str = str.substring(0, 1).toUpperCase() + str.substring(1);
  return str;
}

/**
  Renders class names that are prepended by modules into just the class
  
  @param {string} str
  @return {string}
  @public
 */

Inflect.prototype.demodulize = function (str) {
  var str_arr = str.split('::');
  str = str_arr[str_arr.length - 1];
  return str;
}

/**
  Renders camel cased singular words into their underscored plural form
  
  @param {string} str
  @return {string}
  @public
 */

Inflect.prototype.tableize = function (str) {
  str = this.pluralize(this.underscore(str));
  return str;
}

/**
  Renders an underscored plural word into its camel cased singular form
  
  @param {string} str
  @return {string}
  @public
 */

Inflect.prototype.classify = function (str) {
  str = this.singularize(this.camelize(str));
  return str;
}

/**
  Renders a class name (camel cased singular noun) into a foreign key
  
  @param {string} str
  @param {boolean} dropIdUbar
  @return {string}
  @public
 */

Inflect.prototype.foreign_key = function (str, dropIdUbar) {
  str = this.underscore(this.demodulize(str)) + ((dropIdUbar) ? ('') : ('_')) + 'id';
  return str;
}

/**
  Renders a number into its sequence
  
  @param {string} str
  @return {string}
  @public
 */

Inflect.prototype.ordinalize = function (str) {
  var num = parseInt(str, 10);
  if (11 <= num % 100 && num % 100 <= 13) {
      return str + 'th';
  } else {
      switch (num % 10) {
          case  1: return str + 'st';
          case  2: return str + 'nd';
          case  3: return str + 'rd';
          default: return str + 'th';
      }
  }
}

/**
  Helper method that applies rules based replacement to a String

  @param {string} str
  @param {array} rules
  @param {array} skip
  @param {string} override
  @return {string}
  @private
  */

Inflect.prototype.apply_rules = function (str, rules, skip, override) {
  if (override) {
    str = override;
  } else {
    var ignore = (skip.indexOf(str.toLowerCase()) > -1);
    if (!ignore) {
      for (var x = 0; x < rules.length; x++) {
        if (str.match(rules[x][0])) {
          str = str.replace(rules[x][0], rules[x][1]);
          break;
        }
      }
    }
  }
  return str;
}

var instance = new Inflect();

// Move prototype methods into instance
var key, method;
for (var key in instance) {
  method = instance[key];
  if (method instanceof Function) instance[key] = method;
}

module.exports = instance;
