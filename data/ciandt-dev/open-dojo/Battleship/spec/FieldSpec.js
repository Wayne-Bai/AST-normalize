//Map 1 x 1
//method show map
//method hit 
//method show log

var field;
var execPlaceShip = function(ship, posX,posY) {
		return function() {
			field.placeShip(ship,posX,posY)
		};
	};

describe("Campo", function() {	

	beforeEach(function() {
		field = new Field();
		//field.toString();
	});

	xit("should be able to have one ship", function() {
		// console.log("01");
		var ship = new Ship(2);
		field.place(ship);
	});

	it("instanciado deveria ter 10x10.", function() {
		// console.log("02");

		expect(field.field.length).toBe(10);

		for(var i = 0; i< field.length; i++){
			expect(field.field[i].length).toBe(10);
		}
	});

	xit("instanciado está vazio.", function() {

	});

	it("instanciado, deve ser possivel posicionar um navio", function() {
		var ship = Ship("barco de patrulha");
		expect(execPlaceShip(ship, 0, 0)).not.toThrow();
	});

	it("deve ser possivel inserir barco de patrulha na posição 0x0", function() {
		// console.log("05");

		var ship = Ship(ShipTypes.PATRULHA);
        // Deve verificar se a posição 0x0 possui um barco de patrulha333
		expect(field.placeShip(ship, 0, 0)).toBeTruthy;

		expect(field.field[0][0]).toBe(1);
		expect(field.field[0][1]).toBe(1);

		// it("a posição 0x0 e a posição 0x1 devem estar ocupadas", function() {
		// 	expect(field.field[0][0]).toBe("1");
		// 	expect(field.field[0][1]).toBe("1");
		// });
	});

	it("Deve atirar exceção para barcos invalidos", function(){
		expect(execPlaceShip([1], 0, 0)).toThrow();
		expect(field.field[0][0]).toBe(0);
	});

	it("com seu range ocupado deve retornar falso", function() {
		// console.log(field.field);
		var ship1 = Ship(ShipTypes.PATRULHA);
		field.placeShip(ship1, 0, 1);
		console.log(field.field);
		// TODO ... descomentar esse teste
		// expect(field.placeShip(ship1, 0, 0)).toBeFalsy();
	});

	it("com seu range ocupado nao deve ocupar nenhuma posição", function() {
		var ship1 = Ship(ShipTypes.PATRULHA);
		field.placeShip(ship1, 0, 1);

		expect( execPlaceShip(ship1, 0, 0)).toThrow();
		expect(field.field[0][0]).toBe(0);
		expect(field.field[0][1]).toBe(1);
		expect(field.field[0][2]).toBe(1);
		expect(field.field[0][3]).toBe(0);
	});

	it("deve haver espaço para insercao do barco", function(){
		// console.log("09");
		var ship1 = Ship(ShipTypes.PATRULHA);
		expect(execPlaceShip(ship1, 0, 9)).toThrow();        
		expect(field.field[0][9]).toBe(0);
		expect(field.field[0][10]).toBeUndefined();
		expect(execPlaceShip(ship1, 0, 0)).not.toThrow();
		expect(field.field[0][2]).toBe(0);
		expect(field.field[0][0]).toBe(1);
		expect(field.field[0][1]).toBe(1);
	});

	it("não deve conseguir posicionar um navio num range fora do campo", function(){
		// console.log("10");
		var ship1 = Ship(ShipTypes.PATRULHA);
		expect(execPlaceShip(ship1,0,10)).toThrow();
		expect(execPlaceShip(ship1,10,0)).toThrow();
		expect(execPlaceShip(ship1,10,10)).toThrow();
		expect(execPlaceShip(ship1,15,12)).toThrow();
		
	});
	// TDD com design patterns
	it("deve verificar posição antes do barco", function(){
		// console.log("11");
		var ship1 = "";
		var ship2 = Ship(ShipTypes.PATRULHA);
		expect(execPlaceShip(ship1, 10, 10)).toThrow();
		expect(execPlaceShip(ship1, 0, 0)).toThrow();
		expect(execPlaceShip(ship2, -20, -1)).toThrow();	
		expect(execPlaceShip(ship2,0,0)).not.toThrow();

	});


});

