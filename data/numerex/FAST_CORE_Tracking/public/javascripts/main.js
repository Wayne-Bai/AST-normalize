var prevSelectedRow;
var prevSelectedRowClass;
var currSelectedDeviceId;
var selectedDeviceId;
var devices = []; // JS devices model
var readings = []; //JS readings model
var grp_id;
var fullScreenMap = false;
var infowindow;

var dataLoaded = false;

var dragPoint;

var page = document.location.href.split("/")[3];
var action = document.location.href.split("/")[4];

// which map engine to use - openlayers or google
var map;

var zoom = 15;

var cookieZoom = get_cookie("zvalue");
if(parseInt(cookieZoom) > 0)
{
    zoom = parseInt(cookieZoom);
}

function getClassName(obj)
{
    var c = obj.constructor.toString();
    var start = c.indexOf('function ') + 9;
    var stop = c.indexOf('(');
    c = c.substring(start, stop);
    return c;
}

function loadMap(mapEngine, mapDiv) 
{
    map = new Map(mapEngine, mapDiv);
    map.setCenter(new LatLon(37.0625, -95.677068), zoom);

    map.addEventListener('bubble_closed', function(event)
    {
        selectedDeviceId = false;
        if(prevSelectedRow)
        {
            highlightRow(0);
        }
    });

    map.addEventListener('view_changed', function(event)
    {
        dragPoint = map.getCenter();
        zoom = map.getZoom();

        if(page == 'reports')        
        {
            set_cookie("zvalue", zoom); 
        }
    });

    map.addEventListener('marker_clicked', function(markerId, point, infoHTML)
    {
        map.panTo(point);
        if(infoHTML != null)
        {
            map.showBubble(point, infoHTML);
        }
        if(markerId != null)
        {
            highlightRow(markerId);
        }
    });

    switch(page)
    {
        case "home":
        case "admin":
        case "devices":
            getRecentReadings(true, "from_load");
            break;
        case "reports":
            if(action == 'trip')
            {
                // see reports.js
                displayTripOverview();
            }
            else
            {
                getReportBreadcrumbs();
            }
            break;
    }
}

function set_cookie(name, value, exp_y, exp_m, exp_d, path, domain, secure)
{
    var cookie_string = name + "=" + escape ( value );
    if(exp_y)
    {
        var expires = new Date(exp_y, exp_m, exp_d);
        cookie_string += "; expires=" + expires.toGMTString();
    }
    cookie_string += "; path=/";
    document.cookie = cookie_string;
}

function get_cookie(cookie_name)
{
    var results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');  
    if(results)
    {
        return (unescape(results[2]));
    }
    else
    {
        return null;
    }
}

// Display all devices on overview page
function getRecentReadings(redrawMap, id)
{              
    $("updating").style.visibility = 'visible';

    var bounds = new Bounds();
    var temp;

    dataLoaded = false;   

    if(id != "from_load") // else part will execute only on page load & For refresh the "if" part get excecuted.
    {             

        GDownloadUrl("/readings/recent/" + id + ".json", function(data, responseCode)
        {
            eval("var devices = " + data + ";");

            map.clearOverlays();

            for(var i = 0; i < devices.length; i++)
            {              
                if(devices[i] != null)
                {
                    device = devices[i];

                    dataLoaded = true;
                      
                    updateDeviceDisplay(device, bounds); // update the device summary at left
                }
            }     

            $("updating").style.visibility = 'hidden';        

            // continue if there is data
            if(ids.length == 0)
            {
                if(dragPoint)
                {
                    map.setCenter(dragPoint, zoom);
                }
                else
                {
                    map.setCenter(new LatLon(37.0625, -95.677068), 3);          
                }

                return;        
            }

            checkIfDataLoaded(redrawMap, devices, bounds); //checking the no data flag varable & setting appropriate zoom level
        });
    }
    else
    {       
        if(devices[0] != null)                 
        {
            dataLoaded = true;                      
        }
     
        for(var i = 0; i < devices.length; i++)
        {   
            var device = devices[i];

            updateDeviceDisplay(device, bounds); // update the device summary at left
        }                                        

        checkIfDataLoaded(redrawMap, devices, bounds); //checking the no data flag varable & setting appropriate zoom level 

        $("updating").style.visibility = 'hidden';                            
    }          
}

