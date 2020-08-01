Ext.define("Compass.ErpApp.Shared.Preferences.ApplicationManagementPanel", {
    extend: "Ext.Panel",
    alias: "widget.sharedpreferencesapplicationmanagementpanel",
    title: 'Applications',
    layout: 'border',

    /**
     * @cfg {String} updatePreferencesUrl
     * Url for preference updates.
     */
    updatePreferencesUrl: '',

    /**
     * @cfg {String} setupPreferencesUrl
     * Url for setup of preferences.
     */
    setupPreferencesUrl: '',

    /**
     * @cfg {String} loadPreferencesUrl
     * Url for loading preferences.
     */
    loadPreferencesUrl: '',

    /**
     * @cfg {String} applicationsUrl
     * Url for loading applications.
     */
    applicationsUrl: '',

    initComponent: function () {
        var me = this;

        me.addEvents(
            /**
             * @event afterAddItemsToForm
             * Fired before loaded preference types a added to form before layout is called
             * if false is returned items are not added to form
             * @param {FormPanel} this
             * @param {Array} array of preferenceTypes
             */
            "beforeAddItemsToForm",
            /**
             * @event afterSetPreferences
             * Fired after preference fields are set with selected preference options
             * @param {FormPanel} this
             * @param {Array} array of preferences
             */
            "beforeSetPreferences",
            /**
             * @event afterSetPreferences
             * Fired before preference fields are set with selected preference options
             * @param {FormPanel} this
             * @param {Array} array of preferences
             */
            "afterSetPreferences",
            /**
             * @event afterSetPreferences
             * Fired after update of preferences
             * @param {FormPanel} this
             * @param {Array} array of updated preferences
             */
            "afterUpdate"
        );

        var store = Ext.create('Ext.data.TreeStore', {
            proxy: {
                type: 'ajax',
                url: me.applicationsUrl
            },
            root: {
                text: 'Applications',
                expanded: true
            }
        });

        me.applicationsTree = Ext.create('Ext.tree.Panel', {
            store: store,
            width: 250,
            region: 'west',
            useArrows: true,
            border: false,
            split: true,
            listeners: {
                scope: this,
                'itemclick': function (view, record) {
                    if (record.get('leaf')) {
                        this.selectApplication(record.get('id'));
                    }
                }
            }

        });

        me.settingsCard = Ext.create('widget.panel', {
            layout: 'card',
            region: 'center',
            border: false
        });

        this.items = [this.applicationsTree, this.settingsCard];

        this.callParent();
    },

    selectApplication: function (applicationId) {
        var me = this;

        me.settingsCard.removeAll(true);

        var form = Ext.create('Compass.ErpApp.Shared.Preferences.Form', {
            url: me.updatePreferencesUrl + '/' + applicationId,
            setupPreferencesUrl: me.setupPreferencesUrl + '/' + applicationId,
            loadPreferencesUrl: me.loadPreferencesUrl + '/' + applicationId,
            width: 350,
            region: 'center',
            listeners: {
                'beforeAddItemsToForm': function (form, preferenceTypes) {
                    me.fireEvent('beforeAddItemsToForm', form, preferenceTypes);
                },
                'beforeSetPreferences': function (form, preferences) {
                    me.fireEvent('beforeSetPreferences', form, preferences);
                },
                'afterUpdate': function (form, preferences, response) {
                    me.fireEvent('afterUpdate', form, preferences, response);
                }
            }
        });

        this.settingsCard.add(form);
        this.settingsCard.getLayout().setActiveItem(0);
        form.setup();
    }
});



