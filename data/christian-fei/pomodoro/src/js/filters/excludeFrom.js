angular.module('app')
.filter('excludeFrom',function(){
  return function(input,filtering){
    return (input || []).filter(function(item){
      return contains(filtering,item)
    })
  }

  function contains(haystack,needle) {
    return haystack.indexOf(needle) === -1
  }
})
