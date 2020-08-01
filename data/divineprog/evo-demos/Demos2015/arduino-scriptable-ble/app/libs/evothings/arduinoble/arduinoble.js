/*
File: arduinoble.js
Author: Mikael Kindborg
Description: Functions for controlling an Arduino via a BLE shield.

Example of use:

     evothings.arduinoble.connect(
     	'ArduinoBLE', // Name of BLE shield.
         function(device)
         {
         	console.log('connected!');
         	monitorAnalogPin();
         },
         function(errorCode)
         {
         	console.log('Error: ' + errorCode);
         });

	function monitorAnalogPin()
	{
		evothings.arduinoble.startAnalogRead(0, function(value) {
			console.log('Value of pin 2 is: ' + value);
		});
	}
*/

// Load EasyBLE library.
evothings.loadScript('libs/evothings/easyble/easyble.js');

evothings.arduinoble = (function()
{
	// Exported public object.
	var arduinoble = {};

	// Internal functions and variables.
	var internal = {};

	// Connected device.
	internal.device = null;

	// Flag that tracks if notifications are enabled.
	internal.notificationsEnabled = false;

	// Digital pins monitored.
	internal.digitalPinCallbacks = {};

	// Analog pins monitored.
	internal.analogPinCallbacks = {};

	// Send as first byte in a BLE message.
	var MAGIC_HEADER_BYTE = 42;

	/**
	 * Stops any ongoing scan and disconnects all devices.
	 */
	arduinoble.disconnect = function()
	{
		evothings.easyble.stopScan();
		evothings.easyble.closeConnectedDevices();
	};

	/**
	 * Connect to a BLE-shield.
	 * @param deviceName BLE name of the Arduino
	 * @param win Success callback: win()
	 * @param fail Error callback: fail(error)
	 */
	arduinoble.connect = function(deviceName, win, fail)
	{
		evothings.easyble.startScan(
			function(device)
			{
				if (device.name == deviceName)
				{
					internal.device = device;
					evothings.easyble.stopScan();
					internal.connectToDevice(device, win, fail);
				}
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	 * Set a pin to OUTPUT.
	 */
	arduinoble.pinModeOutput = function(pin)
	{
		// MagicByte, PayloadSize, 'O', PinNumber
		internal.writeDataArray(new Uint8Array([MAGIC_HEADER_BYTE, 2, 79, pin]));
	};

	/**
	 * Set a pin to INPUT.
	 */
	arduinoble.pinModeInput = function(pin)
	{
		// MagicByte, PayloadSize, 'I', PinNumber
		internal.writeDataArray(new Uint8Array([MAGIC_HEADER_BYTE, 2, 73, pin]));
	};

	/**
	 * Digital write of pin to LOW.
	 */
	arduinoble.digitalWriteLow = function(pin)
	{
		// MagicByte, PayloadSize, 'L', PinNumber
		internal.writeDataArray(new Uint8Array([MAGIC_HEADER_BYTE, 2, 76, pin]));
	};

	/**
	 * Digital write of pin to HIGH.
	 */
	arduinoble.digitalWriteHigh = function(pin)
	{
		// MagicByte, PayloadSize, 'H', PinNumber
		internal.writeDataArray(new Uint8Array([MAGIC_HEADER_BYTE, 2, 72, pin]));
	};

	/**
	 * Enable digital read for pin.
	 */
	arduinoble.startDigitalRead = function(pin, callback)
	{
		internal.enableNotifications();
		internal.digitalPinCallbacks[pin] = callback;
		// MagicByte, PayloadSize, 'R', PinNumber, Enable
		internal.writeDataArray(new Uint8Array([MAGIC_HEADER_BYTE, 3, 82, 0, 1]));
	};

	/**
	 * Disable digital read for pin.
	 */
	arduinoble.stopDigitalRead = function(pin)
	{
		internal.digitalPinCallbacks[pin] = null;
		// MagicByte, PayloadSize, 'R', PinNumber, Disable
		internal.writeDataArray(new Uint8Array([MAGIC_HEADER_BYTE, 3, 82, 0, 0]));
	};

	/**
	 * Enable analog read for pin.
	 */
	arduinoble.startAnalogRead = function(pin, callback)
	{
		internal.enableNotifications();
		internal.analogPinCallbacks[pin] = callback;
		// MagicByte, PayloadSize, 'A', PinNumber, Enable
		internal.writeDataArray(new Uint8Array([MAGIC_HEADER_BYTE, 3, 65, 0, 1]));
	};

	/**
	 * Disable analog read for pin.
	 */
	arduinoble.stopAnalogRead = function(pin)
	{
		internal.analogPinCallbacks[pin] = null;
		// MagicByte, PayloadSize, 'A', PinNumber, Disable
		internal.writeDataArray(new Uint8Array([MAGIC_HEADER_BYTE, 3, 65, 0, 0]));
	};

	internal.writeDataArray = function(uint8array, win, fail)
	{
		internal.device.writeCharacteristic(
			'713d0003-503e-4c75-ba94-3148f18d941e',
			uint8array,
			function() {
				console.log('writeDataArray success');
				win && win();
			},
			function(error) {
				console.log('writeDataArray error: ' + error);
				fail && fail(error);
			});
	};

	internal.enableNotifications = function(win, fail)
	{
		console.log('Enabling notifications');

		if (internal.notificationsEnabled) { return }

		internal.notificationsEnabled = true;

		var success = true;

		// Turn notifications on.
		internal.device.writeDescriptor(
			'713d0002-503e-4c75-ba94-3148f18d941e',
			'00002902-0000-1000-8000-00805f9b34fb',
			new Uint8Array([1,0]),
			function()
			{
				console.log('writeDescriptor success');
			},
			function(errorCode)
			{
				success = false;
				console.log('writeDescriptor error: ' + errorCode);
				fail && fail('writeDescriptor error: ' + errorCode);
			});

		// Start reading notifications.
		internal.device.enableNotification(
			'713d0002-503e-4c75-ba94-3148f18d941e',
			function(data)
			{
				internal.notificationCallback(data);
			},
			function(errorCode)
			{
				success = false;
				console.log('enableNotification error: ' + errorCode);
				fail && fail('enableNotification error: ' + errorCode);
			});

			success && win && win();
	};

	internal.notificationCallback = function(data)
	{
		// Read input value.
		var buf = new Uint8Array(data);
		var type = buf[2];
		var pin = buf[3];
		var value = buf[4] | (buf[5] << 8);

		// Type 'R' (digital read).
		if (82 == type)
		{
			var callback = internal.digitalPinCallbacks[pin];
			callback && callback(value)
		}
		// Type 'A' (analog read).
		else if (65 == type)
		{
			var callback = internal.analogPinCallbacks[pin];
			callback && callback(value)
		}
	};

	internal.connectToDevice = function(device, win, fail)
	{
		device.connect(
			function(device)
			{
				// Get services info.
				internal.getServices(device, win, fail);
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	internal.getServices = function(device, win, fail)
	{
		device.readServices(
			null, // null means read info for all services
			function(device)
			{
				// Call success callback.
				win();
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	return arduinoble;
})();
