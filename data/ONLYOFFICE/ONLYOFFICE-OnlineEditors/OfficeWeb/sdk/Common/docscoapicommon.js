﻿/*
 * (c) Copyright Ascensio System SIA 2010-2014
 *
 * This program is a free software product. You can redistribute it and/or 
 * modify it under the terms of the GNU Affero General Public License (AGPL) 
 * version 3 as published by the Free Software Foundation. In accordance with 
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect 
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied 
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For 
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under 
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */
 (function (window, undefined) {
    var asc = window["Asc"] ? window["Asc"] : (window["Asc"] = {});
    var prot;
    function asc_CUser() {
        if (! (this instanceof asc_CUser)) {
            return new asc_CUser();
        }
        this.id = null;
        this.userName = null;
        this.state = undefined;
        return this;
    }
    asc_CUser.prototype = {
        constructor: asc_CUser,
        asc_getId: function () {
            return this.id;
        },
        asc_getUserName: function () {
            return this.userName;
        },
        asc_getState: function () {
            return this.state;
        },
        asc_setId: function (val) {
            this.id = val;
        },
        asc_setUserName: function (val) {
            this.userName = val;
        },
        asc_setState: function (val) {
            this.state = val;
        }
    };
    window["Asc"]["asc_CUser"] = window["Asc"].asc_CUser = asc_CUser;
    prot = asc_CUser.prototype;
    prot["asc_getId"] = prot.asc_getId;
    prot["asc_getUserName"] = prot.asc_getUserName;
    prot["asc_getState"] = prot.asc_getState;
    prot["asc_setId"] = prot.asc_setId;
    prot["asc_setUserName"] = prot.asc_setUserName;
    prot["asc_setState"] = prot.asc_setState;
})(window);