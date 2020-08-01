require(['ext/jquery', 'ext/underscore', 'ext/backbone', 'template', 'todos'], function() {
    $(document).ready(function() {
        window.App = new TodoApp({ appendTo: $('body') });
    });
});