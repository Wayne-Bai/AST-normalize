/*     
 * 	  Copyright 2015 Jens Schyma jeschyma@gmail.com
 *		
 *	  This File is a Part of the source of Open-Fin-TS-JS-Client.
 *
 *    This program is free software: you can redistribute it and/or  modify
 *    it under the terms of the GNU Affero General Public License, version 3,
 *    as published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *	  Please contact Jens Schyma if you are interested in a commercial license.
 *	
 */
var ParseError = function (area, txt, pos) {
        this.t = txt;
		this.toString = function(){
			return this.t;
		};
    };

var Parser = function (in_txt) {
    var me = this;
    me.data 		= in_txt;
    me.cur_pos 		= 0;
    me.marker 		= {};
    me.clearMarker 	= function () {
        me.marker = {};
    };
    me.setMarker = function (mark, pos) {
        me.marker[mark] = pos;
    };
    me.setMarkerWithCurrentPos = function (mark) {
        me.setMarker(mark, me.cur_pos);
    };
    me.setPosBackToMarker = function (mark) {
        me.cur_pos = me.marker[mark];
    };
    me.getCurrentPos = function () {
        return this.cur_pos;
    };
    me.setCurrentPos = function (pos) {
        me.cur_pos = pos;
    };
    me.getCurrentChar = function () {
        return me.data[me.cur_pos];
    }
    me.hasNext = function () {
        if (me.cur_pos < me.data.length) {
            return true;
        } else {
            return false;
        }
    };
    me.nextPos = function () {
        if (me.cur_pos < me.data.length) {
            me.cur_pos++;
            return true;
        } else {
            return false;
        }
    };
    me.getTextFromMarkerToCurrentPos = function (mark) {
        return me.getTextFromPostoPos(me.marker[mark], me.cur_pos);
    };
    me.getTextFromPostoPos = function (pos1, pos2) {
        return me.data.substr(pos1, pos2 - pos1);
    };
    me.findNextValidChar = function (valid_chars) {
        var i = 0;
        for (i = me.cur_pos; i < me.data.length; i++) {
            if (valid_chars.indexOf(me.data[i]) != -1) {
                return i;
            }
        }
        return -1;
    };
    me.gotoNextValidChar = function (valid_chars) {
        var pos = me.findNextValidChar(valid_chars);
        if (pos == -1) {
            me.cur_pos = me.data.length;
            return false;
        } else {
            me.cur_pos = pos;
            return true;
        }
    };
    me.gotoNextValidCharButIgnoreWith = function (valid_chars, demask) {
        while (true) {
            var pos = me.findNextValidChar(valid_chars);
            if (pos == -1) {
                me.cur_pos = me.data.length;
                return false;
            } else if (pos == 0) {
                me.cur_pos = pos;
                return true;
            } else if (demask.indexOf(me.data[pos - 1]) != -1) {
                if ((pos + 1) < me.data.length) {
                    me.cur_pos = pos + 1;
                    // retry
                } else {
                    me.cur_pos = pos;
                    return false;
                }
            } else {
                me.cur_pos = pos;
                return true;
            }
        }
    };
};

module.exports = {};
module.exports.Parser = Parser;
module.exports.ParseError = ParseError;