var $ = require('jquery'),
    Cosmos = require('../../../cosmos.js'),
    renderComponent = require('../../helpers/render-component.js'),
    ComponentPlayground =
      require('../../../component-playground/component-playground.jsx');

describe('ComponentPlayground component', function() {
  var component,
      $component,
      props,
      childProps;

  function render(extraProps) {
    // Alow tests to extend fixture before rendering
    _.merge(props, extraProps);

    component = renderComponent(ComponentPlayground, props);
    $component = $(component.getDOMNode());

    if (Cosmos.createElement.callCount) {
      childProps = Cosmos.createElement.lastCall.args[0];
    }
  };

  beforeEach(function() {
    // Don't render any children
    sinon.stub(Cosmos, 'createElement');

    props = {
      fixtures: {}
    };
  });

  afterEach(function() {
    Cosmos.createElement.restore();
  })

  describe('children', function() {
    it('should not render child without fixture contents', function() {
      render();

      expect(Cosmos.createElement).to.not.have.been.called;
    });

    describe('with fixture contents', function() {
      beforeEach(function() {
        _.extend(props, {
          // Children draw their props from state.fixtureContents. Generating
          // state from props is tested in the state.js suite
          state: {
            fixtureContents: {
              component: 'MyComponent',
              width: 200,
              height: 100
            }
          }
        });
      });

      it('should send fixture contents to preview child', function() {
        render();

        var fixtureContents = component.state.fixtureContents;
        expect(childProps.component).to.equal(fixtureContents.component);
        expect(childProps.width).to.equal(fixtureContents.width);
        expect(childProps.height).to.equal(fixtureContents.height);
      });

      it('should send (Cosmos) router instance to preview child', function() {
        render({
          router: {}
        });

        expect(childProps.router).to.equal(props.router);
      });

      it('should use fixture contents as key for preview child', function() {
        render();

        var fixtureContents = component.state.fixtureContents,
            stringifiedFixtureContents = JSON.stringify(fixtureContents);

        expect(childProps.key).to.equal(stringifiedFixtureContents);
      });

      it('should clone fixture contents sent to child', function() {
        var obj = {};

        render({
          state: {
            fixtureContents: {
              shouldBeCloned: obj
            }
          }
        });

        expect(childProps.shouldBeCloned).to.not.equal(obj);
      });
    });
  });
});