describe("Em um campo com barcos verticais", function() {
	beforeEach(function() {
		field = new Field();
	});

	it("deve ser possivel inserir barco de patrulha na posição 0x0", function() {
		// console.log("05");

		var ship = Ship(ShipTypes.PATRULHA);
        // Deve verificar se a posição 0x0 possui um barco de patrulha11
		expect(field.placeShip(ship, 0, 0, 'vertical')).toBeTruthy;

		expect(field.field[0][0]).toBe(1);
		expect(field.field[1][0]).toBe(1);
	});

	it("deve ser possivel verificar um barco de patrulha com direcao vertical", function() {
		// console.log("05");

		var ship = Ship(ShipTypes.PATRULHA);
        // Deve verificar se a posição 0x0 possui um barco de patrulha11
		expect(field.validPlace(ship, 0, 0, 'vertical')).toBeTruthy;
	});


});

describe("Em um tabuleiro", function(){
	beforeEach(function() {
		field = new Field();
	});

	it("deve ser possivel inserir 5 barcos horizontal e verticalmente, não ocupando a mesma posição", function() {
		// linha x coluna
		expect(field.placeShip(Ship(ShipTypes.PATRULHA), 0, 0)).toBeTruthy;
		expect(field.placeShip(Ship(ShipTypes.DESTROYER), 1, 0, 'vertical')).toBeTruthy;
		expect(field.placeShip(Ship(ShipTypes.SUBMARINO), 2, 3)).toBeTruthy;
		expect(field.placeShip(Ship(ShipTypes.ENCOURACADO), 9, 0)).toBeTruthy;
		expect(field.placeShip(Ship(ShipTypes.PORTA_AVIOES), 4, 8, 'vertical')).toBeTruthy;
	
		expect(JSON.stringify(field.field)).toBe(
			"[[1,1,0,0,0,0,0,0,0,0],[2,0,0,0,0,0,0,0,0,0],[2,0,0,3,3,3,0,0,0,0],[2,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,5,0],[0,0,0,0,0,0,0,0,5,0],[0,0,0,0,0,0,0,0,5,0],[0,0,0,0,0,0,0,0,5,0],[0,0,0,0,0,0,0,0,5,0],[4,4,4,4,0,0,0,0,0,0]]");
	});


	it("não deve ser possivel inserir 2 barcos cruzados", function() {
		// linha x coluna
		expect(field.placeShip(Ship(ShipTypes.SUBMARINO), 2, 3)).toBeTruthy;
		expect(execPlaceShip(Ship(ShipTypes.DESTROYER), 1, 4, 'vertical')).toThrow;
		
		// Se segundo Navio não ocupou o mesmo espaço 
		expect(JSON.stringify(field.field)).toBe(
			"[[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,3,3,3,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]]");
	});

	it("deve ser possivel atingir 1 posicao de um barco", function(){
		// linha x coluna
		field.placeShip(Ship(ShipTypes.PORTA_AVIOES), 3, 4);
		expect(field.shoot(3,4)).toBe("A");
		expect(field.field[3][4]).toBe(-5);

		field.placeShip(Ship(ShipTypes.ENCOURACADO), 8, 0);
		expect(field.shoot(8, 0)).toBe("A");
		expect(field.field[8][0]).toBe(-4);
	});

	it("deve ser possível atingir uma posição vazia", function() {
		expect(field.shoot(3, 4)).toBe("N");

		expect(field.field[3][4]).toBe(0);
	});

	it("deve ser possível atingir a mesma posição duas vezes", function(){

		field.placeShip(Ship(ShipTypes.PORTA_AVIOES), 0, 0);

		expect(field.shoot(1,0)).toBe("N");
		expect(field.field[1][0]).toBe(0);

		expect(field.shoot(1,0)).toBe("N");
		expect(field.field[1][0]).toBe(0);

		expect(field.shoot(0,1)).toBe("A");
		expect(field.field[0][1]).toBe(-5);

		expect(field.shoot(0,1)).toBe("A");
		expect(field.field[0][1]).toBe(-5);

	});
});

// describe("Em 1 tabuleiro", function(){
// 	beforeEach(function() {
// 		field = new Field();
// 	});


// });