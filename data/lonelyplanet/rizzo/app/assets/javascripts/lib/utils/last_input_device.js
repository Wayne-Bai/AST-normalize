define(function() {

  "use strict";

  if (!document.addEventListener) return false;

  var listener = document.getElementById("js-row--content"),
      userDevices = {};

  function updateClass(deviceType) {
    var match = document.documentElement.className.match(/last-input-(\w+)/),
        oldClass = match && match[0],
        oldDeviceType = match && match[1];

    if (oldDeviceType == deviceType) return;

    if (match && oldClass) {
      document.documentElement.className = document.documentElement.className.replace(oldClass, "last-input-" + deviceType);
    } else {
      document.documentElement.className += " last-input-" + deviceType;
    }

    // if there's nobody listening, return
    // no need to announce the activation of a device more than once
    if (!listener || userDevices[deviceType]) return;

    // announce the presence of each device as it's used for the first time
    userDevices[deviceType] = true;
    listener.dispatchEvent(new CustomEvent(":device/" + deviceType));
  }

  document.addEventListener("mousemove", function() {
    updateClass("mouse");
  });

  document.addEventListener("touchmove", function() {
    updateClass("touch");
  });

  document.addEventListener("keyup", function() {
    updateClass("keyboard");
  });

  document.addEventListener("pointermove", function(event) {
    event.pointerType && updateClass(event.pointerType);
  });

});
