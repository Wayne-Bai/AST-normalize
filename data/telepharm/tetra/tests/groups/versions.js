module.exports = {
  // Create new version
  Create: {
    method: 'POST',
    url: '/version',
    payload: {
      name: 'vTEST'
    },
    resultCode: 201,
    result: false
  },
  // Test read
  Read: {
    method: 'GET',
    url: '/version/vTEST',
    payload: false,
    resultCode: 200,
    result: {}
  },
  // Test Update
  Update: {
    method: 'PUT',
    url: '/version/vTEST',
    payload: {
      name: 'vTESTChanged'
    },
    resultCode: 200,
    result: false
  },
  // Test Delete
  Delete: {
    method: 'DELETE',
    url: '/version/vTESTChanged',
    payload: false,
    resultCode: 204,
    result: false
  }
};
