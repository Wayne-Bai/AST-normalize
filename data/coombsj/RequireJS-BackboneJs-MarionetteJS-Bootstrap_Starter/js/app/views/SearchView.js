define(['marionette', 'tpl!app/views/templates/SearchView.html'],
    function (Marionette, template) {
        "use strict";

        return Marionette.ItemView.extend({
            template: template()
        });

    });