var updatedLocationLabel = Titanium.UI.createLabel({
    text:'Updated Location',
    font:{fontSize:'12dip', fontWeight:'bold'},
    color:'#111',
    top:240,
    left:10,
    height:15,
    width:300
});
win.add(updatedLocationLabel);

var updatedLocation = Titanium.UI.createLabel({
    text:'Updated Location not fired',
    font:{fontSize:'12dip'},
    color:'#444',
    top:260,
    left:10,
    height:15,
    width:300
});
win.add(updatedLocation);

var updatedLatitude = Titanium.UI.createLabel({
    text:'',
    font:{fontSize:'12dip'},
    color:'#444',
    top:280,
    left:10,
    height:15,
    width:300
});
win.add(updatedLatitude);

var updatedLocationAccuracy = Titanium.UI.createLabel({
    text:'',
    font:{fontSize:'12dip'},
    color:'#444',
    top:300,
    left:10,
    height:15,
    width:300
});
win.add(updatedLocationAccuracy);

var updatedLocationTime = Titanium.UI.createLabel({
    text:'',
    font:{fontSize:'12dip'},
    color:'#444',
    top:320,
    left:10,
    height:15,
    width:300
});
win.add(updatedLocationTime);

var reverseGeo = Titanium.UI.createLabel({
    text:'',
    font:{fontSize:'12dip'},
    color:'#444',
    top:340,
    left:10,
    height:15,
    width:300
});
win.add(reverseGeo);
