var nodejs_header_pattern = /^X-Nodejs-(\w+)-(\d+)$/;

chrome.devtools.network.onRequestFinished.addListener(function(har) {
  var logs = [];

  har.response.headers.forEach(function(header) {
    var matches = header.name.match(nodejs_header_pattern);
    if (!matches) return;

    var level = matches[1].toLowerCase();
    var index = matches[2];
    var data = JSON.parse(header.value);

    logs[index] = {level: level, data: data};
  });

  chrome.extension.sendMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    url: har.request.url,
    logs: logs
  });
});