// update the device summary at left
function updateDeviceDisplay(device, bounds)
{
    if(frm_index)
    {
        var row = $("row" + device.id);
        if(row && row.getElementsByTagName) 
        {
            var tds = row.getElementsByTagName("td");                
            tds[1].innerHTML = device.address;
            tds[2].innerHTML = device.status;
            tds[3].innerHTML = device.dt;
        }   
    }                           

    var point = new LatLon(device.lat, device.lng);                

    map.createMarker(device.id, point, getDeviceMarkerImageURL(device.icon_id), createDeviceHTML(device.id));

    bounds.extend(point);
}

// get the url for a marker image based on the icon id
function getDeviceMarkerImageURL(iconId)
{
    var markerIcons = new Array();
    markerIcons[1] = "ublip_marker.png";
    markerIcons[2] = "ublip_red.png";
    markerIcons[3] = "green_big.png";
    markerIcons[4] = "yellow_big.png";
    markerIcons[5] = "purple_big.png";
    markerIcons[6] = "dark_blue_big.png";
    markerIcons[7] = "grey_big.png";
    markerIcons[8] = "orange_big.png";

    if(iconId < 1 || iconId > 8)
    {
        iconId = 1;
    }

    var iconURL = "/icons/" + markerIcons[iconId];

    return iconURL;
}

// Determines which icon to display based on event or display numbered icon
function getBreadcrumbMarkerImageURL(index, obj)
{
    var event = obj.event;
    
    var iconURL = "";

    if(obj.start)
    {
        iconURL = "/icons/start_marker.png";
    }
    else if(obj.stop) 
    {
        iconURL = "/icons/stop_marker.png";
    }
    else if(event.indexOf('geofen') > -1 || event.indexOf('stop') > -1)
    {
        iconURL = "/icons/" + (index + 1) + "_red.png";
    }
    else
    {
        iconURL = "/icons/" + (index + 1) + ".png";
    }
    
    return iconURL;
}

//checking the no data flag varable & setting appropriate zoom level
function checkIfDataLoaded(redrawMap, devices, bounds)
{
    // defaults
    var newCenter = new LatLon(37.0625, -95.677068);
    var newZoom = 3;

    if(dataLoaded)
    { 
        // map data set, use current position as "new" default
        newCenter = map.getCenter();

        // if the user dragged the map, don't interrupt their viewing
        if(dragPoint)
        {
            newCenter = dragPoint;
            newZoom = zoom;
        }
        else
        {
            if(redrawMap == undefined || redrawMap == true)
            {      
                if(selectedDeviceId)
                {                  
                    // after refresh the map the info window will close.
                    // if you want info window to remain open, please comment out this statment.          
                    centerMapOnDevice(selectedDeviceId);

                    // since the above call pans to the device, we don't need to pan to the same point twice, so return
                    return;
                }
                else
                {
                    newCenter = bounds.getCenter();
                    newZoom = (devices.length > 1) ? map.getBoundsZoomLevel(bounds) : 15;
                }
            }
        }
    }

    // pan/zoom to new coords
    map.setCenter(newCenter, newZoom);
}

// Center map on device and show details
function centerMapOnDevice(deviceId)
{    
    selectedDeviceId = deviceId;

    var device = getDeviceById(deviceId);    

    var newCenter = new LatLon(device.lat, device.lng);

    if(dragPoint)
    {
        newCenter = dragPoint;
    }
     
    map.panTo(newCenter);       

    map.showBubble(new LatLon(device.lat, device.lng), createDeviceHTML(deviceId));
}

// Get a device object based on id
function getDeviceById(deviceId)
{
    for(var i = 0; i < devices.length; i++)
    {
        var device = devices[i];
        if(device.id == deviceId)
        {
            return device;
        }
    }
}

// Create html for selected device
function createDeviceHTML(id)
{
    var device = getDeviceById(id);
    
    var html = '<div class="dark_grey"><span class="blue_bold">' + device.name + '</span> was last seen at ' + '<br /><span class="blue_bold">' + device.address + '</span><br /><span class="blue_bold">' + device.dt + '</span><br />';
    
    if(device.note != '')
    {
        html += '<br /><strong>Note:</strong> ' + device.note + '<br/>';
    }
        
    html += '<br /><a href="javascript:map.setZoom(15);">Zoom in</a> | <a href="/reports/all/' + id + '">View details</a></div>';
    return html;
}

// Center map on reading and show details
function centerMapOnReading(id)
{    
    var reading = getReadingById(id);

    var point = new LatLon(reading.lat, reading.lng);
    map.panTo(point);
    map.showBubble(point, createReadingHTML(id));
}

// Get a reading based on id
function getReadingById(id)
{
    for(var i=0; i < readings.length; i++)
    {
        var reading = readings[i];
        if(reading.id == id)
        {
            return reading;
        }
    }
}

