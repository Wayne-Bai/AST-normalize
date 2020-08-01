module("test for others");

is = strictEqual;

function emit(el, eventName) {
  var event = document.createEvent("Event");
  event.initEvent(eventName, true, true);
  ( el.__proto__ === r.fn ) ? el[0].dispatchEvent(event) : el.dispatchEvent(event);
}

test("r.id", function() {
  var div = r.id("div1");
  is ( div.__proto__, r.fn, "__proto__ of wrapped object is r.fn" );
  ok ( div[0] instanceof HTMLDivElement, "first item of wrapped object is HTMLDivElement" );
});

test("r.cls", function() {
  var divs = r.cls("div");
  is ( divs.__proto__, r.fn, "__proto__ of wrapped object is r.fn" );

  divs.forEach(function(div) {
    ok ( div instanceof HTMLDivElement, "all items of wrapped object is HTMLDivElement" );
  });
});

test("r.tag", function() {
  var lis = r.tag("li");
  is ( lis.__proto__, r.fn, "__proto__ of wrapped object is r.fn" );

  lis.forEach(function(li) {
    ok ( li instanceof HTMLLIElement, "all items of wrapped object is HTMLLIElement" );
  });
});

test("chain r.fn functions", function() {
  var blue = r("#div4"),
      spy = sinon.spy(function() {});

  blue.html("hoge").removeClass("blue").css("visibility", "hidden").unbind().bind("click", spy);

  ok ( blue.html().indexOf("hoge") !== -1, "innerHTML inserted...");
  is ( blue.css("float"), "none", "class removed...");
  is ( blue.css("visibility"), "hidden", "style added...");

  emit(blue, "click");

  ok ( spy.called, "and event bound.");
});
