var Form=React.createClass({
    getInitialState: function() {
	return {values: {}};
    },
    Input: React.createClass({
	getInitialState: function() {
	    return {value: this.props.item.value};
	},
	render: function() {
	    return React.DOM.div({
		className: "form-group",
		children: [
		    React.DOM.label({
			className: "control-label col-sm-"+this.props.cols[0],
			children: [
			    this.props.item.label
			]
		    }),
		    React.DOM.div({
			className: "col-sm-"+this.props.cols[1],
			children: [
			    React.DOM.input({
				type: "text",
				name: this.props.item.name,
				className: "form-control",
				value: this.state.value,
				onChange: function(event) {
				    this.setState({value: event.target.value});
				    this.props.changeHandler(event.target.name, event.target.value);
				}.bind(this),
			    })
			]
		    })
		]
	    })
	}
    }),
    Select: React.createClass({
	getInitialState: function() {
	    return {value: this.props.item.value};
	},
	componentWillReceiveProps: function(props) {
	    this.setState({value: props.item.value});
	},
	render: function() {
	    return React.DOM.div({
		className: "form-group",
		children: [
		    React.DOM.label({
			className: "control-label col-sm-"+this.props.cols[0],
			children: [
			    this.props.item.label
			]
		    }),
		    React.DOM.div({
			className: "col-sm-"+this.props.cols[1],
			children: [
			    React.DOM.select({
				className: "form-control",
				name: this.props.item.name,
				value: this.state.value,
				onChange: function(event) {
				    this.setState({value: event.target.value});
				    this.props.changeHandler(event.target.name, event.target.value);				    
				}.bind(this),
				children: this.props.item.options.map(function(option) {
				    return React.DOM.option({
					disabled: option.disabled || false,
					children: [
					    option.value
					]
				    });
				})
			    })			    
			]
		    })
		]
	    })
	}
    }),
    getCurrentValues: function() {
	var values={};
	for (var i=0; i < this.props.items.length; i++) {
	    var item=this.props.items[i];
	    if (this.state.values.hasOwnProperty(item.name)) {
		values[item.name]=this.state.values[item.name];
	    } else if (item.value!=undefined) {
		values[item.name]=item.value;
	    } else if (item.type=="select" && item.options.length > 0) {
		values[item.name]=item.options[0].value;
	    }
	}
	return values;
    },
    handleChange: function(key, value) {
	var values=this.state.values;
	values[key]=value;
	this.setState({values: values});
    },
    shallDisableOption: function(opt, currentValues) {
	if (opt.dependencies!=undefined) {
	    for (var key in opt.dependencies) {
		if (currentValues.hasOwnProperty(key)) {
		    var found=false;
		    for (var i=0; i < opt.dependencies[key].length; i++) {
			if (currentValues[key]==opt.dependencies[key][i]) {
			    found=true;
			    break;
			}
		    }
		    if (!found) {
			return true;
		    }
		}
	    }
	}
	return false;
    },
    /*
      check that currently selected value is in the list of enabled options
    */
    getCurrentOptionValue: function(currentValue, options) {
	var optValues=options.filter(function(opt) {
	    return !opt.disabled;
	}).map(function(opt) {
	    return opt.value;
	});
	var found=false;
	for (var i=0; i < optValues.length; i++) {
	    if (optValues[i]==currentValue) {
		found=true;
		break
	    }
	}
	return found ? currentValue : optValues[0];
    },
    formatSelect: function(item, currentValues) {
	var options=item.options.map(function(opt) {	    	    
	    return {value: opt.value,
		    disabled: this.shallDisableOption(opt, currentValues)};
	}.bind(this));
	var value=this.getCurrentOptionValue(currentValues[item.name], options);
	return {label: item.label,
		name: item.name,
		options: options,
		type: item.type,
		value: value};
    },
    render: function() {
	var currentValues=this.getCurrentValues();
	return React.DOM.form({
	    className: "form-horizontal",
	    children: this.props.items.map(function(item) {
		if (item.type=="select") {
		    return this.Select({item: this.formatSelect(item, currentValues),
					cols: this.props.cols,
					changeHandler: this.handleChange});
		} else if (item.type=="input") { 
		    return this.Input({item: item,
				       cols: this.props.cols,
				       changeHandler: this.handleChange}) 
		} else {
		    return React.DOM.input({
			type: "hidden",			
			name: item.name,
			value: item.value
		    });
		}
	    }.bind(this))
	});
    }
});	   

