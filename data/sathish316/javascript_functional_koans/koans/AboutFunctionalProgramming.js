describe("About Functional programming", function() {

  describe("Variables", function(){
    it("should be immutable", function(){
      // Variables are immutable in Functional languages. Use Vars namespace to
      // get/set variables to simulate immutability in javascript
      var oldValue = 42;
      var newValue = 24;
      var x = Vars.set('x', oldValue);
      x = Vars.set('x', newValue);

      expect(Vars.get('x')).toEqual(FILL_ME_IN);
    });
  });

  describe("Recursion", function(){
    it("should be used to repeatedly do something", function(){
      var reverse = function (str){
        if (str.length == 0){
          return str;
        } else {
          return reverse(str.substr(1, str.length)) + str.substr(0, 1);
        }
      };

      expect(reverse("RACECAR")).toEqual(FILL_ME_IN);
    });
  });
});
