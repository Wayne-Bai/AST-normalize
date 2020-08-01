jest.dontMock('../Radio.jsx');
jest.dontMock('lodash');
jest.dontMock('../../utils/Create');

describe('SelectInput', function () {
    it('render number input', function () {
        var React = require('react/addons');
        var Component = require('../Radio.jsx');
        var TestUtils = React.addons.TestUtils;

        var form = {
            state: {node: {}, errors: {}}
        }

        var Input = TestUtils.renderIntoDocument(
            <Component.Radio form={form} value="hello world" name="foobar"/>
        );

        var B = require('react-bootstrap');

        // Verify that it's Off by default
        var widget = TestUtils.findRenderedComponentWithType(Input, B.Input);
    });
});
