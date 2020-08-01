function ModuleDefinition(name, exports, imports, bodyText) {
    this.name = name;
    this.exports = exports;
    this.imports = imports;
    this.bodyText = bodyText;

    this.localName = ModuleDefinition.localNameFor(this.name);
    this.gensymCounter = 0;

    this.factory = eval('(' + this.constructFactory() + ')');
}

ModuleDefinition.fromJsonObject = function (obj) {
    return new ModuleDefinition(obj.name,
				obj.exports || [],
				obj.imports || [],
				obj.bodyText || "");
};

ModuleDefinition.localNameFor = function (name) {
    var parts = name.split('.');
    return parts[parts.length - 1];
};

ModuleDefinition.prototype.toJSON = function (key) {
    return {name: this.name,
	    exports: this.exports,
	    imports: this.imports,
	    bodyText: this.bodyText};
};

ModuleDefinition.prototype.gensym = function (distinguisher) {
    var counter = this.gensymCounter;
    this.gensymCounter++;
    return '__$_' + this.localName + '_' + (distinguisher ? distinguisher + '_' : '') + counter;
};

ModuleDefinition.prototype.importedModuleNames = function () {
    var result = [];
    for (var i = 0; i < this.imports.length; i++) {
	if (typeof(this.imports[i]) === 'string') {
	    result.push(this.imports[i]);
	} else {
	    for (var name in this.imports[i]) {
		result.push(name);
	    }
	}
    }
    return result;
};

ModuleDefinition.prototype.constructFactory = function () {
    var $elf = this;

    var namespaceName = $elf.gensym('ns');
    var moduleAliases = {};
    var importBindings = [];
    var exportCodeFragments = [];
    var i, publicName, privateName;

    function doImport(importModuleName, importSpec) {
	var localAlias = ModuleDefinition.localNameFor(importModuleName);
	var unambiguousAlias = $elf.gensym('mod_' + localAlias);
	moduleAliases[importModuleName] = unambiguousAlias;

	importBindings.push([unambiguousAlias,
			     namespaceName + '.lookupModule("' +
			       importModuleName + '", "' +
			       $elf.name + '")']);

	if (importSpec.alias) {
	    importBindings.push([(typeof(importSpec.alias) === 'string')
				   ? importSpec.alias
				   : localAlias,
				 unambiguousAlias]);
	}

	if (importSpec.symbols) {
	    for (i = 0; i < importSpec.symbols.length; i++) {
		var importSymbol = importSpec.symbols[i];
		if (typeof(importSymbol) === 'string') {
		    importBindings.push([importSymbol, unambiguousAlias + '.' + importSymbol]);
		} else {
		    for (publicName in importSymbol) {
			privateName = importSymbol[publicName];
			importBindings.push([privateName, unambiguousAlias + '.' + publicName]);
		    }
		}
	    }
	}
    }

    for (var importIndex = 0; importIndex < $elf.imports.length; importIndex++) {
	var importModuleName = $elf.imports[importIndex];
	if (typeof(importModuleName) === 'string') {
	    doImport(importModuleName, {alias: true});
	} else {
	    var importSpecs = importModuleName;
	    for (importModuleName in importSpecs) {
		doImport(importModuleName, importSpecs[importModuleName]);
	    }
	}
    }

    for (i = 0; i < $elf.exports.length; i++) {
	var exportSymbol = $elf.exports[i];
	if (typeof(exportSymbol) === 'string') {
	    exportCodeFragments.push(exportSymbol + ': (' + exportSymbol + ')');
	} else {
	    for (publicName in exportSymbol) {
		privateName = exportSymbol[publicName];
		exportCodeFragments.push(publicName + ': (' + privateName + ')');
	    }
	}
    }

    for (i = 0; i < importBindings.length; i++) {
	importBindings[i] = '  var ' + importBindings[i][0] + ' = ' + importBindings[i][1] + ';\n';
    }

    return 'function (' + namespaceName + ') {\n' +
	importBindings.join('') + '\n' +
	$elf.bodyText +
	'\n  return {\n    ' +
	exportCodeFragments.join(',    \n') +
	'\n  }\n' +
	'}';
};

function ModuleNamespace(definitionDirectory) {
    this.modules = {};
    this.definitionDirectory = definitionDirectory;
}

ModuleNamespace.prototype.beginModuleDefinition = function (name) {
    this.modules[name] = null;
};

ModuleNamespace.prototype.registerModule = function (name, exports) {
    this.modules[name] = exports;
};

ModuleNamespace.prototype.lookupModule = function (name, importingModuleName) {
    var result = this.modules[name];
    if (typeof(result) === 'undefined') {
	throw {message: "Unknown module '" + name + "' imported from '" + importingModuleName + "'",
	       importingModuleName: importingModuleName,
	       name: name};
    }
    if (result === null) {
	throw {message: "Cyclic module dependency detected in '" + importingModuleName +
	       "' while importing '" + name + "'",
	       importingModuleName: importingModuleName,
	       name: name};
    }
    return result;
};

ModuleNamespace.prototype.containsModule = function (name) {
    return name in this.modules;
};

ModuleNamespace.prototype.instantiateModule = function (modName) {
    if (this.containsModule(modName)) return;

    this.beginModuleDefinition(modName);
    var def = this.definitionDirectory.lookupModuleDefinition(modName);
    if (!def) {
	throw {message: "Reference to unknown module-definition '" + modName + "'",
	       name: modName};
    }
    var importedModules = def.importedModuleNames();
    for (var i = 0; i < importedModules.length; i++) {
	this.instantiateModule(importedModules[i]);
    }
    //print("Instantiating " + modName + "...");
    //print(def.constructFactory());
    var moduleExports = def.factory(this);
    this.registerModule(modName, moduleExports);
    return moduleExports;
};

function ModuleDefinitionDirectory() {
    this.definitions = {};
}

ModuleDefinitionDirectory.prototype.registerModuleDefinition = function (definition) {
    this.definitions[definition.name] = definition;
};

ModuleDefinitionDirectory.prototype.registerJsonModuleDefinition = function (definitionJson) {
    this.registerModuleDefinition(ModuleDefinition.fromJsonObject(definitionJson));
};

ModuleDefinitionDirectory.prototype.lookupModuleDefinition = function (name) {
    return this.definitions[name];
};
