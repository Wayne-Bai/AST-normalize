define(["jQuery", "utils", "cart"], function ($, utils, cart) {
    return {
        show: function (showEvt) {
            utils.updateCartBadges($, cart);
        }
    };
});