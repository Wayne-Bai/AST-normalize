$(window).ready(function(){
    $("#button1").click(function(){
        // Vorherige Daten löschen um Überschneidung der Charts zu vermeiden
        $("#chart-area-LineChart").remove();
        // Danach den leeren Container wieder hinzufügen für die neuen Daten
        $("#canvas-holder-10").append('<canvas id="chart-area-LineChart" height="300" width="800"/>');
		var t =0, m = 0;
		// Hilfsarrays für die Insgesamt-Zahlen von den Bundesländern
		var myArray0 = [];
		var myArray1 = [];
		//Variable aus der Select-Box für das Bundesland 1
        var jsLang = $('#Bundes_LineChart :selected').val();
		//Variable aus der Select-Box für das Bundesland 2
        var index3 = $('#Bundes2_LineChart :selected').val();
		//Variable aus der Select-Box für das Studienfach
		var index1 = $('#Stud_LineChart :selected').val();

        // Aktivieren der LineChart
		ChartActive15();
		
		// Auslesen der JSON-Datei studienanfanger_bundesweit/ data0 wird zum Übergabeparameter um die Objekte aus der JSON-Datei abzurufen
		// In der Datei sind die Zahlen für jedes Bundesland pro Semester gelistet
		$.getJSON("JSON/studienanfanger_bundesweit.json", function(data0){
			// Auslesen der JSON-Datei studienanfanger_bundeslander/ data1 wird zum Übergabeparameter um die Objekte aus der JSON-Datei abzurufen
			// In der Datei sind die Zahlen für jeden Informatik-Studiengang in einem Bundesland pro Semester gelistet
			$.getJSON("JSON/studienanfanger_bundeslander.json", function(data1){
				
		// Suchen der Werte von Studienanfänger Insgesamt im 1. Bundesland		
		for (var p=0; p<data1.Studienanfaenger_Bundesland.length; p++) {
			if(data1.Studienanfaenger_Bundesland[p].Bundesland === jsLang){
				// Werte in myArray0 eintragen mit der push-Methode
				myArray0.push(data1.Studienanfaenger_Bundesland[p].Insgesamt);
			}
		}
		
		// Suchen der Werte von Studienanfänger Insgesamt im 2. Bundesland		
		for (var k=0; k<data1.Studienanfaenger_Bundesland.length; k++) {
			if(data1.Studienanfaenger_Bundesland[k].Bundesland === index3){
				// Werte in myArray1 eintragen mit der push-Methode
				myArray1.push(data1.Studienanfaenger_Bundesland[k].Insgesamt);
			}
		}
		
		// Suche der Werte mit 1. Bundesland und Studienfach
		for (var i=0; i<data0.Studienanfaenger_Bundesweit.length; i++) {
			if(data0.Studienanfaenger_Bundesweit[i].Bundesland === jsLang && data0.Studienanfaenger_Bundesweit[i].Studienfach === index1){
				// Eintragen der Werte in die LineChart und Berechnung in einem Schritt / .toFixed(2) setzt die Nachkommastellen auf 2
				// Abfrage der insgesamten Zahlen aus myArray1 mit der Zähler Variable für die Semester
				myLineChart.datasets[0].points[t].value = parseFloat(((data0.Studienanfaenger_Bundesweit[i]["Insgesamt"] * 100) / myArray0[t])).toFixed(2);
				// Zählervariable für die Semester bzw. der einzelnen Punkte auf dem Graphen
				t++;
			}
		}
				
		for (var n=0; n<data0.Studienanfaenger_Bundesweit.length; n++) {
			if(data0.Studienanfaenger_Bundesweit[n].Bundesland === index3 && data0.Studienanfaenger_Bundesweit[n].Studienfach === index1){
				// Eintragen der Werte in die LineChart und Berechnung in einem Schritt / .toFixed(2) setzt die Nachkommastellen auf 2
				// Abfrage der insgesamten Zahlen aus myArray1 mit der Zähler Variable für die Semester 
				myLineChart.datasets[1].points[m].value = parseFloat(((data0.Studienanfaenger_Bundesweit[n]["Insgesamt"] * 100) / myArray1[m])).toFixed(2);
				// Zählervariable für die Semester bzw. der einzelnen Punkte auf dem Graphen
				m++;
			}
		}
				// Setzt die Skalierung neu, indem die LineChart mit den neuen Werten neu geladen wird
				myLineChart.update();
				});
			});
		});
	});       