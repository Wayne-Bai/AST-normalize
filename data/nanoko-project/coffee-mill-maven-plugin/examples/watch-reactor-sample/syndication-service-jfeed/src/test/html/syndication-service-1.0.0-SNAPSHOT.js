
/*
# Scope.
*/


(function() {
  var scope;

  scope = typeof global !== "undefined" && global !== null ? global : this;

  scope.SyndicationService = typeof SyndicationService !== "undefined" && SyndicationService !== null ? SyndicationService : {};

}).call(this);
;

/*
# Represent a Feed Entry.
# Implementations may extend / overide it.
*/


(function() {
  var FeedEntry;

  scope.SyndicationService.FeedEntry = FeedEntry = (function() {

    function FeedEntry() {}

    FeedEntry.prototype._title = null;

    FeedEntry.prototype._url = null;

    FeedEntry.prototype._author = null;

    FeedEntry.prototype._pubDate = null;

    FeedEntry.prototype._content = null;

    FeedEntry.prototype._categories = [];

    /*
        # Returns the entry title.
    */


    FeedEntry.prototype.getTitle = function() {
      return this._title;
    };

    /*
        # Sets the feed entry title. ```null``` if not set.
    */


    FeedEntry.prototype.setTitle = function(title) {
      this._title = title;
      return this;
    };

    /*
        # Returns the entry url if set.
    */


    FeedEntry.prototype.getUrl = function() {
      return this._url;
    };

    /*
        # Sets the feed entry url.
    */


    FeedEntry.prototype.setUrl = function(url) {
      this._url = url;
      return this;
    };

    /*
        # Returns the entry author if set.
    */


    FeedEntry.prototype.getAuthor = function() {
      return this._author;
    };

    /*
        # Sets the feed entry author.
    */


    FeedEntry.prototype.setAuthor = function(author) {
      this._author = author;
      return this;
    };

    /*
        # Returns the entry publication date if set.
        # This method returns a ```Date``` object.
    */


    FeedEntry.prototype.getPublicationDate = function() {
      return this._pubDate;
    };

    /*
        # Sets the feed entry publication date.
    */


    FeedEntry.prototype.setPublicationDate = function(pubDate) {
      this._pubDate = pubDate;
      return this;
    };

    /*
        # Returns the entry content if set.
    */


    FeedEntry.prototype.getContent = function() {
      return this._content;
    };

    /*
        # Sets the feed entry content.
    */


    FeedEntry.prototype.setContent = function(content) {
      this._content = content;
      return this;
    };

    /*
        # Returns the list of categories / tag attached to the current feed entry.
        # IF no categories, an empty array is returned.
    */


    FeedEntry.prototype.getCategories = function() {
      return this._categories;
    };

    /*
        # Adds a category to the feed entry.
    */


    FeedEntry.prototype.addCategory = function(cat) {
      this._categories.push(cat);
      return this;
    };

    /*
        # Sets the categories of the current feed entry.
        # ```categories``` must be an array.
    */


    FeedEntry.prototype.setCategories = function(categories) {
      this._categories = categories != null ? categories : [];
      return this;
    };

    return FeedEntry;

  })();

}).call(this);
;

/*
# Feed Reader contract.
*/


(function() {
  var FeedReader;

  scope.SyndicationService.FeedReader = FeedReader = (function() {

    function FeedReader() {}

    /*
        # Returns the feed title.
    */


    FeedReader.prototype.getTitle = function() {};

    /*
        # Returns the feed url.
    */


    FeedReader.prototype.getUrl = function() {};

    /*
        # Gets all entries.
        # Returns the feed entries of the feed or an empty list if the feed has no entry.
    */


    FeedReader.prototype.getEntries = function() {};

    /*
        # Gets recent entries.
        # The number of entries returned by this method depends on the implementation. It may be configurable.
        # Returns the recent entries of the feed or an empty list if the feed has no entry.
    */


    FeedReader.prototype.getRecentEntries = function() {};

    /*
        # Gets the last entry, ```null``` if the feed has no entry.
    */


    FeedReader.prototype.getLastEntry = function() {};

    return FeedReader;

  })();

}).call(this);
;
