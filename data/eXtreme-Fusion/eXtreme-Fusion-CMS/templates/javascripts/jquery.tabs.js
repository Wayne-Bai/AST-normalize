jQuery(document).ready(function() {

	// Domy�lne ustawienia
	jQuery('.tab_cont').hide();
	jQuery('.tab').removeClass('selected');

	// Aktywacja pierwszej zak�adki
	jQuery('.tab_cont:first').show();
	jQuery('.tab:first').addClass('selected');

	jQuery('.tab').click(function() {

		// Dezaktywacja wszystkich zak�adek
		jQuery('.tab_cont').hide();
		jQuery('.tab').removeClass('selected');

		// Aktywacja wybranej zak�adki
		var id = this.id;
		var num = id.split('_');
		jQuery('#'+this.id).addClass('selected');

		jQuery('#tab_cont_'+num[1]).show();

	});
});