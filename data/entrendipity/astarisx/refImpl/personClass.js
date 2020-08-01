var Astarisx = require('../src/core');
var HobbyClass = require('./hobbyClass');
var ContactClass = require('./contact');
var DataService = require('./data');

var Hobby = function(){
  return new HobbyClass().apply(this, arguments);
};

var Contact = function(){
  return new ContactClass().apply(this, arguments);
};

var calculateAge = function(dob){ // dob is a date
  if(dob.length < 10){
    return 'Enter your Birthday';
  }
  var DOB = new Date(dob);
  var ageDate = new Date(Date.now() - DOB.getTime()); // miliseconds from
  var age = Math.abs(ageDate.getFullYear() - 1970);
  return isNaN(age) ? 'Enter your Birthday' : age + ' years old';
};

var PersonClass = Astarisx.createModelClass({

  getInitialState: function(){

    var hobbies = [];

    if(this.hobbies === void(0)){       
      hobbies = DataService.getHobbiesData(this.id).map(function(hobby){
        return new Hobby(hobby);
      }.bind(this));
    } else {
      hobbies = this.hobbies;
    }
    return {
      age: calculateAge(this.dob),
      id: this.id || Astarisx.uuid(),
      hobbies: hobbies,
      objectField: {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  },
      objectFreezeField: {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  },
      objectDeepFreezeField: {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  },
      arrayField: ["aValue1", {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  }, ["aValue2", {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  }]],
      arrayFreezeField: ["aValue1", {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  }, ["aValue2", {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  }]],
      arrayDeepFreezeField: ["aValue1", {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  }, ["aValue2", {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  }]]

    };
  },

  id: {
    kind: 'uid',
    get: function(){
      return this.$state.id;
    }
  },

  _clientField: {
    get: function(){
      return this.$state._clientField;
    },
    set: function(newValue){
      this.setState({_clientField: newValue});
    }
  },

  _clientFieldEnumOverride: {
    enumerable: true,
    get: function(){
      return "override";
    }
  },
  
  objectField: {
    kind: 'object',
    get: function(){
      return this.$state.objectField;
    }
  },
  objectFreezeField: {
    kind: 'object:freeze',
    get: function(){
      return this.$state.objectFreezeField;
    }
  },
  objectDeepFreezeField: {
    kind: 'object:deepFreeze',
    get: function(){
      return this.$state.objectDeepFreezeField;
    }
  },

  arrayField: {
    kind: 'array',
    get: function(){
      return this.$state.arrayField;
    }
  },
  arrayFreezeField: {
    kind: 'array:freeze',
    get: function(){
      return this.$state.arrayFreezeField;
    }
  },
  arrayDeepFreezeField: {
    kind: 'array:deepFreeze',
    get: function(){
      return this.$state.arrayDeepFreezeField;
    }
  },

  pseudoField: {
    kind: 'pseudo',
    get: function(){
      return 'pseudoField';
    }
  },

  firstName: {
    validate: {
      get: function(){
        return this.firstName.length > 0;
      }
    },
    get: function(){ return this.$state.firstName; },
    set: function(newValue){
      var nextState = {};
      nextState.firstName = newValue.length === 0 ? void(0) : newValue;
      this.setState(nextState);
    }
  },

  lastName: {
    validate: {
      get: function(){
        return this.lastName.length > 0;
      }
    },
    get: function(){ return this.$state.lastName; },
    set: function(newValue){
      var nextState = {};
      nextState.lastName = newValue.length === 0 ? void(0) : newValue;
      this.setState(nextState);
    }
  },

  fullName: {
    kind: 'pseudo',
    get: function(){
      if(this.lastName === void(0)){
        return this.firstName;
      }
      return this.firstName + ' ' + this.lastName;
    },
    set: function(newValue){
      var nextState = {};
      var nameArr = newValue.split(' ');
      var isSpace = newValue.slice(-1)[0] === ' ';
      var firstname = nameArr[0];
      var lastname = nameArr.slice(1).join(' ');

      nextState.firstName = firstname.length === 0 ? void(0) : firstname;
      nextState.lastName = lastname.length === 0 && !isSpace ? void(0) : lastname;

      this.setState(nextState);
    }
  },

  occupation: {
    aliasFor: 'job',
    get: function(){
      return this.$state.occupation;
    },
    set: function(newValue){
      this.setState({'occupation': newValue });
    }
  },

  dob: {
    get: function(){
      return this.$state.dob;
    },
    set: function(newValue){
      this.setState({'dob': newValue});
    }
  },

  //Calculated field <- dob
  age: {
    kind: 'pseudo',
    get: function(){
      return calculateAge(this.dob);
    }
  },

  gender: {
    get: function(){ return this.$state.gender; },
    set: function(newValue){
      //This is to test callback context
      this.setState({}, function(){
        this.setState({'gender': newValue});
      });
    }
  },

  hobbies: {
    kind: 'array',
    get: function(){ return this.$state.hobbies; },
  },

 //primary||Secondary||Admin||Technical||customer
  primaryContact: {
    kind: 'instance',
    get: function(){
      return new Contact(this.$state.primaryContact, {$owner:"primaryContact"});
    },
    validate: {
      get: function(){
        return this.primaryContact.name.length > 0;
      }
    }
  },

  secondaryContact: {
    kind: 'instance',
    get: function(){
      return new Contact(this.$state.secondaryContact, {$owner:"secondaryContact"});
    },
    validate: {
      get: function(){
        return this.secondaryContact.name.length > 0;
      }
    }
  },

  uninitializedArray: {
    kind: 'array',
    get: function(){
      return this.$state.uninitializedArray;
    }
  },

  updateHobby: function(obj){
    var arr = this.hobbies.map(function(hobby){
      if(hobby.id === obj.id){
        return obj;
      }
      return hobby;
    });
    
    this.setState({hobbies: arr});
  },

  addHobby: function(value){
    var arr;
    for (var i = this.hobbies.length - 1; i >= 0; i--) {
      if(this.hobbies[i].name === value.name){
        return;
      }
    }
    arr = this.hobbies.slice(0);
    this.setState({
      hobbies: arr.concat(new Hobby({ name:value }))
    });
  },

  deleteHobby: function(id){
    var hobbies = this.hobbies.filter(function(hobby){
      return hobby.id !== id;
    });
    this.setState({hobbies: hobbies},{
      busy: false,
      $path: '/person/' + this.id,
      hobbies: { current: void(0) }
    });
  },
});

module.exports = PersonClass;