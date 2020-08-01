Template.componentsUIElements.rendered = function () {
    // Notifications
    $(".notify").click(function () {
        var $el = $(this);
        var title = $el.attr('data-notify-title'),
            message = $el.attr('data-notify-message'),
            time = $el.attr('data-notify-time'),
            sticky = $el.attr('data-notify-sticky'),
            overlay = $el.attr('data-notify-overlay');

        $.gritter.add({
            title: (typeof title !== 'undefined') ? title : 'Message - Head',
            text: (typeof message !== 'undefined') ? message : 'Body',
            image: (typeof image !== 'undefined') ? image : null,
            sticky: (typeof sticky !== 'undefined') ? sticky : false,
            time: (typeof time !== 'undefined') ? time : 3000
        });
    });
};
