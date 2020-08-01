var model = [];

function updateModel(dimensions, node, css){
	var sizeExist = false;

	// loop in all sizes in the model
	for (var i = 0; i < model.length; i++) {
		var size = model[i];
		// for each sizes : check if dimensions exists
			// if exist : 
		if (size.w === dimensions.w && size.h === dimensions.h) {
			sizeExist = true;
			var nodeExist = false;
			for (var j = 0; j < size.content.length; j++) {
				if (size.content[j].node === node) {
					size.content[j].style = css;
					nodeExist = true;
					break;
				}
			}
			// if node doesn't exist, add values
			if (!nodeExist) {
				size.content.push({node: node, style: css});
			}

			break;
		}
	}

	// First case (sizes doesn't exist)
	if (!sizeExist) {
		model.push({w: dimensions.w, h: dimensions.h, content: [{node: node , style: css}] });
	}

}

function generateCSS(){
	// Let CSS be the return string
	var css = "";

	// for each size in sizes :
	for (var i = 0; i < model.length; i++) {
		var size = model[i];
		// - write media queries (begin) with width
		css += "@media (max-width: "+ size.w +"px){\n";
		// - for each item in size.content,
		for (var j = 0; j < size.content.length; j++) {
			// - write node selector (begin)
			css += getSelector(size.content[j].node) +"{\n";
			// - write styles
			css += size.content[j].style;
			// - write node selector (end)
			css += "\n}\n";
		}
		// - write media queries (end)
		css += "}";
	}

	// return css
	return css;
}

function getSelector(node){

    var parent = node.parentNode,
        getNodeSelector = function(node){
            var nodeSelector = node.tagName;
            if (node.id) {
                nodeSelector += "#" + node.id;
            }

            if (node.className) {
                nodeSelector += "." + node.className;
            }

            return nodeSelector;
        },
        selector = getNodeSelector(node);

    while(true) {
        parent = parent.parentNode;
        if (parent === null || parent === document) {
            break;
        }
        selector = getNodeSelector(parent) + " > " + selector;
    }

	return selector;
}

function getStyles(dimensions, node){
	for (var i = 0; i < model.length; i++) {
		var size = model[i];

		if (size.w === dimensions.w && size.h === dimensions.h) {
			for (var j = 0; j < size.content.length; j++) {
				if (size.content[j].node === node) {
					return size.content[j].style;
				}
			}
		}

	}

	return '';
}

