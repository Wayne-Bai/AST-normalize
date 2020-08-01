var SensorTag = require('sensortag')

var app = {}

app.connect = function()
{
    SensorTag.discover(function(sensor)
    {
        console.log('SensorTag discovered')
        sensor.connect(function()
        {
            console.log('SensorTag connected')
            sensor.discoverServicesAndCharacteristics(function()
            {
                console.log('Services discovered')
                app.sensor = sensor
                app.main()
            })
        })
    })
}

app.main = function()
{
    app.sensor.enableIrTemperature(function()
    {
	    app.sensor.readIrTemperature(function(ot, at)
        {
             console.log('Temp: ' + ot + ' ' + at)
             app.sensor.disconnect(function() { console.log('End') })
        })
    })
}

app.connect()
