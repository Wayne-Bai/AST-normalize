chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
  console.group(message.url);

  message.logs.forEach(function(log) {
    console[log.level].apply(console, log.data);
  });

  console.groupEnd();
});
