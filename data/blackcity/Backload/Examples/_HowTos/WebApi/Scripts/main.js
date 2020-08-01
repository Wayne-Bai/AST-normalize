/*
 * jQuery File Upload Plugin
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
*/

/*jslint nomen: true, unparam: true, regexp: true */
/*global $, window, document */

$(function () {
    'use strict';

    // In this example we do NOT use the builtin file upload handler.
    // var fileUploadUrl = "/Backload/UploadHandler";

    var fileUploadUrl = "/api/FileHandler/";


    // Initialize the jQuery File Upload widget:
    $('#fileupload').fileupload({
        url: fileUploadUrl,
        previewMaxWidth: 80,
        previewMaxHeight: 60,
        acceptFileTypes: /(jpg)|(jpeg)|(png)|(gif)|(pdf)|(doc)|(docx)$/i // Allowed file types
    });



    // Optional: Initial ajax request to load already existing files.
    $.ajax({
        url: fileUploadUrl,
        dataType: 'json',
        context: $('#fileupload')[0]
    })
    .done(function (result) {
        $(this).fileupload('option', 'done')
            .call(this, null, { result: result });
        // Attach the Colorbox plugin to the image files to preview them in a modal window. Other file types (e.g. pdf) will show up in a 
        // new browser window.
        $(".files tr[data-type=image] a").colorbox();
    });

});


$("document").ready(function () {
    // The Colorbox plugin needs to be informed on new uploaded files in the template in order to bind a handler to it. 
    // There must be a little delay, because the fileuploaddone event is triggered before the new template item is created.
    // A more elegant solution would be to use jQuery's delegated .on method, which automatically binds to the anchors in a
    // newly created template item, and then call colorbox manually.
    $('#fileupload')
        .bind('fileuploaddone', function (e, data) {
            setTimeout(function () { $(".files tr[data-type=image] a").colorbox() }, 1000);
        })
        
        // You do not need the following.
        //.bind('fileuploaddestroy', function (e, data) {
        //    var s = data.url.split("?");                                // Split and replace is way faster than RegEx here
        //    s[1] = s[1].replace("fileName=", "").replace(".", ",");     // Make the url RESTful compliant and remove dots 
        //                                                                // because otherwise IIS treats this as a path to a file
        //                                                                // and it will not be routed by the Web API
        //    data.url = s[0] + s[1];                                     // Note: Server side we must add the file manually to the 
        //                                                                // e.Param.BackloadValues.FileName property in the IncomingRequestStarted event handler
        //});
        

});