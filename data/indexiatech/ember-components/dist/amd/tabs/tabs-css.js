define(
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.Handlebars.compile(".em-tabs, .em-tab-list, .em-tab-panel {\n  display: block;\n}\n\n.em-tab-list {\n  border-bottom: 1px solid #eee;\n}\n\n.em-tab {\n  display: inline-block;\n  padding: 6px 12px;\n  border: 1px solid transparent;\n  border-top-left-radius: 3px;\n  border-top-right-radius: 3px;\n  cursor: pointer;\n  margin-bottom: -1px;\n  position: relative;\n}\n\n.em-tab[active=true] {\n  border-color: #eee;\n  border-bottom-color: #fff;\n}");
  });