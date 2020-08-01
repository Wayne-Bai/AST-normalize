(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"SL":[{"name":"SL","_from":"1935","_to":"1942","type":"-","in":"Jun","on":"1","at":"0:00","_save":"0:40","letter":"SLST"},{"name":"SL","_from":"1935","_to":"1942","type":"-","in":"Oct","on":"1","at":"0:00","_save":"0","letter":"WAT"},{"name":"SL","_from":"1957","_to":"1962","type":"-","in":"Jun","on":"1","at":"0:00","_save":"1:00","letter":"SLST"},{"name":"SL","_from":"1957","_to":"1962","type":"-","in":"Sep","on":"1","at":"0:00","_save":"0","letter":"GMT"}]},
        zones: {"Africa/Freetown":[{"name":"Africa/Freetown","_offset":"-0:53:00","_rule":"-","format":"LMT","_until":"1882"},{"name":"Africa/Freetown","_offset":"-0:53:00","_rule":"-","format":"FMT","_until":"1913 Jun"},{"name":"Africa/Freetown","_offset":"-1:00","_rule":"SL","format":"%s","_until":"1957"},{"name":"Africa/Freetown","_offset":"0:00","_rule":"SL","format":"%s","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);