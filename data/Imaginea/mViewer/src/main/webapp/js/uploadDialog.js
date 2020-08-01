/*
 * Copyright (c) 2011 Imaginea Technologies Private Ltd.
 * Hyderabad, India
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Author: Srinath Anantha
 */

YUI.add('upload-dialog', function (Y) {
    YUI.namespace('com.imaginea.mongoV');
    var MV = YUI.com.imaginea.mongoV;
    var uploadDialog = null;
    var newFilesUploaded = false;

    MV.showUploadDialog = function (form) {
        newFilesUploaded = false;
        YAHOO.util.Dom.removeClass(form, "yui-pe-content");

        if (!uploadDialog) {
            uploadDialog = new YAHOO.widget.SimpleDialog(form, {
                width:"40em",
                fixedcenter:true,
                visible:false,
                draggable:true,
                zIndex:2000,
                effect:{
                    effect:YAHOO.widget.ContainerEffect.SLIDE,
                    duration:0.25
                },
                close:false,
                constraintoviewport:true,
                buttons:[
                    {
                        text:"Close",
                        handler:hideUploadDialog
                    }
                ]
            });
        }

        uploadDialog.setHeader("File Upload");
        uploadDialog.render();
        uploadDialog.show();

        // Initialize the jQuery File Upload widget:
        $('#fileupload').fileupload({
            url:MV.URLMap.insertFile(),
            sequentialUploads:true
        });

        $('#fileupload').fileupload({
            // Callback for successful uploads:
            done:function (e, data) {
                var that = $(this).data('fileupload'),
                    template,
                    preview;
                if (data.context) {
                    data.context.each(function (index) {
                        var file = ($.isArray(data.result) &&
                            data.result[index]) || {error:'emptyResult'};
                        if (file.error) {
                            that._adjustMaxNumberOfFiles(1);
                        }
                        that._transition($(this)).done(
                            function () {
                                var node = $(this);
                                template = that._renderDownload([file])
                                    .css('height', node.height())
                                    .replaceAll(node);
                                that._forceReflow(template);
                                that._transition(template).done(
                                    function () {
                                        data.context = $(this);
                                        that._trigger('completed', e, data);
                                    }
                                );
                            }
                        );
                    });
                } else {
                    template = that._renderDownload(data.result)
                        .appendTo(that.options.filesContainer);
                    that._forceReflow(template);
                    that._transition(template).done(
                        function () {
                            data.context = $(this);
                            that._trigger('completed', e, data);
                        }
                    );
                }
                newFilesUploaded = true;
            }
        });

        // Clear table body
        $('#fileupload-body').empty();
    };

    function hideUploadDialog() {
        if(uploadDialog) {
            $('#fileupload').fileupload('destroy');
            uploadDialog.cancel();
            if (newFilesUploaded == true) {
                setTimeout(function () {
                    Y.one("#" + MV.getBucketElementId(MV.appInfo.currentBucket)).simulate("click");
                }, 250);
            }
            uploadDialog = null;
        }
    }

    var sm = MV.StateManager;

    sm.subscribe(hideUploadDialog, [sm.events.actionTriggered]);

}, '3.3.0', {
    requires:[]
});

