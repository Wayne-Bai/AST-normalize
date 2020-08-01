/*
 * 
 * Yodel - an unofficial Yik Yak client for Windows Phone
 * (c) 2014-2015 soren121 and contributors.
 *
 * pages/donate/donate.js
 * 
 * Licensed under the terms of the MIT license.
 * See LICENSE.txt for more information.
 * 
 * http://github.com/soren121/yodel
 * 
 */

(function () {
    "use strict";

    //var lang = WinJS.Resources;
    //var appData = Windows.Storage.ApplicationData.current;
    var appbar = document.getElementById("appbar").winControl;

    // Uncomment for production environment
    //currentApp = Windows.ApplicationModel.Store.CurrentApp;

    // Uncomment for development environment
    var currentApp = Windows.ApplicationModel.Store.CurrentAppSimulator;

    var licenseInformation;

    function buyItem(event) {
        var productId = this.productId;
        if (!licenseInformation.productLicenses.lookup(productId).isActive) {
            currentApp.requestProductPurchaseAsync(productId).then(
                function () {
                    if (licenseInformation.productLicenses.lookup(productId).isActive) {
                        event.target.disabled = true;
                        event.target.innerText = "already paid!";
                    }
                },
                function () {
                    // The in-app purchase was not completed because there was an error.
                });
        }
        else {
            // The customer already owns this feature.
        }
    }

    WinJS.UI.Pages.define("/pages/donate/donate.html", {
        init: function () {
            Yodel.UI.permitAppbar(false);
        },
        processed: function (element) {
            return WinJS.Resources.processAll(element);
        },
        ready: function (element, args) {
            appbar.disabled = true;

            var storeProxy = new Windows.Foundation.Uri("ms-appx:///WindowsStoreProxy.xml");
            Windows.Storage.StorageFile.getFileFromApplicationUriAsync(storeProxy).then(function (file) {
                return currentApp.reloadSimulatorAsync(file);
            }).then(function () {
                licenseInformation = currentApp.licenseInformation;
                return currentApp.loadListingInformationByProductIdsAsync([
                    "1-silverDonation",
                    "2-goldDonation",
                    "3-platinumDonation"
                ]);
            }).then(function (listingInformation) {
                var productListings = listingInformation.productListings;

                console.log(productListings);
                console.log(licenseInformation);

                var donationContainer = element.querySelector("#donationOptions");
                WinJS.Utilities.empty(donationContainer);

                var productListingKeys = Object.keys(productListings);
                productListingKeys.sort();

                for (var listing in productListingKeys) {
                    if (productListingKeys.hasOwnProperty(listing)) {
                        var product = productListings[productListingKeys[listing]];
                        var menuItem = document.createElement("li");

                        var menuItemImage = new Image();
                        menuItemImage.src = product.imageUri;
                        menuItem.appendChild(menuItemImage);

                        var menuItemDetails = document.createElement("div");

                        var menuItemTitle = document.createElement("h5");
                        var menuItemTitleText = document.createTextNode(product.name);
                        menuItemTitle.appendChild(menuItemTitleText);
                        menuItemDetails.appendChild(menuItemTitle);

                        var menuItemButton = document.createElement("button");
                        var menuItemButtonText;
                        if (!licenseInformation.productLicenses[productListingKeys[listing]].isActive) {
                            menuItemButtonText = document.createTextNode(product.formattedPrice.substr(0, 5));
                            menuItemButton.addEventListener("click", buyItem.bind({ productId: product.productId }));
                        }
                        else {
                            menuItemButtonText = document.createTextNode("already paid!");
                            menuItemButton.disabled = true;
                        }
                        menuItemButton.appendChild(menuItemButtonText);
                        menuItemDetails.appendChild(menuItemButton);

                        menuItem.appendChild(menuItemDetails);
                        donationContainer.appendChild(menuItem);
                    }
                }
            });
        }
    });

})();
