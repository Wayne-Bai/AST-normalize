Meteor.Router.add({
    '/pages/notFound': { as: 'notFound', to: function() {
        $("body").addClass('error');
        Session.set('pageTitle','Page Not Found');
        Session.set('error',true);
        return 'notFound';
    }},
    '/pages/opportunityView': { as: 'opportunityView', to: function() {
        Session.set('pageTitle','Opportunity View');
        return 'opportunityView';
    }},
    '/pages/userProfile': { as: 'userProfile', to: function() {
        Session.set('pageTitle','User Profile');
        return 'userProfile';
    }},
    '/pages/login': { as: 'login', to: function() {
        $("body").addClass('login');
        Session.set('pageTitle','Login');
        Session.set('login', true);
        return 'login';
    }}
});

Template.pagesNav.isActive = function () {
    switch (Meteor.Router.page()) {
        case 'notFound':
            return 'active';
        case 'opportunityView':
            return 'active';
        case 'opportunityView':
            return 'active';
        default:
            return;
    }
}