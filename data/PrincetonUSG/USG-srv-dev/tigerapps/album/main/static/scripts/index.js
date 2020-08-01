var numimages = 30;
var xC = 40.345748;
var yC = -74.655472;
var xd = 0.01;
var yd = 0.01;
var initialcenter = new google.maps.LatLng(xC,yC);
var initialbounds = new google.maps.LatLngBounds(new google.maps.LatLng(xC-xd, yC-yd), new google.maps.LatLng(xC+xd, yC+yd));
var map;
var shown = [];
var to_add;
var shownids = [];

function checkbounds() {
    if (initialbounds.contains(map.getCenter())) return;

    var c = map.getCenter();
    x = c.lng();
    y = c.lat();
    maxX = initialbounds.getNorthEast().lng();
    maxY = initialbounds.getNorthEast().lat();
    minX = initialbounds.getSouthWest().lng();
    minY = initialbounds.getSouthWest().lat();

    if (x < minX) x = minX;
    if (x > maxX) x = maxX;
    if (y < minY) y = minY;
    if (y > maxY) y = maxY;

    map.setCenter(new google.maps.LatLng(y, x));
}

function initialize() {
    var options = {
        zoom: 16,
        maxZoom: 22,
        minZoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        center: initialcenter,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map_canvas"), options);
    google.maps.event.addListener(map, 'center_changed', checkbounds);
    google.maps.event.addListener(map, 'idle', getimages);

    // to deal with csrf
    $('html').ajaxSend(function(event, xhr, settings) {
        function getCookie(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
        if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
            // Only send the token to relative URLs i.e. locally.
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        }
    });

    $('select[name="time"]').change(function() {
        getimages();
    });

    // Hide the alert on mouseover, after a given time period.
    setTimeout(function() {
        $('p#alert').hover(function() {
            $(this).slideUp();
        });
    }, 5000);

    // Handle permalink hash history.
    $.history.init(function(hash) {
        if (hash == "") return;
        showdetails(hash);
    });
}

function showphoto(that) {
    var maxsize = 80 + that.popularity;
    var height;
    var width;
    if (that.photo.width > that.photo.height) {
        width = maxsize;
        height = that.photo.height / (that.photo.width / maxsize);
    }
    else {
        height = maxsize;
        width = that.photo.width / (that.photo.height / maxsize);
    }

    var markerlocation = new google.maps.LatLng(that.location_x, that.location_y);
    var markerimage = new google.maps.MarkerImage(
        that.thumbnail,
        new google.maps.Size(width,height),
        new google.maps.Point(0,0),
        new google.maps.Point(Math.round(width/2),Math.round(height/2)),
        new google.maps.Size(width,height)
    );
    var marker = new google.maps.Marker({
        position : markerlocation,
        map : map,
        icon : markerimage
    });

    shown.push(marker);
    shownids.push(that.id);
    google.maps.event.addListener(marker, 'click', function() {
        showdetails(that.id);
    });
}

function getimages() {
    var currentbounds = map.getBounds();
    var pNE = currentbounds.getNorthEast();
    var pSW = currentbounds.getSouthWest();
    var xmin = pSW.lat();
    var ymin = pSW.lng();
    var xmax = pNE.lat();
    var ymax = pNE.lng();
    var zoom = map.getZoom();
    $.map(shown, function(marker) { marker.setMap(null) });

    shown = [];
    shownids= [];

    $.getJSON('api/photos.json', {
        xmin: xmin,
        xmax: xmax,
        ymin: ymin,
        ymax: ymax,
        num: numimages,
	zoom: zoom,
        time: $('select[name="time"]').val(),
    }, function(data) {
        if ("error" in data) {
            alert("Error: " + data.error);
            return;
        }
        $.each(data.photos, function() {
            showphoto(this);
        });
    });
}
