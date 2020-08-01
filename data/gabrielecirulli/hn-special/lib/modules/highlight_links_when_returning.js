HNSpecial.settings.registerModule("highlight_links_when_returning", function () {
  // Add a flash class to titles when clicked
  function addFlash() {
    if (_.isCommentPage()) return;

    _.toArray(document.getElementsByTagName("a")).forEach(function (link) {
      var parent = link.parentElement.parentElement;
      if (_.isTitleLink(link) && !link.getAttribute("data-hnspecial-flash-effect")) {
        link.setAttribute("data-hnspecial-flash-effect", "true");
        link.addEventListener("click", function (e) {
          parent.classList.remove("hnspecial-theme-link-flash");
          parent.classList.add("hnspecial-theme-link-pre-flash");
        });
      }
    });
  }

  addFlash();

  // Subscribe to the addition of new links by infinite scrolling
  HNSpecial.settings.subscribe("new links", addFlash);

  // Flash the links when the window is focused
  document.addEventListener("webkitvisibilitychange", function (e) {
    if (!this.webkitHidden) {
      _.toArray(document.getElementsByClassName("hnspecial-theme-link-pre-flash")).forEach(function (link) {
        link.classList.remove("hnspecial-theme-link-pre-flash");
        link.classList.add("hnspecial-theme-link-flash");
      });
    }
  });
});

