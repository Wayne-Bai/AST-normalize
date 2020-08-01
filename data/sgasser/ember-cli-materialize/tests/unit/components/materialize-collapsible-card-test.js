import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('materialize-collapsible-card', {
  // specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']
});

test('collapsible card renders', function(assert) {
  assert.expect(2);

  // creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // renders the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');
});
