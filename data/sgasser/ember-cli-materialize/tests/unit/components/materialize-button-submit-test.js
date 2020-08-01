import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('materialize-button-submit', 'MaterializeButtonSubmitComponent', {
  // specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']
});

test('button submit renders', function(assert) {
  assert.expect(2);

  // creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // appends the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');
});

test('button submit is added to the page', function(assert) {
  this.subject();
  this.render();

  assert.ok($('button').length);
});
