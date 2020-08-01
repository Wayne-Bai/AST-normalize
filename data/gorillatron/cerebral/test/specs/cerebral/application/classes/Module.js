
require([
  "cerebral/application/classes/Module"
],
function( Module ) {

  describe("cerebral/application/classes/Module", function() {

    describe("Module.prototype.loadDefinition", function() {

      var module

      beforeEach(function() {

        module = new Module({
          root: '/',
          name: 'foobar'
        }) 

      })

      it("should set the module definition to the definition parameter if it is a function or object containing a main method", function() {

        function main() {}
        var obj = { main: function() {} }

        module.loadDefinition( main )

        expect( module.definition ).to.equal( main )

        module.loadDefinition( obj )

        expect( module.definition ).to.equal( obj )

      })

      it("should throw a TypeError if definition is not a function or object containing main method", function() {

        try {
          module.loadDefinition({})
        } catch( e ) {
          expect( e ).to.be.a( TypeError )
        }

        try {
          module.loadDefinition( "module" )
        } catch( e ) {
          expect( e ).to.be.a( TypeError )
        }

        try {
          module.loadDefinition( 1234 )
        } catch( e ) {
          expect( e ).to.be.a( TypeError )
        }

      })

    })

    describe("Module.prototype.main", function() {

      var module 

      beforeEach(function() {

        module = new Module({
          root: '/',
          name: 'foobar'
        }) 

      })

      it("should run the main method of the definition in the context of the definition if the definition is an object", function() {

        var foo, lorem

        function Mod() {
          this.foo = 'bar'
        }

        Mod.prototype.main = function() {
          foo = this.foo
        }

        module.loadDefinition( new Mod() )
        module.main()

        module.loadDefinition({
          lorem: 'ipsum',
          main: function() {
            lorem = this.lorem
          }
        })
        module.main()
        
        expect( lorem ).to.equal( 'ipsum' )
        expect( foo ).to.equal( 'bar' )

      })

    })

  })

})