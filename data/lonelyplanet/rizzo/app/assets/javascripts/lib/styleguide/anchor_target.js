define([ "jquery" ], function($) {
  "use strict";

  var hash = location.hash.substring(1),
      $anchorTarget = $(".js-anchor-target");

  if (!$anchorTarget.length) return;

  if (hash.length) {
    $anchorTarget.val(hash);
  }

  $anchorTarget.on("input", function() {
    window.history.replaceState(null, null, "#" + this.value);
  });
});
