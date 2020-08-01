var request = require('request')
var rand = Math.floor(Math.random()*100000000).toString()

request({
  method: 'PUT',
  uri: 'http://mikeal.iriscouch.com/testjs/' + rand,
  multipart: [
    {
      'content-type': 'application/json',
      'body': JSON.stringify({
        foo: 'bar',
        _attachments: {
          'message.txt': {
            follows: true,
            length: 18,
            'content_type': 'text/plain'
           }
         }
       })
    },
    { body: 'I am an attachment' }
  ] 
}, function (error, response, body) {
  if(response.statusCode == 201){
    console.log('document saved as: http://mikeal.iriscouch.com/testjs/'+ rand);
  } else {
    console.log('error: '+ response.statusCode);
    console.log(body);
  }
})