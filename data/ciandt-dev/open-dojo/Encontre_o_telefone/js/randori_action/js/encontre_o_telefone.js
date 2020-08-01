// Your lib code.
var EncontreTelefone = {
	telefone: '',

	setString: function(telefone) {
		EncontreTelefone.telefone = telefone;
	},

	convert: function() {
	if (EncontreTelefone.telefone === null ||
		    EncontreTelefone.telefone.length > 30 || EncontreTelefone.telefone.length < 1
		    || EncontreTelefone.telefone.match(/[^A-Z0-1-]/)) {
			throw new Error("Entrada invalida.");
		}
	}
};