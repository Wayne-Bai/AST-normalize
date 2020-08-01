/*
 * Licensed to Apereo under one or more contributor license
 * agreements. See the NOTICE file distributed with this work
 * for additional information regarding copyright ownership.
 * Apereo licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License.  You may obtain a
 * copy of the License at the following location:
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
Ext.define('Ssp.view.tools.actionplan.EmailAndPrintActionPlan', {
	extend: 'Ext.container.Container',
	alias : 'widget.emailandprintactionplan',
    mixins: [ 'Deft.mixin.Injectable',
              'Deft.mixin.Controllable'],
    controller: 'Ssp.controller.tool.actionplan.EmailAndPrintActionPlanViewController',
	inject: {
        authenticatedPerson: 'authenticatedPerson'
    },
    height: 35,
    width: 200,
	layout: {
        type: 'hbox'
    },
	initComponent: function() {	
		var me = this;

        Ext.applyIf(me, {
            items: [
			{
					xtype: 'tbspacer',
					width: '30'
			},
			{
                    tooltip: 'Email Action Plan',
                    text: '',
                    width: 30,
                    height: 30,
                    hidden: !me.authenticatedPerson.hasAccess('EMAIL_ACTION_PLAN_BUTTON'),
                    cls: 'emailIcon',
                    xtype: 'button',
                    itemId: 'emailTasksButton'
                }, 
				{
					xtype: 'tbspacer',
					width: '100'
				},{
                    tooltip: 'Print Action Plan',
                    text: '',
                    width: 30,
                    height: 30,
                    hidden: !me.authenticatedPerson.hasAccess('PRINT_ACTION_PLAN_BUTTON'),
                    cls: 'printIcon',
                    xtype: 'button',
                    itemId: 'printTasksButton'
                }
                
            ]
        });

        me.callParent(arguments);
	}
		
});