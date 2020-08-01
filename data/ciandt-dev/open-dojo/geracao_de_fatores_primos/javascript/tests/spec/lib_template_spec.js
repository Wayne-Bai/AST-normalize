describe("Fatores Primos", function() {
  beforeEach(function(){
     
  });

  it("número primo - fator primo", function() {
   var numero_primo = new NumeroPrimo(5);
   expect(5).toEqual(numero_primo.fatores());
  });

  it("outro numero primo", function() {
  	var numero_primo = new NumeroPrimo(11);
  	expect(11).toEqual(numero_primo.fatores());
  });

  it("numero não primo (6)", function() {
  	var numero_primo = new NumeroPrimo(6);
  	expect([2, 3]).toEqual(numero_primo.fatores());
  });

  it("numero não primo (8)", function() {
  	var numero_primo = new NumeroPrimo(8);
  	expect([2, 2, 2]).toEqual(numero_primo.fatores());
  });

  it("verificando se 2 primo", function() {
  	var numero_primo = new NumeroPrimo();
    var numero = 2;
    expect(true).toEqual(numero_primo.isPrimo(numero));
  });

  it("verificando se 6 primo", function() {
  	var numero_primo = new NumeroPrimo();
    var numero = 6;
    expect(false).toEqual(numero_primo.isPrimo(numero));
  });

  it("retorna fatores primos", function(){
  	var numero = new NumeroPrimo(6);
  	expect([2,3]).toEqual(numero.retornaFator(6));
  });
});