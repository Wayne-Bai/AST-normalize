RIAPP.Application.registerModule('header', function (app) {
    var thisModule = this, global = app.global, utils = global.utils;

    var HeaderVM = thisModule.HeaderVM = app.getType('BaseViewModel').extend({
            _create:function () {
                this._super();
                var self = this;
                this._$topPanel = global.$('#demoHeader');
                this._$contentPanel = global.$('#demoContent');
                this._contentPanelHeight = 0;
                if (!!this._$contentPanel)
                    this._contentPanelHeight = this._$contentPanel.height();

                this._expanderCommand = app.getType('Command').create(function (sender, param) {
                    if (sender.isExpanded) {
                        self.expand();
                    }
                    else
                        self.collapse();
                }, self, null);
            },
            expand:function () {
                var self = this;
                this._$topPanel.slideDown('fast', function(){self.updateUI(false);});
            },
            collapse:function () {
                var self = this;
                this._$topPanel.slideUp('fast', function(){self.updateUI(true);});
            },
            updateUI: function(isUp){
                if (!!this._$contentPanel)
                {
                    if (isUp)
                        this._$contentPanel.height(this._contentPanelHeight);
                    else
                        this._$contentPanel.height(this._contentPanelHeight - this._$topPanel.height());
                }
            }
        },
        {
            expanderCommand:{
                get:function () {
                    return this._expanderCommand;
                },
                enumerable:true,
                configurable:false
            }
        },
        function (obj) {
            app.registerType('custom.HeaderVM', obj);
        });
});