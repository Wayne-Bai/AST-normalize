Template.postsList.helpers({
  postsWithRank: function() {
    return this.posts.map(function(post, index, cursor) {
      post._rank = index;
      return post;
    });
  },
  activeRouteClass: function(/* route names */) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.pop();

    var active = _.any(args, function(name) {
      return Router.current() && Router.current().route.getName() === name
    });

    return active && 'active';
  },
  isAdminUser: function() {
    return Roles.userIsInRole(Meteor.user(), ['admin']);
  }
});
