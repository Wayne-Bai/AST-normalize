var button1 = Ti.UI.createButton({
    title: 'legacy network',
    top: 20,
    left: 20
});
button1.addEventListener('click', function(e) {
    Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_NETWORK;
    Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
    Ti.Geolocation.Android.manualMode = false;
});
win.add(button1);

var button2 = Ti.UI.createButton({
    title: 'legacy gps',
    top: 70,
    left: 20
});
button2.addEventListener('click', function(e) {
    Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
    Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
    Ti.Geolocation.Android.manualMode = false;
});
win.add(button2);

var button3 = Ti.UI.createButton({
    title: 'simple low',
    top: 120,
    left: 20
});
button3.addEventListener('click', function(e) {
    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_LOW;
    Ti.Geolocation.Android.manualMode = false;
});
win.add(button3);

var button4 = Ti.UI.createButton({
    title: 'simple high',
    top: 170,
    left: 20
});
button4.addEventListener('click', function(e) {
    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH;
    Ti.Geolocation.Android.manualMode = false;
});
win.add(button4);

var button5 = Ti.UI.createButton({
    title: 'manual network',
    top: 20,
    right: 20
});
button5.addEventListener('click', function(e) {
    Ti.Geolocation.Android.removeLocationProvider(providerPassive);
    Ti.Geolocation.Android.removeLocationProvider(providerGps);
    Ti.Geolocation.Android.addLocationProvider(providerNetwork);
    Ti.Geolocation.Android.manualMode = true;
});
win.add(button5);

var button6 = Ti.UI.createButton({
    title: 'manual network+gps',
    top: 70,
    right: 20
});
button6.addEventListener('click', function(e) {
    Ti.Geolocation.Android.removeLocationProvider(providerPassive);
    Ti.Geolocation.Android.addLocationProvider(providerNetwork);
    Ti.Geolocation.Android.addLocationProvider(providerGps);
    Ti.Geolocation.Android.manualMode = true;
});
win.add(button6);

var button7 = Ti.UI.createButton({
    title: 'manual gps',
    top: 120,
    right: 20
});
button7.addEventListener('click', function(e) {
    Ti.Geolocation.Android.removeLocationProvider(providerPassive);
    Ti.Geolocation.Android.removeLocationProvider(providerNetwork);
    Ti.Geolocation.Android.addLocationProvider(providerGps);
    Ti.Geolocation.Android.manualMode = true;
});
win.add(button7);

var button8 = Ti.UI.createButton({
    title: 'gps rule on',
    top: 170,
    right: 20
});
button8.addEventListener('click', function(e) {
    Ti.Geolocation.Android.addLocationRule(gpsRule);
});
win.add(button8);

var button9 = Ti.UI.createButton({
    title: 'gps rule off',
    top: 170,
    right: 110
});
button9.addEventListener('click', function(e) {
    Ti.Geolocation.Android.removeLocationRule(gpsRule);
});
win.add(button9);
