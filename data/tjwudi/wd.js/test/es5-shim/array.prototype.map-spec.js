describe('Array.prototype.map', function() {
  it('should call callback once for each element, and construct a new array from the results', function() {
    var arrayOfNumbers = [1, 2, 3],
    squareOfNumbers = arrayOfNumbers.map(function(currentValue) {
      return currentValue * currentValue;
    });
    expect(squareOfNumbers).to.be.an(Array);
    expect(squareOfNumbers).eql([1, 4, 9]);
  });
});