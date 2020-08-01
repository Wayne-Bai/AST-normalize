angular.module('app')
.factory('TrelloListResource', function($resource){
  return $resource('https://api.trello.com/1/lists/:listId',{
    'listId': '@listId'
    },{
    query: {
      method:'GET',
      isArray: false
    }
  })
})