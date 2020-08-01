$(function () {
    // We use the client querystring only for demo purposes. You'll see, Backload can  
    // can handle any file upload control side by side at the same time with the help of extensions.
    // You do not need to include this querystring, if you only serve a specific plugin type
    var backloadController = "/Backload/UploadHandler";

    $("#uploader").plupload({
        runtimes: 'html5,html4',
        url: backloadController,
        max_file_size: '10mb',
        max_file_count: 64, // user can add no more then 10 files at a time
        rename: true,
        multiple_queues: true,
        filters: [{ title: "Image files", extensions: "jpg,gif,png" }], // Specify what files to browse for
        preinit: { Init: function (up) {  } },  // Do init stuff here 
        views: { list: true, thumbs: true, active: 'thumbs' }
    });
    var uploader = $('#uploader').plupload('getUploader');
    var $uploaderwidget = $('#uploader').data("ui-plupload");


    // PlUpload doesn't send a delete request to the server automatically, so we do it with an jquery ajax request
    uploader.bind("FilesRemoved", function (up, files) {
        $.each(files, function (i, file) {
            if ((typeof file.deleteUrl !== "undefined") && (file.deleteUrl != "")) {
                $.ajax({
                    url: file.deleteUrl, 
                    type: "DELETE",
                    dataType: "json"
                }).done(function (data, textStatus, jqXHR) {
                    if (data.success != true) {
                        // Add error handling.
                    }
                });
            }
        });
    });


    // After a file was uploaded we extend the internal file class in the plupload.files array with a delete url.
    uploader.bind('FileUploaded', function (up, files, result) {
        var remoteFiles = JSON.parse(result.response).files;
        if (!$.isArray(files)) files = [files];
        if ((typeof remoteFiles === "undefined") || (remoteFiles.length == 0)) {
            files[0].loaded = 0; // reset all progress
            files[0].status = plupload.FAILED; // set failed status
            uploader.trigger('Error', { code: plupload.HTTP_ERROR, message: "Internal Server Error", file: files[0], response: result.response, status: 500, responseHeaders: "" });
            return;
        }
        $.each(files, function (i, file) {
            file.deleteUrl = remoteFiles[i].deleteUrl;
            file.fileUrl = remoteFiles[i].fileUrl;
            file.thumbnail = remoteFiles[i].thumbnail;
            attachColorbox(file.id, file.fileUrl) // Use colorbox to show the original image
        });
    });


    // We do not use the file added event but if you need to manipulate the dom, give PlUpload a little time to add the files to the list
    uploader.bind("FilesAdded", function (up, files) {
        setTimeout(function () {
            $.each(files, function (i, file) {
            });
        }, 50);
    });


    // Load existing files, if any.
    $.ajax({
        url: backloadController,
        type: "GET",
        dataType: "json"
    }).done(function (data, textStatus, jqXHR) {
        var upFiles = data.files;
        var files = [];
        for (var i = 0; i < upFiles.length; i++) {
            var file = new plupload.File("", upFiles[i].name, upFiles[i].size);
            file.percent = upFiles[i].percent + "%";
            file.name = upFiles[i].name;
            file.loaded = upFiles[i].size;
            file.size = upFiles[i].size;
            file.origSize = upFiles[i].size;
            file.status = plupload.DONE;
            file.type = upFiles[i].type;
            file.thumbnail = upFiles[i].thumbnail;
            file.fileUrl = upFiles[i].fileUrl;
            file.deleteUrl = upFiles[i].deleteUrl;
            files.push(file);
        }
        if (uploader) uploader.addFile(files);
        // PlUpload needs some time to insert the nodes. We must add the thumbnail images by hand,
        // because PlUpload does usually not handle existing files and does not show thumbnails for those files.
        setTimeout(function () {
            $.each(files, function (i, file) {
                var $thumb = $('li#' + file.id + ' div.plupload_file_thumb');
                $thumb.html('<img src="' + file.thumbnail + '" title="Existing file, click me!" />');
                attachColorbox(null, file.fileUrl, $thumb);  // Optional: Use colorbox to show the original image on click
            });
        }, 50);
    });

    function attachColorbox(id, url, $thumb) {
        if (!$thumb) var $thumb = $('li#' + id + ' div.plupload_file_thumb');
        $thumb.colorbox({ href: url }); // attach colorbox
    }
});