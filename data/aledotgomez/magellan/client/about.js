Template.about.helpers({
  activeRouteClass: function( /* route names */ ) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.pop();

    var active = _.any(args, function(name) {
      return Router.current() && Router.current().route.getName() === name
    });

    return active && 'active';
  }
});

// Template.about.events({
//   'submit form': function(e) {
//     e.preventDefault();
//     var email = {
//       tow: $(e.target).find('[name=name]').val(),
//       email: $(e.target).find('[name=email]').val(),
//       message: $(e.target).find('[name=message]').val()
//     };
//
//     Meteor.call('email');
//     alert('email sent!');
//     Router.go('/');
//   }
// });
