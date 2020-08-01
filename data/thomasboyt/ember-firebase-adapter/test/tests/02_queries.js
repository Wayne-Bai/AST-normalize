module("Querying resources", {
  setup: function() {
    stop();

    fb.remove(function() {
      this.adapter = DS.Firebase.Adapter.create({
        dbName: window.DB_NAME
      });

      this.store = DS.Store.create({
        adapter: this.adapter,
        revision: 12
      });

      start();
    }.bind(this));
  },

  populate: function() {
    this.yehudaRef = fb.child("persons").push({
      firstName: "Yehuda",
      lastName: "Katz",
      twitter: "wycats"
    });
    this.tomRef = fb.child("persons").push({
      firstName: "Tom",
      lastName: "Dale",
      twitter: "tomdale"
    });
    this.ryanRef = fb.child("persons").push({
      firstName: "Ryan",
      lastName: "Florence",
      twitter: "ryanflorence"
    });
  },

  teardown: function() {
    stop();
    this.adapter.fb.child("persons").off();

    Ember.run.sync();
    Ember.run(function() {
      this.adapter.destroy();
      this.store.destroy();
      start();
    }.bind(this));
  }
});

asyncTest("Live queries: Creating new server-side item", function() {
  expect(1);
  this.populate();

  var people = Person.find();

  people.addObserver("length", function() {
    if (people.get("length") === 3) {
      fb.child("persons").push({
        firstName: "Peter",
        lastName: "Wagenet",
        twitter: "wagenet"
      });
    }
    if (people.get("length") === 4) {
      equal(people.objectAt(3).get("firstName"), "Peter", "Adding a new person resource adds it to the findAll result");
      start();
    }
  }.bind(this));
});

asyncTest("Live queries: Removing server-side item", function() {
  expect(1);
  this.populate();

  var people = Person.find();

  people.addObserver("length", function() {
    if (people.get("length") === 3) {
      people.removeObserver("length");

      people.addObserver("length", function() {
        if (people.get("length") === 2) {
          people.removeObserver("length");
          equal(people.objectAt(0).get("firstName"), "Tom", "Removing a resource on the server removes it from the findAll array");
          start();
        }
      });

      this.yehudaRef.remove();
    }
  }.bind(this));
});

asyncTest("Static queries with findQuery", function() {
  expect(1);
  this.populate();

  var people = Person.find({live: false});

  people.on("didLoad", function() {
    deepEqual(this.store.adapter._listenRefs, [], "findQuery() with {live:false} does not add a listened-to reference.");
    start();
  }.bind(this));
});

asyncTest("Static limited queries with findQuery", function() {
  expect(2);
  this.populate();

  var people = Person.find({live: false, limit: 2});

  people.on("didLoad", function() {
    equal(people.get("length"), 2, "Limiting a query with {limit: n} results in n objects");
    equal(people.objectAt(0).get("id"), this.tomRef.name(), "Limiting is done from the *last* n objects");
    start();
  }.bind(this));
});
