$(document).ready(function(){
    var messageTableBody, previewModal, previewModalTitle, previewModalBody;

    messageTableBody  = $("#message-table-body, #queue-table-body");
    previewModal      = $("#preview-modal");
    previewModalTitle = $("#preview-modal-title");
    previewModalBody  = $("#preview-modal-body");

    messageTableBody.on('click', '.preview', function(event){
        var href, title;

        event.preventDefault();

        href  = $(this).attr("href");
        title = $(this).attr("title");

        previewModalTitle.text(title);

        // load the url and show modal on success
        previewModalBody.load(href, function() {
            previewModal.modal("show");
        });
    });
});