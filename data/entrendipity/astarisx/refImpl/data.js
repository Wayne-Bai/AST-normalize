var DataService = {
  getPersonData: function() {
    return [{
        id:'1', 
        firstName:'Frank', 
        lastName: "Smith", 
        gender:'male', 
        dob:'1980-03-03', 
        job:'Dentist',
        primaryContact: { name: "Pat", number: "65433564543", email: "pat@pat.com"},
        secondaryContact: { name: "John", number: "345345345", email: "john@john.com"}
      },
      {
        id:'2', 
        firstName:'Lisa', 
        lastName: "Jones", 
        gender:'female', 
        dob:'1985-02-22', 
        job:'Accountant',
        primaryContact: { name: "Joseph", number: "76674567567", email: "joe@joseph.com"},
        secondaryContact: { name: "Peter", number: "567567567", email: "pete@peter.com"}
      },
      {
        id:'3', 
        firstName: "John", 
        lastName: "Citizen", 
        gender:'male', 
        dob:'1975-12-11', 
        job:'Unemployed',
        primaryContact: { name: "Mimma", number: "7567567567", email: "mim@mimma.com"},
        secondaryContact: { name: "Louis", number: "345345345", email: "lui@louis.com"}
      }];
  },
  getHobbiesData: function(uid) {
    var hobbies = [
    {
      id:'1',
      hobbies: [{id:'1', hobby: 'reading'}, {id:'2', hobby: 'golfing'}, {id:'3', hobby: 'cutting code'}]
    },
    {
      id:'2',
      hobbies: [{id:'1', hobby: 'reading'}]
    }, 
    {
      id:'3',
      hobbies: [{id:'1', hobby: 'watching YouTube'}]
    }];
    var personHobbies = hobbies.filter(function(person){
      return person.id === uid;
    });
    return personHobbies[0] ? personHobbies[0].hobbies : [];
  }
};

module.exports = DataService;