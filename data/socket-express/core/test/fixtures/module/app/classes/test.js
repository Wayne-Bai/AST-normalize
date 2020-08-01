module.exports = {
  $static: {
    yes: function($super){
      return 'super-' + $super();
    }
  }
};