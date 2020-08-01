frappe.listview_settings['Workflow'] = {
	add_fields: ["is_active"],
	get_indicator: function(doc) {
		if(doc.is_active) {
			return [__("Active"), "green", "is_active,=,Yes"];
		} else if(!doc.is_active) {
			return [__("Not active"), "darkgrey", "is_active,=,No"];
		}
	}
};
