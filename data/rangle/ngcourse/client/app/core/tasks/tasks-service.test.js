describe('tasks service', function () {
  // Load the angular module. Having smaller modules helps here.
  beforeEach(module('ngcourse.tasks'));
  beforeEach(module(function ($provide) {

    // Mock 'koast'.
    $provide.service('koast', function () {
      service = {
        user: {
          whenAuthenticated: function () {
            return Q.when();
          },
          data: {
            username: 'alice'
          }
        },

        queryForResources: sinon.spy(function () {
          return Q.when([{
            description: 'Mow the lawn',
            owner: 'alice',

          }, {
            description: 'Fix the car',
            owner: 'bob'
          }]);
        })
      };

      return service;
    });

    // Mock $q. More on this later.
    $provide.service('$q', function () {
      return Q;
    });
  }));

  it('should get tasks', function () {
    var tasks = getService('tasks');
    var koast = getService('koast');
    return tasks.getTasks()
      .then(function (receivedTasks) {
        expect(receivedTasks.length).to.equal(2);
        koast.queryForResources.should.have.been.calledOnce;
      });
  });
});
