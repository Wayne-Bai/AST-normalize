module("test for attribute accessor function of selector results");

is = strictEqual;
isnt = notStrictEqual;

test("r.fn.attr with one element", function() {
  var list = r("#list0");
  is( list.attr("name"), "list", "name of list is list");

  list.attr("name", "new");
  is( list.attr("name"), "new", "name of list updated");

  list.attr( { "name": "ry", "value": "v" } );
  is( list.attr("name"), "ry", "name of list updated");
  is( list.attr("value"), "v", "name of list updated");
});

test("r.fn.css with one element", function() {
  var list = r("#list2");
  is( list.css("visibility"), "visible", "visibility is visible at first");

  list.css("visibility", "hidden");
  is( list.css("visibility"), "hidden", "visibility changed as hidden");
  list.css("visibility", null);
  is( list.css("visibility"), "visible", "visibility changed to default value");

  list.css( { "visibility": "visible", "color": "#ffffff" } );
  is( list.css("visibility"), "visible", "visibility get back to visible");
  is( list.css("color"), "rgb(255, 255, 255)", "color updated as #ffffff");

  list.css( { "visibility": null, "color": null } );
  is( list.css("visibility"), "visible", "visibility changed to default value");
  is( list.css("color"), "rgb(0, 0, 0)", "color back to #000000");
});


test("r.fn.attr (remove) with string", function() {
  var anchors = r("#list4 li a");
  anchors.each(function(wrapped) {
    is( wrapped.attr("href"), "foo.html", "anchors have href attribute" );
  });

  anchors.attr("href", null);

  anchors.each(function(wrapped) {
    is( wrapped.attr("href"), null, "anchors have href attribute" );
  });
  anchors.each(function(wrapped) {
    isnt( wrapped.attr("onclick"), null, "anchors did not lose onclick attribute" );
  });
});

test("r.fn.attr (remove) with Array.<string>", function() {
  var anchors = r("#list5 li a");
  anchors.each(function(wrapped) {
    is( wrapped.attr("href"), "foo.html", "anchors have href attribute" );
  });

  anchors.attr( { "href": null,  "onclick": null } );

  anchors.each(function(wrapped) {
    is( wrapped.attr("href"), null, "anchors lost href attribute" );
  });
  anchors.each(function(wrapped) {
    is( wrapped.attr("onclick"), null, "anchors lost onclick attribute" );
  });
});
