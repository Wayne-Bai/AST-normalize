maxBreite = 8; //Anzahl Felder Breite
responsive = true;
posx = 0; //Position im Array Laufvariable
posy = 0; //Position im Array Laufvariable
width = 160; //Breite der Elemente inkl. css-border
height = 160; // Hoehe der Elemente inkl. css-border
parentBlock = '#gallery';

ga = [
'<div class="text"><h2>Selbstausrichtende Gallerie</h2>Ein Projekt im Rahmen des Fachs Web-basierte Anwendungen der FH K&ouml;ln am Campus Gummersbach. Erstellt durch Christhoph Schnock und Oliver Zolper.<br><br><a href="bilder/bildquellen.txt">Bildquellen</a><br><br><a href="javascript: shuffle();">Shuffle</a><div>',
'<img src="bilder/big/512662079_beba6b7edf_z.jpg">',
'<img src="bilder/big/1306006614_75557f5bf3_z.jpg">',
'<img src="bilder/big/4130990745_b3182f920a_z.jpg">',
'<img src="bilder/big/5252291555_830a56721b_z.jpg">',
'<img src="bilder/big/6112610781_4602bb2c24_z.jpg">',
'<img src="bilder/big/7630508748_1a34e3cb7a_z.jpg">'
];

ma = [
'<img src="bilder/mittel/1010026414_f75a2f8398_z.jpg">',
'<img src="bilder/mittel/8838014508_5128056d57_z.jpg">',
'<img src="bilder/mittel/9495855754_7931b1ec98_z.jpg">',
'<img src="bilder/mittel/11563375235_2663443849_z.jpg">',
'<img src="bilder/mittel/5616927990_290f7b6c36_z.jpg">',		
'<img src="bilder/mittel/14419768460_4204844330_z.jpg">'		
];

ka = [
'<img src="bilder/klein/14091540731_364944aa86_q.jpg">',
'<img src="bilder/klein/5235387551_ff169ed093_q.jpg">',
'<img src="bilder/klein/13567832225_ea1d8a3deb_q.jpg">',
'<img src="bilder/klein/10566866556_47b6dee40b_q.jpg">',
'<img src="bilder/klein/7592337238_2f9465a7f7_q.jpg">',
'<img src="bilder/klein/8009498265_b2fcaf8905_q.jpg">'	
];


fixed = [2];