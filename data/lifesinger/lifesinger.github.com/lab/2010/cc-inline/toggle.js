function toggle(element) {
    if(YAHOO.util.Dom.hasClass(element, 'selected')) {
        YAHOO.util.Dom.removeClass(element, 'selected');
        return false;
    } else {
        YAHOO.util.Dom.addClass(element, 'selected');
        return true;
    }
}