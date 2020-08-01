var MovieAppModel = Backbone.Model.extend({
    initialize : function(collection) {
        // init and store our MovieCollection in our app object
        this.movies = new MovieCollection();
        for(var i in collection) {
            if(collection.propertyIsEnumerable(i) && collection.hasOwnProperty(i)) {
               this.movies.add(collection[i]);                
            }
        }
        //this.movies.add(movs);
    }
});
