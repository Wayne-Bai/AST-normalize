 //Wird gefeuert wenn Seite geladen wurde
 window.addEventListener('load', function () {

 	//Formular über ID selektieren und in Variable 'form speichern'
	//TODO
	var form= document.getElementById(formular_id);
	
 	//wird gefeuert, wenn das Formular abgeschickt wurde.
 	
 	form.addEventListener('submit', function (e) {
		
			//Daten im Formular validieren
			//TODO
		if(document.formular.vorname.value==null)
		{
			alert("Bitte geben Sie einen gültigen Namen ein");
		}
		if(document.formular.nachname.value==null)
		{
			alert("Bitte geben Sie einen gültigen Nachnamen ein");
		}
		if(document.formular.email.value==null)
		{
			alert("Bitte geben Sie eine gültige Email-Adresse ein");
		}
			// Default-Verhalten von 'submit' deaktivieren. 
			//Soll nur ausgeführt werden, wenn die Daten im Formular nicht valide sind.
			e.preventDefault();
 	});
 });




