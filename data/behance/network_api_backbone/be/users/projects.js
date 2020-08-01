Behance = Behance || {};
Behance.ProjectsCollection = {};

/**
 * Behance project collection.
 */
Behance.ProjectsCollection = Behance.Collection.extend({
  model : Backbone.Model,
  
  // Special params object for API pagination, etc., including defaults.
  params : {
    page: 1
  },
  
  url : function () {
    return Behance.api_url + 'users/' + this.user + '/projects?api_key=' + Behance.api_key + '&' + $.param(this.params);
  },
  
  /**
   * Get a specific project page.
   * @param {String} name Collection name to fetch results for.
   * @param {Number|String} page Page number.
   */
  getPage : function (page) {
    switch (page) {
      case 'next':
        page = this.params.page + 1;
        break;
        
      case 'prev':
        page = this.params.page < 1 ? 1 : this.params.page - 1;
        break;
        
      default:
        page = parseInt(page, 10);
    };
    
    this.params.page = page;
    this.fetch();
  },
  
  /**
   * See the current page number.
   */
  getCurrentPageNumber : function () {
    return this.params.page;
  },
  
  /**
   * The Behance API returns a 'projects' object. We want the contents of the object.
   * @param {Object} response The response from the server.
   */
  parse : function (response) {
    return response.projects;
  } // BehanceProjectsCollection#parse
  
});