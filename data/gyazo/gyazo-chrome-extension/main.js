var host = 'https://upload.gyazo.com/api/upload/easy_auth';
var clientId = 'df9edab530e84b4c56f9fcfa209aff1131c7d358a91d85cc20b9229e515d67dd';
var UploadNotification = function(callback) {
  this.progress = 3;
  this.limitValues = [30, 80];
  this.limitLevel = 0;
  this.limit = this.limitValues[this.limitLevel];
  this.nextLimit = function() {
    if(this.limitLevel + 1 < this.limitValues.length) {
      this.limitLevel += 1;
    }
    this.limit = this.limitValues[this.limitLevel]
  };
  this.id = 'gyazo_notification_' + Date.now();
  this.newTabId = null;
  this.progressIncrement = function(callback) {
    const INCREMENT_SIZE = 5;
    this.progress = Math.min(this.progress + INCREMENT_SIZE, this.limit);
    this.update({progress: this.progress},callback);
  };
  this.update = function(opt, callback) {
    callback = callback || function(){};
    chrome.notifications.update(this.id, opt, callback);
  };
  this.finish = function(callback) {
    var self = this;
    this.update({
      title: chrome.i18n.getMessage('uploadingFinishTitle'),
      message: chrome.i18n.getMessage('uploadingFinishMessage'),
      progress: 100
    },function(){
      window.setTimeout(function() {
        chrome.notifications.clear(self.id, function(){});
      },1200);
    });
  };
  callback = callback || function(){};
  chrome.notifications.create(this.id, {
    type: 'progress',
    title: chrome.i18n.getMessage('uploadingTitle'),
    message: chrome.i18n.getMessage('uploadingMessage'),
    progress: this.progress,
    iconUrl: '/icons/gyazo-bg-256.png',
    priority: 2
  }, callback);
};

function postToGyazo(data) {
  var notification =  new UploadNotification();
  var timerId = window.setInterval(function() {
    notification.progressIncrement();
  },500);
  $.ajax({
    type: 'POST',
    url: host,
    data: {
      client_id: clientId,
      image_url: data.imageData,
      title: data.title,
      referer_url: data.url,
      width: data.width || '',
      height: data.height || '',
      scale: data.scale || ''
    },
    crossDomain: true
  })
    .done(function(data) {
      chrome.tabs.create({url:data.get_image_url, active:false}, function(newTab){
        notification.nextLimit();
        notification.newTabId = newTab.id;
        var handler = function (tabId, changeInfo) {
          if (newTab.id === tabId && changeInfo.url) {
            notification.finish();
            window.clearInterval(timerId);
            saveToClipboard(changeInfo.url);
            chrome.tabs.onUpdated.removeListener(handler);
            notification.newTabId = tabId;
          }
        };
        chrome.tabs.onUpdated.addListener(handler);
      });
    })
    .fail(function(XMLHttpRequest, textStatus, errorThrown) {
      window.alert('Status: ' + XMLHttpRequest.status + '\n Error: ' + textStatus + '\n Message: '+ errorThrown.message);
    });
}

