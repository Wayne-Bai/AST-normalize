// EvoSensorTagServer.js

evo = {}

evo.SOCKETIO = require('socket.io')

evo.IO = evo.SOCKETIO.listen(6277)

evo.IO.sockets.on('connection', function(socket) 
{
	console.log('SensorDemo client connected')
	
	socket.on('disconnect', function ()
	{
		console.log('SensorDemo client disconnected')
    })

    socket.on('sensorTag.request', function(data)
	{
        console.log('SensorDemo request: ' + data.service)
        
		if ('readIrTemperature' == data.service)
		{
			// TODO: Add call to actual sensor API.
			// These are dummy values.
            var objectTemperature = 20
            var ambientTemperature = 10
			evo.IO.sockets.emit('sensorTag.response', 
			{
				callbackId: data.callbackId,
				params: [objectTemperature, ambientTemperature]
			})
		}
    })
})
                               