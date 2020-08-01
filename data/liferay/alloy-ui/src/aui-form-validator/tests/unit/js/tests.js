YUI.add('aui-form-validator-tests', function(Y) {

    //--------------------------------------------------------------------------
    // AUI Form Validator Unit Tests
    //--------------------------------------------------------------------------

    var suite = new Y.Test.Suite('aui-form-validator'),
        formValidator;

    var isImageURL = function(val) {
        var regex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;
        return regex.test(val);
    };

    Y.FormValidator.addCustomRules(
        {
            'imageURL': {
                condition: isImageURL,
                errorMessage: 'Please enter a valid URL that points to an image (jpg, jpeg, png, or gif).'
            }
        }
    );

    formValidator = new Y.FormValidator({
        boundingBox: '#myForm',
        fieldStrings: {
            email: {
                required: 'Type your email in this field.'
            },
            name: {
                required: 'Please provide your name.'
            }
        },
        rules: {
            age: {
                required: true
            },
            email: {
                email: true,
                required: true
            },
            emailConfirmation: {
                email: true,
                equalTo: '#email',
                required: true
            },
            gender: {
                required: true
            },
            'image-url': {
                imageURL: true,
                required: true
            },
            name: {
                rangeLength: [2, 50],
                required: true
            },
            picture: {
                acceptFiles: 'jpg, gif, png',
                required: true
            },
            read: {
                required: true
            },
            url: {
                required: true,
                url: true
            }
        },
        showAllMessages: true
    });

    //--------------------------------------------------------------------------
    // Test Case for invalid fields
    //--------------------------------------------------------------------------

    suite.add(new Y.Test.Case({

        name: 'AUI Form Submit Form Tests',

        /*
         * Check if on submit all fields are marked as invalid
         * Tests: AUI-965
         */
        'test submit form': function() {
            var elementWithoutError,
                forms;

            forms = Y.all('form');
            forms.each(function (form) {
                form.simulate('submit');
            });

            elementWithoutError = Y.one('.form-group:not(.has-error)');

            Y.Assert.isNull(elementWithoutError, 'There shouldn\'t be any element without class error');
        },

        /*
         * Check if validator nodes render after the input and lable's textNode
         * Tests: AUI-965
         */
        'test error message displayed after label': function() {
            var instance = this;

            instance._assertValidatorNextLabel('input[value=male]');

            instance._assertValidatorNextLabel('input[name=read]');
        },

        /*
         * Check if validator correctly validates <select> html fields
         * Tests: AUI-1204
         */
        'test submit empty select': function() {
            var form = Y.Node.create('<form><select name="gender"></select></form>'),
                select = form.one('select'),
                validOption,
                validator;

            Y.Node.create('<option value=""></option>').appendTo(select);
            validOption = Y.Node.create('<option value=\"male\">Male</option>').appendTo(select);

            validator = new Y.FormValidator({
                boundingBox: form,
                rules: {
                    gender: {
                        required: true
                    }
                }
            });

            form.simulate('submit');

            Y.Assert.isTrue(validator.hasErrors());

            validOption.attr('selected', 'selected');

            form.simulate('submit');

            Y.Assert.isFalse(validator.hasErrors());
        },

        /*
         * Check if validator correctly validates fields with custom rules
         * @tests AUI-1654
         */
        'test custom rules': function() {
            var form = Y.Node.create('<form><input name="gt50" id="gt50" type="text"></form>'),
                input = form.one('input'),
                validator;

            var gt50 = function(val) {
                return (val >= 50);
            };

            Y.FormValidator.addCustomRules(
                {
                    'greaterThan50': {
                        condition: gt50,
                        errorMessage: 'The digit should be >=50'
                    }
                }
            );

            validator = new Y.FormValidator({
                boundingBox: form,
                rules: {
                    gt50: {
                        greaterThan50: true,
                        required: true
                    }
                }
            });

            form.simulate('submit');

            Y.Assert.isTrue(validator.hasErrors());

            input.attr('value', '42');

            form.simulate('submit');

            Y.Assert.isTrue(validator.hasErrors());

            input.attr('value', '100');

            form.simulate('submit');

            Y.Assert.isFalse(validator.hasErrors());
        },

        _assertValidatorNextLabel: function(input) {
            var inputNode,
                textNode;

            inputNode = Y.one(input);

            textNode = inputNode.get('nextSibling');

            Y.Assert.isTrue(textNode.get('nodeType') === 3, 'Next to the input should be a text node');

            if (Y.FormValidator.isCheckable(inputNode)) {
                textNode = inputNode.ancestor('.form-group').get('lastChild').previous();
            }

            Y.Assert.isTrue(
                textNode.next().hasClass('form-validator-stack'),
                'Next to the input should be form validator');
        }
    }));

    Y.Test.Runner.add(suite);

}, '', {
    requires: ['test', 'aui-form-validator', 'node-event-simulate']
});
