Template.maskDateInput.rendered = function () {
    $(".mask_date").mask("9999/99/99");
};

Template.maskPhoneInput.rendered = function () {
    $(".mask_phone").mask("(999) 999-9999");
};

Template.maskSerialNumInput.rendered = function () {
    $(".mask_serialNumber").mask("9999-9999-99");
};

Template.maskProductNumInput.rendered = function () {
    $(".mask_productNumber").mask("aaa-9999-a");
};
