define([], function () {
    var _kendoApp;

    return {
        init: function (kendoApp) {
            _kendoApp = kendoApp;
        },

        parseQueryStringToObject: function () {
            var argsParsed = {},
                arg,
                kvp,
                hash = document.location.hash;

            if(!hash || hash.length == 0) {
                return argsParsed;
            }
            var args = document.location.hash.split('?');
            if(args.length < 2) {
                return argsParsed;
            }
            args = args[1].split('&');
            
            for (i=0; i < args.length; i++)
            {
                arg = decodeURIComponent(args[i]);
            
                if (arg.indexOf('=') == -1)
                {
                    argsParsed[arg.trim()] = true;
                }
                else
                {
                    kvp = arg.split('=');
                    var val = kvp[1].trim();
                    argsParsed[kvp[0].trim()] = isNaN(val) ? val : parseFloat(val);
                }
            }
            return argsParsed;
        },
        
        setViewTitle: function (view, title) {
            view.data("kendoMobileView").title = title;
            var navbar = view.find(".km-navbar").data("kendoMobileNavBar");
            if (navbar) {
                navbar.title(title);
            }
        },

        navigate: function (location) {
            _kendoApp.navigate(location);
        },

        redirect: function (location) {
            _kendoApp.pane.history.pop();
            _kendoApp.navigate(location);
        },

        scrollViewToTop: function (viewElement) {
            viewElement.data("kendoMobileView").scroller.reset();
        },
        
        showLoading: function (message) {
            $(".loading-message").text(message ? message : "Loading...");
            _kendoApp.showLoading();
        },
        
        hideLoading: function () {
            _kendoApp.hideLoading();
        },

        updateCartBadges: function ($, cart) {
            var numberInCart = cart.items.aggregates() && cart.items.aggregates().qty ? cart.items.aggregates().qty.sum : 0;
            var cartBadges = $(".cart-badge");
            cartBadges.text(numberInCart);
            if(numberInCart > 0) {
                cartBadges.show();
            } else {
                cartBadges.hide();
            }
        },

        showError: function (message, error) {
            var errorMessage = message + (error === undefined ? "" : "\n" + error.status + ": " + error.statusText);
            $("#error-view .message").text(errorMessage);
            $("#error-view").show().data().kendoMobileModalView.open();
        },

        closeError: function () {
            $("#error-view").data().kendoMobileModalView.close();
        },

        closeAllPopovers: function() {
            $(".km-popup").each(function (idx, item) {
                var popover = $(item).data().kendoMobilePopOver;
                if(popover) {
                    popover.close();
                }
            });
        }
    };
});