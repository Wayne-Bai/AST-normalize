var collection = require('../collection');

global.isNode = true;
global.Collection = collection.Collection;
global.$C = collection.$C;
global.$cLink = collection.$cLink;

require('./build/core/collection');
require('./build/core/link');
require('./build/core/cluster');
require('./build/core/extend');
require('./build/sort/sort');
require('./build/sort/reverse');
require('./build/single/concat');
require('./build/single/add');
require('./build/mult/forEach');
require('./build/mult/some');
require('./build/mult/every');
require('./build/mult/get');
require('./build/mult/search');
require('./build/mult/length');
require('./build/mult/remove');
require('./build/mult/set');
require('./build/mult/map');
require('./build/mult/reduce');
require('./build/mult/group');
