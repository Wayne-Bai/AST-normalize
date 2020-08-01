PalmlistExample5Assistant = Class.create( ExampleAssistantBase, {
  fwl : {'launchToScene':'dividerlist'},
  setup : function($super) {
	$super();
		var attributes =
			    {
			      itemTemplate: 'palmlist-example-5/entry',
			      swipeToDelete: true,
			      reorderable: true,
			      itemsCallback: this.list.bind(this),
			      formatters:{display:this.formatNumber.bind(this),bob:this.formatName.bind(this)}
			    };
		this.model = {
   			columns: 3
		};
		this.controller.setupWidget('gridlist', attributes, this.model);
		// 	    Event.observe('gridlist', Mojo.Event.listTap, this.tapped.bindAsEventListener(this));
	},

	tapped: function(event) {
		//alert("TAPPED ELEMENT " + event.item);
		Mojo.Controller.stageController.pushScene('empty');
	},

	formatNumber: function(n, model) {
	  return n + "BIGNUMBER";
	},
	
	formatName: function(n, model) {
	  return n + "ert" + model.display;
	},
	
	//	  Mojo.Log.info("queried" + filter);
	list: function(widget, offset, count) {
	  var data = {
	    "list": [{"display":'123', 'bob': 'bob'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'123', 'bob': 'bob'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'}]
	  };          
	  	widget.mojo.setLength(data.list.length);
		widget.mojo.noticeUpdatedItems(offset, data.list.slice(offset, offset+count));
	}
});