/*
	Fill in only the 5-digit zip code into the ZIP code field.

	Assuming:
	var liveaddress = $.LiveAddress(...);
*/

liveaddress.on("AddressAccepted", function(event, data, previousHandler) {
	var zipField = data.address.getDomFields()['zipcode'];
	zipField.value = data.response.chosen ? data.response.chosen.components.zipcode : zipField.value;
	previousHandler(event, data);
});