function onClickHandler(info, tab) {

  var GyazoFuncs = {gyazoIt: function() {
    var xhr = jQuery.ajaxSettings.xhr();
    xhr.open('GET', info.srcUrl, true);
    xhr.responseType = 'blob';
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4){
        var blob = xhr.response;
        var fileReader = new FileReader();
        fileReader.onload = function(e) {
          postToGyazo({
            imageData: fileReader.result,
            title: tab.title,
            url: tab.url
          });
        };
        fileReader.readAsDataURL(blob);
      }
    };
    xhr.send();
  },
  gyazoCapture: function() {
    chrome.tabs.sendMessage(tab.id, {action: 'gyazoCapture'}, function(mes){});
  },
  gyazoWhole: function(){
    var notificationId = 'gyazoCapturing_' + Date.now();
    chrome.notifications.create(notificationId, {
      type: 'basic',
      title: chrome.i18n.getMessage('captureTitle'),
      message: chrome.i18n.getMessage('captureMessage'),
      iconUrl: '/icons/gyazo-bg-256.png',
      priority: 2
    }, function(){});
    chrome.tabs.sendMessage(tab.id, {
      action: 'wholeCaptureInit',
      context: {
        tabId: tab.id,
        winId: tab.windowId,
        notificationId: notificationId
      },
      data: {}
    },function(){})
  }
};
if(info.menuItemId in GyazoFuncs) {
  GyazoFuncs[info.menuItemId]();
}
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    title: chrome.i18n.getMessage("contextMenuImage"),
    id: 'gyazoIt',
    contexts: ['image']
  });
  chrome.contextMenus.create({
    title: chrome.i18n.getMessage("contextMenuSelect"),
    id: 'gyazoCapture',
    contexts: ['all']
  });
  chrome.contextMenus.create({
    'title': chrome.i18n.getMessage("contextMenuWhole"),
    'id': 'gyazoWhole',
    contexts: ['all']
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var messageHandlers = {
    gyazoWholeCaptureFromPopup: function() {
      onClickHandler({menuItemId: 'gyazoWhole'}, request.tab);
    },
    gyazoCaptureSize: function(){
      chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(data) {
        var d = request.data;
        canvasUtils.trimImage({
          imageData: data,
          scale: d.s,
          zoom: d.z,
          startX: d.x,
          startY: d.y,
          width: d.w,
          height: d.h,
          callback: function(canvas) {
            postToGyazo({
              imageData: canvas.toDataURL('image/png'),
              width: d.w,
              height: d.h,
              title: d.t,
              url: d.u,
              scale: d.s
            });
          }
        });
      });
    },
    wholeCaptureManager: function() {
      if(request.data.scrollPositionY + request.data.windowInnerHeight < request.data.height) {
        chrome.tabs.captureVisibleTab(request.context.winId, {format: 'png'}, function(data) {
          var canvas = request.canvasData || document.createElement('canvas');
          canvasUtils.appendImageToCanvas({
            canvasData: canvas,
            imageSrc: data,
            pageHeight: request.data.height,
            imageHeight: request.data.captureButtom - request.data.captureTop,
            width: request.data.width,
            top: request.data.captureTop,
            scale: request.data.scale,
            zoom: request.data.zoom,
            callback: function(canvas) {
              chrome.tabs.sendMessage(request.context.tabId, {
                action: 'scrollNextPage',
                canvasData: canvas.toDataURL('image/png'),
                data: request.data,
                context: request.context
              });
            }
          });
        });
      }else{
        chrome.tabs.captureVisibleTab(request.context.winId, {format: 'png'}, function(data){
          var sh = request.data.height - request.data.scrollPositionY;
          var sy = request.data.windowInnerHeight - sh;
          canvasUtils.trimImage({
            imageData: data,
            startX: 0,
            startY: sy,
            width: request.data.width,
            height: sh,
            scale: request.data.scale,
            zoom: request.data.zoom,
            callback: function(canvas) {
            canvasUtils.appendImageToCanvas({
              canvasData: request.canvasData || document.createElement('canvas'),
              imageSrc: canvas.toDataURL('image/png'),
              pageHeight: request.data.height,
              imageHeight: request.data.windowInnerHeight,
              width: request.data.width,
              top: request.data.captureTop,
              scale: request.data.scale,
              zoom: request.data.zoom,
              callback: function(canvas){
                chrome.notifications.clear(request.context.notificationId,function(){});
                postToGyazo({
                  imageData: canvas.toDataURL('image/png'),
                  title: request.data.title,
                  url: request.data.url,
                  width: request.data.width,
                  height: request.data.height,
                  scale: request.data.scale
                });
                chrome.tabs.sendMessage(request.context.tabId, {
                  action: 'wholeCaptureFinish',
                  context: request.context
                })
              }
            });
          }});
        });
      }
    }
  }
  if(request.action in messageHandlers){
    messageHandlers[request.action]();
  }
})

function tabUpdateListener(tabId, changeInfo, tab) {
  saveToClipboard(changeInfo.url);
}
