﻿function ReloadPage() {
    document.location.href = document.location.href;
}

$(document).ready(function () {
    $(".bulkActionSelectAll").click(function () {
        $('.bulkItemSelectCheckbox').attr('checked', '');
        return false;
    });
});

$(document).ready(function () {
    $(".bulkActionDeSelectAll").click(function () {
        $('.bulkItemSelectCheckbox').attr('checked', false);
        return false;
    });
});

$(document).ready(function () {
    $(".bulkActionbutton").click(function () {
        var action = $(".bulkActionDropdown").val();
        if (action != '') {

            var selected = new Array();
            $('.bulkItemSelectCheckbox:checked').each(function () {
                selected.push($(this).val());
            });
            var s = selected.join();
            if (s != '') 
            {
                UmbClientMgr.openModalWindow('plugins/SEOChecker/pages/dialogs/bulkaction.aspx?alias=' + action + '&ids=' + s, $(".bulkActionDropdown :selected").text(), true, 400, 300);
            }
        }
        return false;
    });
});