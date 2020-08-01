
function MainController(app) {
  
  get('/', function(req, res) {
    res.render('index');
  });

}

module.exports = MainController;
