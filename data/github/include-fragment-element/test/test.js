var count;

MockXHR.responses = {
  '/hello': function(xhr) {
    xhr.respond(200, '<div id="replaced">hello</div>', {'Content-Type': 'text/html; charset=utf-8'});
  },
  '/one-two': function(xhr) {
    xhr.respond(200, '<p id="one">one</p><p id="two">two</p>', {'Content-Type': 'text/html'});
  },
  '/blank-type': function(xhr) {
    xhr.respond(200, '<div id="replaced">hello</div>', {'Content-Type': null});
  },
  '/boom': function(xhr) {
    xhr.respond(500, 'boom');
  },
  '/count': function(xhr) {
    count++;
    xhr.respond(200, ''+count, {'Content-Type': 'text/html'});
  }
};

window.XMLHttpRequest = MockXHR;

module('', {
  setup: function() {
    count = 0;
  }
});


test('create from document.createElement', function() {
  var el = document.createElement('include-fragment');
  equal('INCLUDE-FRAGMENT', el.nodeName);
});

test('create from constructor', function() {
  var el = new window.IncludeFragmentElement();
  equal('INCLUDE-FRAGMENT', el.nodeName);
});

test('src property', function() {
  var el = document.createElement('include-fragment');
  equal(null, el.getAttribute('src'));
  equal('', el.src);

  el.src = '/hello';
  equal('/hello', el.getAttribute('src'));
  var link = document.createElement('a');
  link.href = '/hello';
  equal(link.href, el.src);
});

asyncTest('initial data is in error state', 1, function() {
  var el = document.createElement('include-fragment');

  el.data['catch'](function(error) {
    ok(error);
    start();
  });
});

asyncTest('data with src property', 1, function() {
  var el = document.createElement('include-fragment');
  el.src = '/hello';

  el.data.then(function(html) {
    equal('<div id="replaced">hello</div>', html);
    start();
  }, function() {
    ok(false);
    start();
  });
});

asyncTest('data with src attribute', 1, function() {
  var el = document.createElement('include-fragment');
  el.setAttribute('src', '/hello');

  el.data.then(function(html) {
    equal('<div id="replaced">hello</div>', html);
    start();
  }, function() {
    ok(false);
    start();
  });
});

asyncTest('setting data with src property multiple times', 2, function() {
  var el = document.createElement('include-fragment');
  el.src = '/count';

  el.data.then(function(text) {
    equal('1', text);
    el.src = '/count';
  }).then(function() {
    return el.data;
  }).then(function(text) {
    equal('1', text);
    start();
  })['catch'](function() {
    ok(false);
    start();
  });
});

asyncTest('setting data with src attribute multiple times', 2, function() {
  var el = document.createElement('include-fragment');
  el.setAttribute('src', '/count');

  el.data.then(function(text) {
    equal('1', text);
    el.setAttribute('src', '/count');
  }).then(function() {
    return el.data;
  }).then(function(text) {
    equal('1', text);
    start();
  })['catch'](function() {
    ok(false);
    start();
  });
});

test('data is not writable', 2, function() {
  var el = document.createElement('include-fragment');
  ok(el.data !== 42);
  try {
    el.data = 42;
  } catch(e) {}
  ok(el.data !== 42);
});

test('data is not configurable', 2, function() {
  var el = document.createElement('include-fragment');
  ok(el.data !== undefined);
  try {
    delete el.data;
  } catch(e) {}
  ok(el.data !== undefined);
});

asyncTest('replaces element on 200 status', 2, function() {
  var div = document.createElement('div');
  div.innerHTML = '<include-fragment src="/hello">loading</include-fragment>';
  document.getElementById('qunit-fixture').appendChild(div);

  div.firstChild.addEventListener('load', function() {
    equal(document.querySelector('include-fragment'), null);
    equal(document.querySelector('#replaced').textContent, 'hello');
    start();
  });
});

asyncTest('replaces with several new elements on 200 status', 3, function() {
  var div = document.createElement('div');
  div.innerHTML = '<include-fragment src="/one-two">loading</include-fragment>';
  document.getElementById('qunit-fixture').appendChild(div);

  div.firstChild.addEventListener('load', function() {
    equal(document.querySelector('include-fragment'), null);
    equal(document.querySelector('#one').textContent, 'one');
    equal(document.querySelector('#two').textContent, 'two');
    start();
  });
});

asyncTest('adds is-error class on 500 status', 1, function() {
  var div = document.createElement('div');
  div.innerHTML = '<include-fragment src="/boom">loading</include-fragment>';
  document.getElementById('qunit-fixture').appendChild(div);

  div.addEventListener('error', function(event) {
    event.stopPropagation();
    ok(document.querySelector('include-fragment').classList.contains('is-error'));
    start();
  });
});

asyncTest('adds is-error class on mising Content-Type', 1, function() {
  var div = document.createElement('div');
  div.innerHTML = '<include-fragment src="/blank-type">loading</include-fragment>';
  document.getElementById('qunit-fixture').appendChild(div);

  div.addEventListener('error', function(event) {
    event.stopPropagation();
    ok(document.querySelector('include-fragment').classList.contains('is-error'));
    start();
  });
});

asyncTest('replaces element when src attribute is changed', 2, function() {
  var div = document.createElement('div');
  div.innerHTML = '<include-fragment>loading</include-fragment>';
  document.getElementById('qunit-fixture').appendChild(div);

  div.firstChild.addEventListener('load', function() {
    equal(document.querySelector('include-fragment'), null);
    equal(document.querySelector('#replaced').textContent, 'hello');
    start();
  });

  setTimeout(function() {
    div.firstChild.src = '/hello';
  }, 10);
});
