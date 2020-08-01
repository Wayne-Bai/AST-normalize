(function (window, $, undefined) {
"use strict";

$('#damuro-goes-here').damuro({
    background: '../images/crane_squared_by_mudimba_and_draweverywhere.png',
    splashText: 'Click dat thang to get phat wit dA muro',
    splashCss: {
        color: '#33a'
        },
    autoload: false
    })
    .one('click', function () { $(this).damuro().open(); })
    .damuro()
    .done(function (data) {
            if (data.image && !/\'/.test(data.image)) {
                $('body').css('backgroundImage', "url('" + data.image + "')");
            }
            $(this).hide().damuro().remove();
        })
    .fail(function (data) {
            $(this).hide().damuro().remove();
            if (data.error) {
                $('body').append('<p>All aboard the fail whale: ' + data.error + '.</p>');
            } else {
                $('body').append("<p>Be that way then, don't edit anything.</p>");
            }
        });

})(window, jQuery);
