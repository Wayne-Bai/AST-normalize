$(function(){
 
    var tmpl,   // Main template HTML
    tdata = {};  // JSON data object that feeds the template
 
    // Initialise page
    var initPage = function() {
 
        // get our album name.
        var re = "/pages/album/([a-zA-Z0-9_-]+)";
        var results = new RegExp(re).exec(window.location.href);
        var album_name = results[1];
 
        // Load the HTML template
        $.get("/templates/album.html", function(d){
            tmpl = d;
        });

        var p = $.urlParam("page");
        var ps = $.urlParam("page_size");
        if (p < 0) p = 0;
        if (ps <= 0) ps = 1000;

        var qs = "?page=" + p + "&page_size=" + ps;
        var url = "/v1/albums/" + album_name + "/photos.json" + qs;

        // Retrieve the server data and then initialise the page  
        $.getJSON(url, function (d) {
            var photo_d = massage_album(d);
            $.extend(tdata, photo_d);
        });

        // When AJAX calls are complete parse the template 
        // replacing mustache tags with vars
        $(document).ajaxStop(function () {
            var renderedPage = Mustache.to_html( tmpl, tdata );
            $("body").html( renderedPage );
        })    
    }();
});


function massage_album(d) {
    if (d.error != null) return d;
    var obj = { photos: [] };

    var p = d.data.photos;
    var a = d.data.album_data;

    for (var i = 0; i < p.length; i++) {
        var url = "/albums/" + a.name + "/" + p[i].filename;
        obj.photos.push({ url: url, desc: p[i].description });
    }

    if (obj.photos.length > 0) obj.has_photos = obj.photos.length;
    return obj;
}


$.urlParam = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (!results)
    { 
        return 0; 
    }
    return results[1] || 0;
}