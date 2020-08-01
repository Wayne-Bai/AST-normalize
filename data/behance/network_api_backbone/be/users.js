Behance = Behance || {};

Behance.UserModel = Behance.Model.extend({
  /**
   * Set the API endpoint for users.
   */
  url : function () {
    return Behance.api_url + 'users/' + this.get('user') + '?api_key=' + Behance.api_key;
  },
  
  /**
   * The Behance API returns a 'user' object. We want the contents of the object.
   * @param {Object} response The response from the server.
   */
  parse : function (response) {
    return response.user;
  },
  
  /**
   * Get this user's projects.
   * Using this method requires the BehanceProjectsCollection base collection.
   * @returns {Object} The BehanceUserModel object.
   */
  getProjects : function() {
    
    var projects = new Behance.ProjectsCollection();
    projects.user = this.get('user');
    projects.fetch();
    this.set('projects', projects);
    
    return this;
    
  }, // getProjects
  
  /**
   * Get this user's WIPs.
   * Using this method requires the BehanceWipsCollection base collection.
   */
  getWips : function() {
    var wips = new Behance.WipsCollection();
    wips.user = this.get('user');
    wips.fetch();
    this.set('wips', wips);
  }, // getWips
  
  /**
   * Get this user's collections.
   * Using this method requires the BehanceCollectionsCollection base collection.
   * @returns {Object} The BehanceUserModel object.
   */
  getCollections : function() {
    
    var collections = new Behance.CollectionsCollection();
    collections.user = this.get('user');
    collections.fetch();
    this.set('collections', collections);
    
    return this;
    
  }, // getCollections
  
  /**
   * Get a specific project page.
   * @param {String} name Collection name to fetch results for.
   * @param {Number|String} page Page number.
   */
  getPage : function (name, page) {
    
    var collection;
    
    // Error out early.
    if ( !this.has(name) && console ) {
      console.error('Behance.UserModel: Make sure you\'ve populated the ' + name + ' collection before using the paging methods. See: ' + Behance.docs_link + ' for more information.');
      return false;
    }
    
    collection = this.get(name);
    collection.getPage(page);
  },
  
  /**
   * Get the next page of projects.
   */
  getNextProjectsPage : function () {
    this.getPage('projects', 'next');
    return this;
  },
  
  /**
   * Get the previous page of projects.
   */
  getPreviousProjectsPage : function () {
    this.getPage('projects', 'prev');
    return this;
  }
  
});