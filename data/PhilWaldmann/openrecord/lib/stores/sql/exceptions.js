var Store = require('../../store');

Store.addExceptionType(function SQLError(error){
  Error.apply(this);
  this.message = error;
});