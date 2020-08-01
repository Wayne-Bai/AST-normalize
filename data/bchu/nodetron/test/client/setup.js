// <script src="lib/mocha/mocha.js"></script>
mocha.setup('bdd');
mocha.setup({ignoreLeaks: true});
// <script src="lib/chai.js"></script>
window.expect = chai.expect;
window.path = '../../client/';