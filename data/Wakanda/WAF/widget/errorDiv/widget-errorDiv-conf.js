/*
 * This file is part of Wakanda software, licensed by 4D under
 *  (i) the GNU General Public License version 3 (GNU GPL v3), or
 *  (ii) the Affero General Public License version 3 (AGPL v3) or
 *  (iii) a commercial license.
 * This file remains the exclusive property of 4D and/or its licensors
 * and is protected by national and international legislations.
 * In any event, Licensee's compliance with the terms and conditions
 * of the applicable license constitutes a prerequisite to any use of this file.
 * Except as otherwise expressly stated in the applicable license,
 * such license does not include any other license or rights on this file,
 * 4D's and/or its licensors' trademarks and/or other proprietary rights.
 * Consequently, no title, copyright or other proprietary rights
 * other than those specified in the applicable license is granted.
 */
WAF.addWidget({
    packageName: 'Widget/errorDiv',
    type: 'errorDiv',
    lib: 'WAF',
    description: 'Display Error',
    category: 'Form Controls',
    img: '/walib/WAF/widget/errorDiv/icons/widget-errorDiv.png',
    tag: 'div',
    attributes: [
        {
            name: 'class',
            description: 'Css class'
        }],
    style: [
        {
            name: 'width',
            defaultValue: '150px'
        },
        {
            name: 'height',
            defaultValue: '20px'
        }],
    events: [
        /*{
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/
    ],
    properties: {
        style: {
            theme: false,
            fClass: true,
            text: true,
            background: true,
            border: true,
            sizePosition: true,
            label: false,
            shadow: true,
            disabled: []
        }
    },
    onInit: function(config) {
        var errorDiv = new WAF.widget.ErrorDiv(config);
        return errorDiv;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
    }
});
