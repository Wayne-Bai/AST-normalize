var $ = require('jquery-browserify');

module.exports = function (unit, remote) {
    var values = [
        3 * 4 + 11 - 3,
        (((111*5)+44*99/555)+33)*0.5,
        Math.sin(Math.PI / 6)
    ];
    
    values.forEach(function (value, ix) {
        var finished = false;
        $('#calc-' + ix).click(function () {
            var tr = $(this).parents('tr');
            var val = tr.find('input.value').val();
            
            if (val === value.toString()) {
                tr.find('.ok').text('ok!');
                
                if (!finished) {
                    remote.addPoints(5);
                    finished = true;
                }
            }
            else {
                tr.find('.ok').text('not ok');
            }
        });
    });
};
