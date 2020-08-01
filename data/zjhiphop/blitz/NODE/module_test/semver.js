var semver=require('semver');
semver.valid('1.2.3') // true
semver.valid('a.b.c') // false
semver.clean('  =v1.2.3   ') // '1.2.3'
semver.satisfies('1.2.3', '1.x || >=2.5.0 || 5.0.0 - 7.2.3') // true
semver.gt('1.2.3', '9.8.7')  // false
semver.lt('1.2.3', '9.8.7')  // true