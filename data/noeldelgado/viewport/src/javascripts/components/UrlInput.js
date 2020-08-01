Class(Dm.UI, 'URLInput').inherits(Widget)({
    HTML : '\
        <form></form>\
    ',
    ELEMENT_CLASS : 'url-input-component',
    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.appendChild(new Dm.UI.Input({
                name : 'input',
                label : 'URL:',
                type : 'url',
                value : this.inputValue || '',
                className : 'url-input'
            })).render(this.element);

            this.appendChild(new Dm.UI.Button({
                name : 'button',
                text : 'Go',
                className : 'url-button-go'
            })).render(this.element);

            this._bindEvents();
        },

        /**
         * Event bindings.
         * @method _bindEvents <private> [Function]
         * @return this [Dm.UI.URLInput]
         */
        _bindEvents : function _bindEvents() {
            this.element.on('submit', this._submitHandler.bind(this));
            this.input.bind('click', function() {
                this.inputElement.select();
            });

            return this;
        },

        /**
         * Form submit handler.
         * @method <private> [Function]
         * @dispatch 'submit' {inputValue: this.input.value}
         * @return false
         */
        _submitHandler : function _submitHandler() {
            this.dispatch('submit', {
                inputValue : this.input.getValue()
            });
            return false;
        }
    }
});
