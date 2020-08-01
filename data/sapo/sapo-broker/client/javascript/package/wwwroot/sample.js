var _jsBridge = new jsBridge();
function jsTestInit()
{
	// This are the available channels
	var publishChannels = new Array("/topic/foo", "/topic/xml");
	var subscribeChannels = new Array("/topic/foo","/topic/system", "/topic/json", "/blogs/post");

	// Add available channels to subscription and publication select elements
	var channelsToSubscribe = document.getElementById('channelsToSubscribe');
	var publicationChannels = document.getElementById('publicationChannels');
	
	for( var idx in publishChannels)
	{
		addOptionToSelectElement(publicationChannels, publishChannels[idx], publishChannels[idx]);
	}
	
	for( var idx in subscribeChannels)
	{
		addOptionToSelectElement(channelsToSubscribe, subscribeChannels[idx], subscribeChannels[idx]);
	}
	

	var receivedMessagesList = new Array();
	var receivedMessagesListIdx = -1;
	var receivedMessages=document.getElementById('receivedMessages');

	// Add subscription logic
	var subscribeChannels = document.getElementById('subscribeChannels');
	subscribeChannels.onclick = function(msg){
		var subscribedChannels = document.getElementById('subscribedChannels');
		// Find new subscriptions		
		var subscribeChannels = document.getElementById('channelsToSubscribe');
		
		switchSelectedElements(subscribeChannels, subscribedChannels, function(channelName){
			getBridge().subscribe(channelName, function(msg) {
				var MAX_ITEMS = 10;
				++receivedMessagesListIdx;
				if(receivedMessagesListIdx == MAX_ITEMS)
					receivedMessagesListIdx = 0;
				//sampleAddHtml(msg);
				
				receivedMessagesList[ receivedMessagesListIdx ] = msg;

				var newText = "";
				if(receivedMessagesListIdx +1 != MAX_ITEMS)
				{
					var receivedLen = receivedMessagesList.length;
					for( var i = receivedMessagesListIdx+1 ; i != receivedLen ; ++i)
					{
						newText =  receivedMessagesList[i].channel + ": " + receivedMessagesList[i].payload +"\n" + newText;
					}
				}
				for( var i = 0; i != receivedMessagesListIdx+1; ++i)
				{
					newText = receivedMessagesList[i].channel + ": " + receivedMessagesList[i].payload +"\n" + newText;
				}
				
				receivedMessages.value = newText;
			});
		});
		

		return false;
	}

	// Add unsubscription logic
	var unsubscribeChannels = document.getElementById('unsubscribeChannels');
	unsubscribeChannels.onclick = function(msg){
		var subscribedChannels = document.getElementById('subscribedChannels');
		// Find new subscriptions		
		var subscribeChannels = document.getElementById('channelsToSubscribe');
		
		switchSelectedElements(subscribedChannels, subscribeChannels, function(channelName){
			getBridge().unsubscribe(channelName);
		});
		

		return false;
	}
	
	// Add publication logic
	element = document.getElementById('publishBtn');
	element.onclick = function(msg){
		var publicationChannels	= document.getElementById('publicationChannels');
		var publishText = document.getElementById('publishText');

		getBridge().publish(publicationChannels.value, publishText.value);
		return false;
	}
	
	_jsBridge.connect();
}


function sampleAddHtml(message)
{
	//var data = response.evalJSON()
	//var htmlPlaceholder = document.getElementById('htmlContent');
	//htmlPlaceholder.innerHTML = message.data.data.
}



function getBridge()
{
	if(!_jsBridge.connected)
		_jsBridge.connect();
	return _jsBridge;
}


// user interface auxiliary functions


function addOptionToSelectElement(selectElement, optionValue, optionText)
{	
	selectElement.options[selectElement.length] = new Option(optionValue, optionText);
}

function removeOptionFromSelectElement(selectElement, optionValue)
{
	for(var idx = 0; idx < selectElement.length; ++idx)
	{
		if(selectElement.options[idx].value === optionValue)
		{
			selectElement.remove(idx);
			return;
		}
	}	
	/*for(var idx in selectElement.options)
	{
		if(selectElement.options[idx].value === optionValue)
		{
			selectElement.remove(idx);
			return;
		}
	}*/
}

// onChange signature: onChange(valueOfOption)
function switchSelectedElements(fromSelectElement, toSelectElement, onChange)
{
	var newSubscriptions = new Array();
	for(var idx = 0; idx < fromSelectElement.length; ++idx)
	{
		if(fromSelectElement.options[idx].selected)
		{
			newSubscriptions[newSubscriptions.length] = fromSelectElement.options[idx].value;
			// Add selected channel to the correspondent list
			addOptionToSelectElement(toSelectElement, fromSelectElement.options[idx].value, fromSelectElement.options[idx].value);
		}
	}
	
	for( var idx in newSubscriptions)
	{
		// perform action
		onChange(newSubscriptions[idx]);
		
		// Remove elements from original select element
		removeOptionFromSelectElement(fromSelectElement, newSubscriptions[idx]);
	}
}

window.onload = jsTestInit;
