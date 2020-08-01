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

// PAGRemoteLogging
(function() {
   "use strict"; //$NON-NLS-1$

   /**
    * @private
    * 
    * An appender that performs remote logging using Direct for 
    * sending log information.
    * 
    * There are two standard remote appenders, one for log4j
    * (see {@link Sm.log.direct.DirectAppender#getLog4jAppender}), and
    * another one for slf4j (see 
    * {@link Sm.log.direct.DirectAppender#getSlf4jAppender}).
    * 
    * It is possible to define new remote appenders once they are
    * implemented at the server side.
    */
   Ext.define('Sm.log.direct.DirectAppender', { //$NON-NLS-1$
      extend : 'Sm.log.AppenderBase',
      
      config : {
         /**
          * @cfg (required)
          * @accessor
          * @readonly
          * 
          * The Direct action with the log operation
          * 
          */
         loggingAction : null
         
         /**
          * @private
          * @method setLoggingAction
          */
      },
      
      statics : {
         /**
          * @private
          * @static 
          * 
          * Ensures that the DirectJNgine log provider is registered, and 
          * only once.
          * 
          * @returns {void}
          */
         ensureStandardProviderRegistered : function () {
            var me = Sm.log.direct.DirectAppender, provider;
            if( !me.remotingApiRegistered) {
              provider = Ext.Direct.addProvider( 
                       Sm.log.direct.impl.REMOTING_API );
              provider.maxRetries = 0;
              provider.timeout = 15000;
            }
            me.remotingApiRegistered = true;
         },
         
         /**
          * @static
          * 
          * Returns the standard log4j DirectJNgine based appender.
          * 
          * @returns {Sm.log.direct.DirectAppender} 
          *           The standard log4j DirectJNgine based appender.
          */
         getLog4jAppender : function () {
            var me = Sm.log.direct.DirectAppender;
            me.ensureStandardProviderRegistered();
            if( !me.log4jAppender) {
               me.log4jAppender = new Sm.log.direct.DirectAppender(
                      {loggingAction: Sm.log.direct.impl.Log4jLogger});
             }
            return me.log4jAppender;
         },
         
         /**
          * @static
          * 
          * Returns the standard slf4j DirectJNgine based appender.
          * 
          * @returns {Sm.log.direct.DirectAppender}
          *          The standard slf4j DirectJNgine based appender.
          */
         getSlf4jAppender : function () {
            var me = Sm.log.direct.DirectAppender;
            Sm.log.direct.DirectAppender.ensureStandardProviderRegistered();
            if( !me.slf4jAppender) {
               me.slf4jAppender = new Sm.log.direct.DirectAppender(
                        {loggingAction: Sm.log.direct.impl.Slf4jLogger});
             }
             return me.slf4jAppender;
         }
      },
      
      /**
       * Creates a new remote appender, passing the Direct action that
       * provides the log operation.
       * 
       * Of course, you must make sure that the provider for that action
       * is already registered.
       * 
       * @param {Object} cfg 
       *        The Direct action that provides the log operation.
       */      
      constructor : function(cfg) {
         this.callParent(cfg);
         Sm.log.util.Assert.assert(cfg.loggingAction);
         
         // We need a layout that does not highlight logged objects,
         // for remote loggers do not understand HTML as a rule
         this.setLayout(new Sm.log.LayoutBase());
         this.getLayout().highlightLoggedObject = false;
      },
      
      /**
       * @protected
       * 
       * @inheritDoc
       */
      doLog : function(logEvent) {
         // Add data that is relevant to server
         logEvent.timeMillis = logEvent.time.getTime();
         
         // Remove data that is irrelevant to server
         delete logEvent.time;    // Wants timeMillis & formattedTime
         delete logEvent.message; // Wants formattedMessage
         delete logEvent.formatParams; // Server can't format with js object
         delete logEvent.loggedObject; // Server can't cope with js object
         delete logEvent.levelLevel;   // Makes no sense for server
         
         this.getLoggingAction().log(logEvent);
      }
   });
}());