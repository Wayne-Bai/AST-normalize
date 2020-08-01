var $ = require('jquery'),
    Cosmos = require('../../../cosmos.js'),
    serialize = require('../../../lib/serialize.js'),
    renderComponent = require('../../helpers/render-component.js'),
    ComponentPlayground =
      require('../../../component-playground/component-playground.jsx');

describe('ComponentPlayground component', function() {
  var component,
      $component,
      props;

  function render(extraProps) {
    // Alow tests to extend fixture before rendering
    _.merge(props, extraProps);

    component = renderComponent(ComponentPlayground, props);
    $component = $(component.getDOMNode());
  }

  function getUrlProps(element) {
    var href = $(element).attr('href');

    // The serialize and router.url libs are already tested
    return serialize.getPropsFromQueryString(href.substr(1));
  }

  beforeEach(function() {
    // Don't render any children
    sinon.stub(Cosmos, 'createElement');

    props = {
      fixtures: {
        FirstComponent: {
          'blank state': {},
          'error state': {},
          'simple state': {}
        },
        SecondComponent: {
          'simple state': {}
        }
      }
    };
  });

  afterEach(function() {
    Cosmos.createElement.restore();
  })

  describe('render', function() {
    it('should render cosmos plug by default', function() {
      render();

      expect(component.refs.cosmosPlug).to.exist;
    });

    it('should not render cosmos plug with preview loaded', function() {
      render({
        state: {
          fixtureContents: {
            myProp: true
          }
        }
      });

      expect(component.refs.cosmosPlug).to.not.exist;
    });

    it('should render each component', function() {
      render();

      var $components = $component.find('.component');

      expect($components.length).to.equal(2);
    });

    it('should render component names', function() {
      render();

      var $names = $component.find('.component-name');

      expect($names.eq(0).text()).to.equal('FirstComponent');
      expect($names.eq(1).text()).to.equal('SecondComponent');
    });

    it('should render nested fixtures', function() {
      render();

      var $component1 = $component.find('.component:eq(0)'),
          $component2 = $component.find('.component:eq(1)');

      expect($component1.find('.component-fixtures li').length).to.equal(3);
      expect($component2.find('.component-fixtures li').length).to.equal(1);
    });

    it('should render fixture names', function() {
      render();

      var $component1 = $component.find('.component:eq(0)'),
          $component2 = $component.find('.component:eq(1)');

      expect($component1.find('.component-fixtures li:first').text())
            .to.equal('blank state');
      expect($component2.find('.component-fixtures li:first').text())
            .to.equal('simple state');
    });

    it('should generate url with fixture path', function() {
      render();

      var firstFixtureLink = $component.find('.component-fixture a'),
          urlProps = getUrlProps(firstFixtureLink);

      expect(urlProps.selectedComponent).to.equal('FirstComponent');
      expect(urlProps.selectedFixture).to.equal('blank state');
    });

    it('should not add full-screen class when prop is false', function() {
      render({
        fullScreen: false
      });

      expect($component.hasClass('full-screen')).to.equal(false);
    });

    it('should add full-screen class when prop is true', function() {
      render({
        fullScreen: true
      });

      expect($component.hasClass('full-screen')).to.equal(true);
    });

    it('should not render full screen button (w/out fixture selected)',
       function() {
      render();

      expect(component.refs.fullScreenButton).to.not.exist;
    });

    it('should render fixture editor button',
       function() {
      render();

      var element = component.refs.fixtureEditorButton.getDOMNode(),
          urlProps = getUrlProps(element);

      expect(urlProps.fixtureEditor).to.equal(true);
    });

    it('should add container class on preview element', function() {
      render({
        containerClassName: 'my-app-namespace'
      });

      var $previewDOMNode = $(component.refs.previewContainer.getDOMNode());

      expect($previewDOMNode.hasClass('my-app-namespace')).to.equal(true);
    });

    it('should not render fixture editor by default', function() {
      render();

      expect(component.refs.fixtureEditor).to.not.exist;
    });

    describe('with fixture selected', function() {
      beforeEach(function() {
        _.extend(props, {
          selectedComponent: 'FirstComponent',
          selectedFixture: 'simple state'
        })
      });

      it('should add expanded class to selected component', function() {
        render();

        var $expandedComponent = $component.find('.component.expanded');

        expect($expandedComponent.length).to.equal(1);
        expect($expandedComponent.find('.component-name').text())
              .to.equal('FirstComponent');
      });

      it('should add class to selected fixture', function() {
        render();

        var $selectedFixture = $component.find('.component-fixture.selected');

        expect($selectedFixture.length).to.equal(1);
        expect($selectedFixture.text()).to.equal('simple state');
      });

      it('should generate full-screen url', function() {
        render();

        var element = component.refs.fullScreenButton.getDOMNode(),
            urlProps = getUrlProps(element);

        expect(urlProps.selectedComponent).to.equal('FirstComponent');
        expect(urlProps.selectedFixture).to.equal('simple state');
        expect(urlProps.fullScreen).to.equal(true);
      });

      it('should include component and fixture in fixture editor url',
         function() {
        render();

        var element = component.refs.fixtureEditorButton.getDOMNode(),
            urlProps = getUrlProps(element);

        expect(urlProps.selectedComponent).to.equal('FirstComponent');
        expect(urlProps.selectedFixture).to.equal('simple state');
        expect(urlProps.fixtureEditor).to.equal(true);
      });
    });

    describe('with fixture editor open', function() {
      beforeEach(function() {
        props.fixtureEditor = true;
      });

      it('should render fixture editor', function() {
        render();

        expect(component.refs.fixtureEditor).to.exist;
      });

      it('should add class on preview container', function() {
        render();

        expect($(component.refs.previewContainer.getDOMNode())
               .hasClass('aside-fixture-editor')).to.be.true;
      });

      it('should populate fixture editor textarea from state', function() {
        render({
          state: {
            fixtureUserInput: 'lorem ipsum'
          }
        });

        expect(component.refs.fixtureEditor.getDOMNode().value)
               .to.equal(component.state.fixtureUserInput);
      });

      it('should generate selected fixture editor button', function() {
        render();

        expect($(component.getDOMNode())
               .find('.fixture-editor-button')
               .hasClass('selected-button')).to.be.true;
      });

      it('should generate url for closing fixture editor', function() {
        render();

        var element = component.refs.fixtureEditorButton.getDOMNode(),
            urlProps = getUrlProps(element);

        expect(urlProps.fixtureEditor).to.equal(false);
      });

      it('should include fixtor editor in fixture url', function() {
        var firstFixtureLink = $component.find('.component-fixture a'),
            urlProps = getUrlProps(firstFixtureLink);

        expect(urlProps.selectedComponent).to.equal('FirstComponent');
        expect(urlProps.selectedFixture).to.equal('blank state');
        expect(urlProps.fixtureEditor).to.equal(true);
      });

      it('should add invalid class on fixture editor on state flag',
         function() {
        render({
          state: {
            isFixtureUserInputValid: false
          }
        });

        expect($(component.refs.fixtureEditor.getDOMNode())
               .hasClass('invalid-syntax')).to.be.true;
      });
    });

    it('should generate url for closing editor with fixture', function() {
      render({
        selectedComponent: 'FirstComponent',
        selectedFixture: 'simple state',
        fixtureEditor: true
      });

      var element = component.refs.fixtureEditorButton.getDOMNode(),
          urlProps = getUrlProps(element);

      expect(urlProps.selectedComponent).to.equal('FirstComponent');
      expect(urlProps.selectedFixture).to.equal('simple state');
      expect(urlProps.fixtureEditor).to.equal(false);
    });
  });
});
