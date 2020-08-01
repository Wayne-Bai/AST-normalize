angular.module('app')
.factory('TrelloBoardResource', function($resource){
  return $resource('https://api.trello.com/1/boards/:boardId',{
    'boardId': '@boardId'
    },{
    query: {
      method:'GET',
      isArray: false
    }
  })
})