angular.module('demoApp')
.value('components', <%= JSON.stringify(config.demoModules, null, 4) %>);