// Create html for selected reading
function createReadingHTML(id)
{
    var reading = getReadingById(id);
    var html = '<div class="dark_grey"><span class="blue_bold">' + reading.address + '<br />' + reading.dt + '</span><br />';
            
    if(reading.note != '')
    {
        html += '<br /><strong>Note:</strong> ' + reading.note + '<br/>';
    }
        
    return html;
}

// When a device is selected let's highlight the row and deselect the current
// Pass 0 to deselect all
function highlightRow(id)
{
    if(id == undefined)
    {
        return;
    }
        
    var row = document.getElementById("row" + id);
    
    // Set the previous state back to normal
    if(prevSelectedRow)
    {
        prevSelectedRow.className = prevSelectedRowClass;
    }
    
    // An id of 0 deselects all
    if(id > 0 && row != null)
    {        
        prevSelectedRow = row;
        prevSelectedRowClass = row.className;
        
        // Hihlight the current row
        row.className = 'selected_row';
    }
}

// Breadcrumb view for reports pages - client reports model is already populated
function getReportBreadcrumbs()
{
    for(var i = 0; i < readings.length; i++)
    {
        var id = readings[i].id;
        var point = new LatLon(readings[i].lat, readings[i].lng);
        
        map.createMarker(id, point, getBreadcrumbMarkerImageURL(i, readings[i]), createReadingHTML(id));
        
        if(i == 0)
        {
            map.setCenter(point, zoom);
            map.showBubble(point, createReadingHTML(id));
            highlightRow(id);
        }
    }
    
    // Display geofences if viewing geofence reports
    if(action == 'geofence' && geofences.length)
    {
        for(var i = 0; i < geofences.length; i++)
        {
            var bounds = geofences[i].bounds.split(',');
            var point = new LatLon(parseFloat(bounds[0]), parseFloat(bounds[1]));
            var radius = parseFloat(bounds[2]);

            map.drawGeofence(point, radius);
        }
    }
}

function createArrow(dir)
{
    var iconDir;
    var icon;

    if(spd == 0 || event_type == "exitgeofen_et51" || event_type == "entergeofen_et11")
    {
        iconDir = "none"    
    }
    else
    {
        var dirs = ["n", "ne", "e", "se", "s", "sw", "w", "nw", "n"];
        var dirNum = Math.floor((dir + 22.5) / 45); 
        iconDir = dirs[dirNum];
    }

    // where could this come from?
    var iconId = 0;

    // where is point defined? where is spd defined? where is alt defined? time? note?
    var iconURL = "/icons/arrows/" + iconDir + ".png";
    var iconHTML = "Latitude: " + point.lat() + "<br/>" + "Longitude: " + point.lng() + "<br/>" + "Speed: " + (spd / 10) * 1.15 + "<br/>" + "Altitude: " + alt + "<br/>" + "Time: " + time + "<br/>" + note;

    map.createMarker(iconId, point, iconURL, iconHTML);
}   
        
function createPast(point, event_type, spd) 
{   
    var iconURL;
    
    if(event_type == "exitgeofen_et51" || event_type == "entergeofen_et11")
    {
        // where is this defined?
        iconURL = alarmIcon;
    }
    else if (spd == 0)  
    {
        // where is this defined?
        iconURL = ParkedIcon;
    }   
    else
    {
        iconURL = "/icons/" + iconcount + ".png";
    }   

    // where could this come from?
    var iconId = 0;

    map.createMarker(iconId, point, iconURL);
}   


// Toggle between full map view or split table/map view
function toggleMap()
{
    var left = document.getElementById("left_panel");
    var right = document.getElementById("right_panel");
    var img = document.getElementById("toggler");
    var isIE = navigator.appName.indexOf("Microsoft Internet Explorer");
    
    if(fullScreenMap)
    {
        // Collapse map and display table
        left.style.visibility = 'visible';
        left.style.display = 'block';
        if(isIE > -1)
        {
            left.width = "50%";
        }
        else
        {
            left.width = "100%";
        }
        right.width = "50%";
        img.src = "/images/collapse.png";
        img.parentNode.title = "Expand map view";
        fullScreenMap = false;
    }
    else
    {
        // Expand map
        left.style.visibility = 'hidden';
        left.style.display = 'none';
        right.width = "100%";
        img.src = "/images/expand.png";
        img.parentNode.title = "Collapse map view";
        fullScreenMap = true;
    }   

    map.checkResize();
}
