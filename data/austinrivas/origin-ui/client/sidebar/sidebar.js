Template.sidebarCalendar.rendered = function () {
    if ($(".jq-datepicker").length > 0) {
        $(".jq-datepicker").datepicker({
            showOtherMonths: true,
            selectOtherMonths: true,
            prevText: "",
            nextText: ""
        });
    }
};

Template.sidebarFileUpload.rendered = function () {
    $(".pl-sidebar").each(function () {
        var $el = $(this);
        $el.pluploadQueue({
            runtimes: 'html5,gears,flash,silverlight,browserplus',
            url: 'js/plupload/upload.php',
            max_file_size: '10mb',
            chunk_size: '1mb',
            unique_names: true,
            resize: {width: 320, height: 240, quality: 90},
            filters: [
                {title: "Image files", extensions: "jpg,gif,png"},
                {title: "Zip files", extensions: "zip"}
            ],
            flash_swf_url: 'js/plupload/plupload.flash.swf',
            silverlight_xap_url: 'js/plupload/plupload.silverlight.xap'
        });
        $(".plupload_header").remove();
        var upload = $el.pluploadQueue();
        if ($el.hasClass("pl-sidebar")) {
            $(".plupload_filelist_header,.plupload_progress_bar,.plupload_start").remove();
            $(".plupload_droptext").html("<span>Drop files to upload</span>");
            $(".plupload_progress").remove();
            $(".plupload_add").text("Or click here...");
            upload.bind('FilesAdded', function (up, files) {
                setTimeout(function () {
                    up.start();
                }, 500);
            });
            upload.bind("QueueChanged", function (up) {
                $(".plupload_droptext").html("<span>Drop files to upload</span>");
            });
            upload.bind("StateChanged", function (up) {
                $(".plupload_upload_status").remove();
                $(".plupload_buttons").show();
            });
        } else {
            $(".plupload_progress_container").addClass("progress").addClass('progress-striped');
            $(".plupload_progress_bar").addClass("bar");
            $(".plupload_button").each(function () {
                if ($(this).hasClass("plupload_add")) {
                    $(this).attr("class", 'btn pl_add btn-primary').html("<i class='icon-plus-sign'></i> " + $(this).html());
                } else {
                    $(this).attr("class", 'btn pl_start btn-success').html("<i class='icon-cloud-upload'></i> " + $(this).html());
                }
            });
        }
    });
};
