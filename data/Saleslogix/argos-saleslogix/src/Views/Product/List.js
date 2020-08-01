/*
 * Copyright (c) 1997-2013, SalesLogix, NA., LLC. All rights reserved.
 */

/**
 * @class crm.Views.Product.List
 *
 * @extends argos.List
 *
 * @requires crm.Format
 */
define('crm/Views/Product/List', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/string',
    '../../Format',
    'argos/List'
], function(
    declare,
    lang,
    string,
    format,
    List
) {

    var __class = declare('crm.Views.Product.List', [List], {
        //Templates
        itemTemplate: new Simplate([
            '<h3>{%: $.Name %} | {%: $.Description %}</h3>',
            '<h4>',
            '{%: $.Family %}',
            '</h4>'
        ]),

        //Localization
        titleText: 'Products',

        //View Properties
        id: 'product_list',
        security: 'Entities/Product/View',
        queryOrderBy: 'Name',
        querySelect: [
            'Description',
            'Name',
            'Family',
            'Price',
            'Program',
            'FixedCost'
        ],
        resourceKind: 'products',

        formatSearchQuery: function(searchQuery) {
            return string.substitute('(upper(Name) like "${0}%" or upper(Family) like "${0}%")', [this.escapeSearchQuery(searchQuery.toUpperCase())]);
        }
    });

    lang.setObject('Mobile.SalesLogix.Views.Product.List', __class);
    return __class;
});

