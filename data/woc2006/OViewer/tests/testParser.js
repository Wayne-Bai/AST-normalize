define(function(require, exports, module){
    var parser = require('../public/js/module/objects/parser');
    return {
        run: function(){

            test('test group 1: normal',function(){
                var line = '36,192,16842,1,0';
                var result = parser.parseObject(line);
                deepEqual(result,{
                    x: 36,
                    y: 192,
                    offset: 16842,
                    type: 1,
                    newCombo: false,
                    soundType: 0
                },'short format');

                line = '36,192,16842,5,0,0:0:0:0:';
                result = parser.parseObject(line);
                deepEqual(result,{
                    x: 36,
                    y: 192,
                    offset: 16842,
                    type: 1,
                    newCombo: true,
                    soundType: 0,
                    sampleSet: 0,
                    additionSampleSet: 0,
                    customSample: 0,
                    volume: 0,
                    sampleFile: ''
                },'long format');

                line = '36, 192, 16842, 5, 0, 0: 0: 0: 0:';
                result = parser.parseObject(line);
                deepEqual(result,{
                    x: 36,
                    y: 192,
                    offset: 16842,
                    type: 1,
                    newCombo: true,
                    soundType: 0,
                    sampleSet: 0,
                    additionSampleSet: 0,
                    customSample: 0,
                    volume: 0,
                    sampleFile: ''
                },'long format with space');

                line = '36,192,16842,5,0,0:0:0';
                result = parser.parseObject(line);
                deepEqual(result,{
                    x: 36,
                    y: 192,
                    offset: 16842,
                    type: 1,
                    newCombo: true,
                    soundType: 0,
                    sampleSet: 0,
                    additionSampleSet: 0,
                    customSample: 0,
                    volume: 0,
                    sampleFile: ''
                },'old long format');

                line = '36,192,16842,5,4,0:0:0:70:a.ogg';
                result = parser.parseObject(line);
                deepEqual(result,{
                    x: 36,
                    y: 192,
                    offset: 16842,
                    type: 1,
                    newCombo: true,
                    soundType: 4,
                    sampleSet: 0,
                    additionSampleSet: 0,
                    customSample: 0,
                    volume: 70,
                    sampleFile: 'a.ogg'
                },'complex long format');

                line = '36,192,16842,';
                result = parser.parseObject(line);
                deepEqual(result, null,'wrong format');
            });

        /*    test('test group 2: slider',function(){

            });*/

            test('test group 3: spinner', function(){
                var line = '36,192,16842,8,0,17000';
                var result = parser.parseObject(line);
                deepEqual(result,{
                    x: 36,
                    y: 192,
                    offset: 16842,
                    endTime: 17000,
                    type: 8,
                    newCombo: false,
                    soundType: 0
                },'short format');

                line = '36,192,16842,12,0,17000,0:0:0:0:';
                result = parser.parseObject(line);
                deepEqual(result,{
                    x: 36,
                    y: 192,
                    offset: 16842,
                    endTime: 17000,
                    type: 8,
                    newCombo: true,
                    soundType: 0,
                    sampleSet: 0,
                    additionSampleSet: 0,
                    customSample: 0,
                    volume: 0,
                    sampleFile: ''
                },'long format');

                line = '36,192,16842,12,8,14000,0:0:0:0:sound.wav';
                result = parser.parseObject(line);
                deepEqual(result,{
                    x: 36,
                    y: 192,
                    offset: 16842,
                    endTime: 16842,
                    type: 8,
                    newCombo: true,
                    soundType: 8,
                    sampleSet: 0,
                    additionSampleSet: 0,
                    customSample: 0,
                    volume: 0,
                    sampleFile: 'sound.wav'
                },'wrong format');
            });

        /*    test('test group 4: hold', function(){

            });

            test('test group 5: timing',function(){

            });

            test('test group 6: event',function(){

            })*/

        }
    }
})