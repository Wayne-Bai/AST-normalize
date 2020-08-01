/*
 * Render a precompiled template on page load.
 */
document.addEventListener('DOMContentLoaded', function () {

    // Get the precompiled template.
    var footer = window.templates['assets/templates/footer.tmpl'];

    // Compile the template with locals.
    var html = footer({});

    // Insert the HTML.
    append('main', html);

});

/*
 * A helper to append HTML strings to the DOM.
 */
var append = function (target, html) {
    target = document.querySelector(target);
    var el = document.createElement('div');
    el.innerHTML = html;
    target.appendChild(el.firstChild);
};
