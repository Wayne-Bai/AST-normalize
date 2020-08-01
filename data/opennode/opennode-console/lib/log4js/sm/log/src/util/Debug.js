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

(function() {
   "use strict"; //$NON-NLS-1$
   
   /**
    * @private
    * 
    * Provides debug support.
    */
   Ext.define('Sm.log.util.Debug', { //$NON-NLS-1$
      
      singleton : true,
      
      ON : false,
      
      abort : function(errorMsg) {
         var msg = "ABORT"; //$NON-NLS-1$
         if( errorMsg ) {
             msg += ": " + errorMsg; //$NON-NLS-1$
         }
         /*global console:true */
         console.log( msg );
         /*global console:false */
         // If we are in a debugging environment, cause the debugger to
         // take control
         /*jslint debug:true */
//         debugger; // OK, YUI does not like this
         /*jslint debug:false */
         
         // When not in a debugging environment, we generate the kind of
         // error that will be easiest to be catch: throwing an exception
         // does not work that well in some environments
         this.abortAndAttemptToAwakeDebuggerIfPresent();
      },
      abortWhenCalled: function(errorMsg) {
         return function() {
            Sm.log.util.Debug.abort(errorMsg);
         };
      }
   });

}());