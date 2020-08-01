module("test for DOM manipulation function");


is = strictEqual;

test("r.fn.html - get", function() {
  var div = r(".div1");
  is( div.html().trim(), "div", "innerHTML of div is div");
});

test("r.fn.html - set with string and number", function() {

  var li = r("#list1 li");
  li.html("hoge");

  li.forEach(function(elem) {
    is( elem.innerHTML.trim(), "hoge", "innerHTML of li is hoge");
  });

  li.html(0.1);

  li.forEach(function(elem) {
    is( elem.innerHTML.trim(), "0.1", "innerHTML of li is 0.1");
  });
});

test("r.fn.html - set with HTMLElement", function() {
  var li = r("#list2 li");
  console.log(li.length);
  li.html(r(".div2")[0]);

  is ( r("#list2 li div").length, 3, "dev inserted to each list item" );
});

test("r.fn.html - set with NodeArray", function() {

  var li = r("#list3 li");
  li.html(r("#list4insert"));

  li.forEach(function(el) {
    is ( el.children[0].nodeName, "UL", "ul element is inserted");

    Array.prototype.slice.call(el.children[0].children).forEach(function(item) {
      is ( item.nodeName, "LI", "li element is included in ul");
    });
  });
});

test("r.fn.remove", function() {

  var li = r("#remove1 li");
  var removed = li.remove();

  removed.forEach(function(el) {
    is ( el.parentNode, null, "elements removed from DOM tree" );
  });
});

test("r.fn.add - add NodeArray", function() {

  var ul = r("#addto1");
  var lis = r("#addfrom1 li");

  ul.add(lis);

  is ( r("#addto1 li").length, 3, "elements added" );
  is ( r("#addfrom1 li").length, 0, "original elements removed" );
});

test("r.fn.add - add HTMLElement", function() {

  var ul = r("#addto2");
  var li = r("#addfrom2 li")[0];

  ul.add(li);

  is ( r("#addto2 li").length, 1, "element added" );
  is ( r("#addfrom2 li").length, 2, "original element removed" );
});

test("r.fn.add - add text", function() {

  var ul = r("#addto3");

  ul.add("fuga");

  ok ( r("#addto3").html().match(/hoge\s*fuga/), "fuga inserted to last" );
});
