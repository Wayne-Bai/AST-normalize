define(['s'], function(s) {
  test = s.model('test', {
    id: 0,
    name: 'lyz',
    blogsNum: 3,
    blogs: [
      {
        id: 0, 
        name: 'blog', 
        commentsNum: 3,
        comments: [
          {id: 0, name: 'comment'},
          {id: 1, name: 'comment1'},
          {id: 2, name: 'comment2'}
        ]
      },
      {
        id: 0, 
        name: 'blog', 
        commentsNum: 3,
        comments: [
          {id: 0, name: 'comment'},
          {id: 1, name: 'comment1'},
          {id: 2, name: 'comment2'}
        ]
      },
      {
        id: 0, 
        name: 'blog', 
        commentsNum: 3,
        comments: [
          {id: 0, name: 'comment'},
          {id: 1, name: 'comment1'},
          {id: 2, name: 'comment2'}
        ]
      }
    ]
  })

  s.init();
  
  setTimeout(function() {
    test.id = '1';
    test.name = 'lyzClone';

    test.blogs = [
      {
        id: 0, 
        name: 'blog', 
        commentsNum: 3,
        comments: [
          {id: 0, name: 'x'},
          {id: 1, name: 'x'},
          {id: 2, name: 'x'}
        ]
      },
      {
        id: 0, 
        name: 'blog', 
        commentsNum: 3,
        comments: [
          {id: 0, name: 'xx'},
          {id: 1, name: 'xx'},
          {id: 2, name: 'xx'}
        ]
      },
      {
        id: 0, 
        name: 'blog', 
        commentsNum: 3,
        comments: [
          {id: 0, name: 'xxx'},
          {id: 1, name: 'xxx'},
          {id: 2, name: 'xxx'}
        ]
      }
    ]
  }, 2000)
  
})

