function toggle(element) {
    var Dom = YAHOO.util.Dom,
        SELECTED = 'selected',
        ret = false;

    if(Dom.hasClass(element, SELECTED)) {
        Dom.removeClass(element, SELECTED);
    } else {
        Dom.addClass(element, SELECTED);
        ret = true;
    }
    return ret;
}