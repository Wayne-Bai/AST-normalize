/**
 * @preserve Copyright 2012 Martijn van de Rijdt
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

$( document ).ready( function() {
    var connection = new Connection();
    $( '.update-forms-total' ).click( function( event ) {
        event.preventDefault();
        updateFormsTotal();
    } ).click();

    //override GUI handler to restore default bookmark functionality
    $( document ).on( 'click', 'a[href^="#"]:not([href="#"])', function() {
        window.location.hash = $( this ).attr( 'href' );
    } );
} );
