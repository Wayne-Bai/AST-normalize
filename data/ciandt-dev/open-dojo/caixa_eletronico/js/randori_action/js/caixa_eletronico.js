// Your lib code.
var caixa =
{
	notas: [100, 50, 10, 20],
	notas_infinitas: true,
	setQtdNotas: function(notas)
	{
		caixa.notas = [];
		caixa.notas_infinitas = false;
		for (var nota in notas) {
			var qtd_notas = notas[nota];
			for (var i = 0; i < qtd_notas; i++) {
				caixa.notas.push(nota);
			}
		}
		//console.log(caixa.notas);
	},
	saque: function(ammount)
	{
		if(ammount % 10 != 0 || ammount <= 0) {
		    throw {
		        name: "Error",
      		    message: "valor invalido"
            }
		}

		var retorno = {};

		if(caixa.notas.indexOf(ammount) != -1)
		{
			retorno[ammount] = 1;
			return retorno;
		}

		var notas = caixa.notas.sort(function(a, b){ return b-a; });

		for (var nota in notas) {
			nota = notas[nota];

			if ((ammount >= nota) && (caixa.notas_infinitas)) {
				retorno[nota] = parseInt(ammount / nota);
				ammount -= nota * retorno[nota];
			}
			else {
				if (ammount >= nota) {
					retorno[nota] = retorno[nota] +1;
					ammount -= nota;
				}
			}

			if(ammount == 0) {
				break;
			}
		}

		return retorno;
	}
}

