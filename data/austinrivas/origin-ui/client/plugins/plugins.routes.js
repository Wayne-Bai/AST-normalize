Meteor.Router.add({
    '/plugins/charts': {as: 'pluginsCharts', to: function () {
        Session.set('pageTitle','Charts');
        return 'pluginsCharts';
    }},
    '/plugins/calendar': {as: 'pluginsCalendar', to: function () {
        Session.set('pageTitle', 'Calendar');
        return 'pluginsCalendar';
    }},
    '/plugins/maps': {as: 'pluginsMaps', to: function () {
        Session.set('pageTitle', 'Maps');
        return 'pluginsMaps';
    }}
});


Template.pluginsNav.isActive = function () {
    switch (Meteor.Router.page()) {
        case 'pluginsCharts':
            return 'active';
        case 'pluginsCalendar':
            return 'active';
        case 'pluginsMaps':
            return 'active';
        default:
            return;
    }
}