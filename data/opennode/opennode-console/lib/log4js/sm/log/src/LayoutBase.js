/*
 * Copyright © 2012 Pedro Agullo Soliveres.
 * 
 * This file is part of Log4js-ext.
 *
 * Log4js-ext is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License.
 *
 * Commercial use is permitted to the extent that the code/component(s)
 * do NOT become part of another Open Source or Commercially developed
 * licensed development library or toolkit without explicit permission.
 *
 * Log4js-ext is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Log4js-ext.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * This software uses the ExtJs library (http://extjs.com), which is 
 * distributed under the GPL v3 license (see http://extjs.com/license).
 */

/*jslint strict:false */

(function() {
   // "use strict"; //$NON-NLS-1$

   /**
    * @abstract
    * 
    * Base class for all layouts.
    * 
    * A layout is in charge of formatting and augmenting the log data so that
    * it can be consumed by an appender. 
    * 
    * It knows about formatting the log time, obtaining an string that
    * represents all information in the log, adding special entries to a 
    * logging event, nicely formatting a logged object, etc.
    * 
    */
   Ext.define('Sm.log.LayoutBase', { //$NON-NLS-1$
      uses : ['Ext.Date',
              'Ext.JSON',
              'Sm.log.util.Debug', 
              'Sm.log.util.Assert'],
      
      config : {
         /** 
          * @cfg
          * @accessor
          * 
          * The format string used to format log time.
          * 
          * See Ext.Date.format for information about this format string. 
          */
         timeFormat : "Y-m-d H:i:s.u",
   
         /**
          * @cfg
          * @accessor
          * 
          * If set to true, an attempt will be made to highlight the logged
          * object JSON-formatted. 
          * 
          * It might be ignored if the JSON formatter does not support 
          * highlighting.
          * 
          */
         highlightLoggedObject : true,
         
         /**
          * @cfg
          * @accessor
          * 
          * If set to true, an attempt will be made to format the logged
          * object as a multiple line string.
          * 
          * It might be ignored if the JSON formatter does not support 
          * multiple line formatting.
          */
         multilineLoggedObject : false,
         
         /**
          * @cfg
          * @accessor
          * 
          * If set to true, the logged object will be output.
          */
         exportFormattedLoggedObject : true,
         
         /**
          * @cfg
          * @accessor
          * 
          * Desired indentation used to format the logged object.
          * 
          * It might be ignored if the JSON formatter does not support 
          * indenting.
          */
         formatIndentLoggedObject : 3
      },

      /**
       * Appends extra formatted data to the original log event.
       * 
       * By default, it provides formattedTime and formattedMessage
       * values, as well as a formattedLogObject if the appender is
       * configured to log the loggedObject too. 
       * 
       * Derived classes might want to add data for the output destination
       * to handle. For example, an output window might want to provide
       * a version of a formatted logged object that will be shown in a 
       * single line, and another one formatted in multiple line, 
       * to be shown in an expanded view.
       *
       * @protected
       * 
       * @param {Sm.log.LoggingEvent} logEvent The original log data.
       * 
       * @returns {void}
       */
      appendFormattedData : function(logEvent) {
         var formattedLoggedObject;
         logEvent.formattedTime = this.formatTime(logEvent);
         logEvent.formattedMessage = this.formatMessage(logEvent);
         if( this.getExportFormattedLoggedObject() ) {            
            if( logEvent.hasLoggedObject) {
               logEvent.formattedLoggedObject = 
                  this.formatLoggedObject(logEvent);
             }
            else {
               logEvent.formattedLoggedObject = '';
            }
         }
      },
      
      /**
       * Returns a text corresponding to the log.
       * 
       * This is useful in scenarios in which the log is written in a
       * single line, such as the browser console.
       * 
       * @protected
       * @abstract
       * @param {Sm.log.LoggingEvent} logEvent The log information.
       */
      formatLogAsText : function(logEvent) {
         Sm.log.util.Debug.abort( "You must use an appender that knows " +
                         "how to format a log event as a text" );
      },
   
      /**
       * Formats the log time.
       * 
       * If there is no timeFormat, calls toString.
       * 
       * @param {Sm.log.LoggingEvent} logEvent The log data.
       * 
       * @protected
       * @returns
       */
      formatTime : function(logEvent) {
         var time = logEvent.time;
         if( this.getTimeFormat() ) {
            return Ext.Date.format( time, this.getTimeFormat() );
         }
         return time.toString();
      },
      
      /**
       * Formats the log message.
       * 
       * This will use the extra formatting information provided in the log
       * method call to return a formatted message. Take a look at this [wiki
       * entry](http://code.google.com/p/log4js-ext/wiki/LoggingFormatting) 
       * for examples on supported formatting.
       * 
       * @param {Sm.log.LoggingEvent} logEvent The log data.
       * 
       * @protected
       * @returns
       */
      formatMessage : function(logEvent) {
         var message = logEvent.message,
             formatParams = logEvent.formatParams,
             useComplexLayout,
             args, template, i;
         
         if( formatParams ) {
            Sm.log.util.Assert.assert(formatParams.length > 0);
            
            useComplexLayout = Ext.isObject(formatParams[0]);
            if( !useComplexLayout ) {
               message = this.simpleFormat( message, formatParams );
            }
            else {
               message = this.multiFormat( message, formatParams );
            }
         }
         else {
            message = message.toString();
         }
         
         return message;
       },
       
       /**
        * Returns a formatted text corresponding to the logged object.
        * 
        * @param {Sm.log.LoggingEvent} logEvent The log data.
        * @returns The formatted text corresponding to the logged object.
        * 
        * @protected
        */
       formatLoggedObject : function(logEvent) {         
          if(logEvent.hasOwnProperty( "loggedObject" )) {
             return this.jsonLikeFormat(logEvent.loggedObject, 
                      this.getHighlightLoggedObject(), 
                      this.getMultilineLoggedObject() );
          }
          return '';
       },
       
       /**
        * CSS styles used to highight logged object as JSON.
        * 
        * @private
        */
       jsonCls : {
         key : 'sm-log-json-key',
         string : 'sm-log-json-string',
         number : 'sm-log-json-number',
         bool : 'sm-log-json-boolean',
         nul : 'sm-log-json-null'
       },
      
       /**
        * Highlights and makes more readable a JSON string corresponding 
        * to a logged object. 
        * 
        * @param {String} json 
        *        The json string corresponding to the logged object.
        * @param jsonCls CSS classes used for highlighting. 
        * 
        * @returns {String} A string representing the highlighted logged object.
        * 
        * @protected
        */
        // Obtained from http://jsfiddle.net/KJQ9K/ : many thanks!!
        jsonSyntaxHighlight : function(json, jsonCls) {
          var regex;
          // Special case, we *want* undefined
          if( json === undefined ) {
            return '<span class="' + this.jsonCls.nul + '">undefined</span>';
          }
         
          regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
          return json.replace(regex, function (match) {
             var cls = jsonCls.number, isKey = false, isString = false, result;
             if (/^"/.test(match)) {
                 if (/:$/.test(match)) {
                     cls = jsonCls.key;
                     isKey = true;
                 } else {
                     cls = jsonCls.string;
                     isString = true;
                 }
             } else if (/true|false/.test(match)) {
                 cls = jsonCls.bool;
             } else if (/null/.test(match)) {
                 cls = jsonCls.nul;
             }
             
             // *******************************************************
             // Improve readability
             // Remove quotes from keys and add additional space
             if( isKey ) {
                // We *MUST* leave ':' here, because if it is out
                // of span, searches for something like 'key:' will not 
                // find the key because there will be a 'hidden' span tag there.
                // And this kind of search shuld be rather common!
                match = match.slice(1, match.length - 2 ) + ": ";
             }
             // Replace quotes by single quotes from strings
             if( isString ) {
                match = "'" + match.slice(1, match.length -1 ) + "'";
             }
             result = '<span class="' + cls + '">' + match + '</span>';
             return result;
         });
      },    
      
      /**
       * Returns a JSON string correponding to an object.
       * 
       * @param obj The object to format.
       * @param {Boolean} highlight If true, attempts to provide 
       *                  highlighting (html) 
       * @param {Boolean} multiline Use multiple text lines?
       * @param {Number} indent Indentation level (spaces)
       * 
       * @returns {String} A formatted JSON string representing an object.
       * 
       * @protected
       */
      jsonLikeFormat : function( obj, highlight, multiline, indent ) {
         var json;
         // Crazy as it might seem, just writing 'if(JSON)' generates
         // an error in IE 9. That's why we wrap call in try..catch, to
         // handle IE 9 failure :(
         try {
            // This one allows for better readability thanks to spacing
            json = JSON.stringify( obj, undefined, 
                               indent || this.getFormatIndentLoggedObject() );
         }
         catch(ex) {
            json = Ext.JSON.encode(obj);
         }
         if( highlight ) {
            if( json !== undefined ) {
               // Replace spaces *before* adding html tags,
               // or the white space in the tags will get replaced too,
               // with bad effects            
               json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').
                        replace(/>/g, '&gt;');
               if( multiline ) {
                  json = json.replace( / /g, '&nbsp;');
                  json = json.replace( /(\r\n|\n|\r)/gm, '<br>');
               }
            }
            json = this.jsonSyntaxHighlight(json, this.jsonCls);
         }
         else {
            // Special case, we *want* undefined
            if( json === undefined) {
               return "undefined";
            }
         }
         return json;
      },
      
      /**
       * Formats a string depending on the format parameters a-la
       * Ext.Template.
       * 
       * It is a poor man's version of Ext.Template.apply(..) that is not very
       * efficient *but* can cope with values not being present without
       * returning an empty string, unlike Ext.Template
       * 
       * @protected
       * 
       * @param {String} str The string to format.
       * @param {Array} formatParams Formatting parameters
       * @returns {String} The formatted string.
       */
      multiFormat : function( str, formatParams ) {
         var i, result = str, formatKeyValue;

         // Inlined function to avoid warnings with my IDE: else, I would
         // have defined it inline in the 'each' iteration below
         formatKeyValue = function( key, value ) {
            result = result.replace( "{" + key + "}", value.toString() );
         };

         for( i = 0; i < formatParams.length; i = i + 1) {
            Ext.Object.each(formatParams[i], formatKeyValue );
         }
         return result;
      },

      /**
       * Format a string using the format parameters, a-la Ext.String.format.
       * 
       * @protected
       * 
       * @param {String} str The string to format.
       * @param {Array} formatParams Formatting parameters
       * 
       * @returns {String} The formatted String
       */
      simpleFormat : function( str, formatParams ) {
         var i, result = str, formatKeyValue;

         for( i = 0; i < formatParams.length; i = i + 1) {
            result = result.replace( "{" + i + "}", formatParams[i]);
         }
         return result;         
      },
      
      /**
       * Call this method from derived classes.
       *  
       * @protected
       * 
       * @param cfg
       */
      constructor : function(cfg) {
         this.initConfig(cfg);
      }
   });
}());