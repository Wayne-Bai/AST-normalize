Items = new Meteor.Collection("items", {connection: null});

Template.list.items = function () {
  return Items.find();
};

var renderCount = 1;
var logRender = function () {
  console.log("rendered #" + renderCount);
  renderCount++;
};

Template.list.rendered = function () {
  logRender();
};

setInterval(function () {
  Items.insert({name: Random.choice(["one", "two", "three"])});
}, 1000);
