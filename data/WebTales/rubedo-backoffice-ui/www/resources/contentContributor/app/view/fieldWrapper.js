/*
 * File: resources/contentContributor/app/view/fieldWrapper.js
 *
 * This file was generated by Sencha Architect version 2.2.2.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Ext JS 4.1.x library, under independent license.
 * License of Sencha Architect does not include license for Ext JS 4.1.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('ContentContributor.view.fieldWrapper', {
    extend: 'Ext.container.Container',
    alias: 'widget.fieldWrapper',

    padding: 10,
    layout: {
        type: 'anchor'
    },

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'button',
                    itemId: 'helpBouton',
                    style: '{float:right;}',
                    handleMouseEvents: false,
                    iconCls: 'help',
                    pressedCls: 'x-btn',
                    text: ''
                }
            ]
        });

        me.callParent(arguments);
    }

});