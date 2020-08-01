(function(){
    var tabs = [];

    var filter = function(req){
        if (!tabs[req.tabId]) {
            return {};
        }

        console.log('Blocking! ' + req.url);
        return {cancel: true};
    };

    chrome.experimental.webRequest.onBeforeRequest.addListener(
        filter,
        {urls: ['https://plusone.google.com/*']},
        ['blocking']
    );

    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
        if (changeInfo.url) {
            console.log('changeInfo.url! ' + changeInfo.url);

            if (-1 == changeInfo.url.indexOf('http://www.google.com/reader/') &&
                -1 == changeInfo.url.indexOf('https://www.google.com/reader/')) {
                tabs[tabId] = 0;
            } else {
                tabs[tabId] = 1;
            }
        }
    });
})();
