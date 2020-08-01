 //Wird gefeuert wenn Seite geladen wurde
 window.addEventListener('load', function () {
 	//Formular über ID selektieren
 	var form = document.getElementById("formular");

 	//wird gefeuert, wenn das Formular abgeschickt wurde.
 	form.addEventListener('submit', function (e) {
		
		if (check(form) == false)
			e.preventDefault();
 	});
 });



 function check(form) {
 	var allOK = true;


 	//Eingabefelder zurücksetzen (CSS-Klasse 'error' entfernen)
 	form.nachname.className = "";
 	form.email.className = "";
 	form.nachricht.className = "";

 	document.getElementById("labelNachname").innerHTML = "Nachname:";
 	document.getElementById("labelEmail").innerHTML = "E-Mail-Adresse:";
 	document.getElementById("labelNachricht").innerHTML = "Ihre Nachricht:"


	//Checken ob Nachname eingegeben.
 	if (!form.nachname.value) {
 		form.nachname.className = "error";
 		document.getElementById("labelNachname").innerHTML = "Sie müssen ihren Nachnamen eingeben";
 		allOK = false;
 	}
	 
	 
	//Checken ob korrekte E-Mail-Adresse engegeben 
 	if (!form.email.value.match(/.+@.+\..*/)) {
 		form.email.className = "error";
 		document.getElementById("labelEmail").innerHTML = "Sie müssen eine korrekte E-Mail-Adresse eingeben";
 		allOK = false;
 	}

	//Checken ob Nachricht größer als 20 Zeichen eingegeben wurde.
 	if (form.nachricht.value.length < 20) {
 		form.nachricht.className = "error";
 		document.getElementById("labelNachricht").innerHTML = "Sie müssen eine Nachricht mit mehr als 20 Zeichen eingeben"
 		allOK = false;
 	}

 	return allOK;
 }