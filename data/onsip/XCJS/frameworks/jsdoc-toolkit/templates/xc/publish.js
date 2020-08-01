/*global JSDOC Link SYS defined IO*/
var toReplace = [{
  regexp: new RegExp('\\b' + 'boolean break byte case catch char class const continue debugger default delete do double else false finally float for function if in instanceof int long new return switch this throw throws true try typeof var while'.replace(/ /g, '\\b|\\b') + '\\b', 'gm'),
  css: 'keyword'
}, {
  regexp: new RegExp('\\b' + 'null undefined'.replace(/ /g, '\\b|\\b') + '\\b', 'gm'),
  css: 'value'
}, {
  regexp: new RegExp('[-+]?[0-9]*\\.?[0-9]+([eE][-+]?[0-9]+)?', 'g'),
  css: 'string'
}, {
  regexp: new RegExp('"(?:\\.|(\\\\\\")|[^\\""\\n])*"', 'g'),
  css: 'string'
}, {
  regexp: new RegExp("'(?:\\.|(\\\\\\')|[^\\''\\n])*'", 'g'),
  css: 'string'
}, {
  regexp: new RegExp('/\\*[\\s\\S]*?\\*/', 'gm'),
  css: 'comment'
}, {
  regexp: new RegExp('//.*$', 'gm'),
  css: 'single-line-comment'
}], guid = 0;

/** highlight an example code block, formatting it properly */
function highlightBlock(block) {
  var raw = block;
  block = String(block).replace(/ /g, '&nbsp;')
                       .replace(/</g, '&lt;')
                       .replace(/>/g, '&gt;');

  var matches = [], match, regexp, css, i, len, other, idx, res = [];
  for (i = 0, len = toReplace.length; i < len; i++) {
    regexp = toReplace[i].regexp;
    css = toReplace[i].css;
    while ((match = regexp.exec(block)) !== null) {
      matches.push({ value: match[0],
                     index: match.index,
                     length: match[0].length,
                     css: css });
    }
  }
  matches = matches.sort(function (a, b) {
    return a.index < b.index ? -1: a.index > b.index ? 1 :
                                   a.length < b.length ? -1:
                                   a.length > b.length ? 1 : 0;
  });

  for (i = 0, len = matches.length; i < len; i++) {
    match = matches[i];
    for (var j = 0; j < matches.length; j++) {
      other = matches[j];
      if (other === null) continue;
      if (match.index > other.index && match.index < other.index + other.length) {
        matches[i] = null;
        break;
      }
    }
  }

  idx = 0;
  for (i = 0, len = matches.length; i < len; i++) {
    match = matches[i];

    if (match === null || match.length === 0) continue;
    res.push(block.slice(idx, match.index));
    if (match.css === "single-line-comment") {
      res.push('<span class="');
      res.push(match.css);
      res.push('">');
      res.push('//');
      res.push("</span>");
      res.push(match.value.slice(2));
    } else {
      res.push('<span class="');
      res.push(match.css);
      res.push('">');
      res.push(match.value);
      res.push("</span>");
    }
    idx = match.index + match.length;
  }
  res.push(block.slice(idx));

  return res.join('').replace(/\n/gm, '<br/>');
}

/** Called automatically by JsDoc Toolkit. */
function publish(symbolSet) {
	publish.conf = {  // trailing slash expected for dirs
		ext:          ".html",
		outDir:       JSDOC.opt.d || SYS.pwd + "../out/jsdoc/",
		templatesDir: JSDOC.opt.t || SYS.pwd + "../templates/jsdoc/",
		symbolsDir:   "symbols/",
		srcDir:       "symbols/src/"
	};
  var context = {
    t: publish.conf.templatesDir,
    d: publish.conf.outDir
  };
	
	// is source output is suppressed, just display the links to the source file
	if (JSDOC.opt.s && defined(Link) && Link.prototype._makeSrcLink) {
		Link.prototype._makeSrcLink = function (srcFilePath) {
			return "&lt;" + srcFilePath + "&gt;";
		};
	}
	
	// create the folders and subfolders to hold the output
	IO.mkPath((publish.conf.outDir + "symbols/src").split("/"));
		
	// used to allow Link to check the details of things being linked to
	Link.symbolSet = symbolSet;

	// create the required templates
  var classTemplate, classesTemplate;
	try {
    classTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + "class.tmpl");
    classesTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + "allclasses.tmpl");
	} catch (e) {
    print("Couldn't create the required templates: " + e);
    quit();
	}
	
	// some utility filters
  function hasNoParent($) {
    return ($.memberOf === "");
  }
  function isaFile($) {
    return ($.is("FILE"));
  }
  function isaClass($) {
    return ($.is("CONSTRUCTOR") || $.isNamespace) && $.alias !== "_global_";
  }
	
	// get an array version of the symbolset, useful for filtering
	var symbols = symbolSet.toArray(), i, l;
	
	// create the hilited source code files
	var files = JSDOC.opt.srcFiles;
  for (i = 0, l = files.length; i < l; i++) {
    var file = files[i];
    var srcDir = publish.conf.outDir + "symbols/src/";
    makeSrcFile(file, srcDir);
  }

 	// get a list of all the classes in the symbolset
  var classes = symbols.filter(isaClass).sort(makeSortby("alias"));

	// create a class index, displayed in the left-hand column of every class page
	Link.base = "../";
  publish.classesIndex = classesTemplate.process(classes); // kept in memory

	// create each of the class pages
	for (i = 0, l = classes.length; i < l; i++) {
		var symbol = classes[i];

		symbol.events = symbol.getEvents();   // 1 order matters
		symbol.methods = symbol.getMethods(); // 2

		var output = "";
		output = classTemplate.process(symbol);
		IO.saveFile(publish.conf.outDir + "symbols/", symbol.alias + publish.conf.ext, output);
	}
	
	// regenerate the index with different relative links, used in the index pages
	Link.base = "";
	publish.classesIndex = classesTemplate.process(classes);

	// create the class index page
  var classesindexTemplate;
	try {
		classesindexTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + "index.tmpl");
	}	catch (e) {
    print(e.message);
    quit();
  }
  
  context.s = context.d + "static/";
	IO.mkPath(context.s);
	IO.copyFile(context.t + 'static/default.css', context.s);
	IO.copyFile(context.t + 'static/doc.css', context.s);
	IO.copyFile(context.t + 'static/dot.gif', context.s);
	IO.copyFile(context.t + 'static/icn_resize-pane_vertical.png', context.s);
	
	var classesIndex = classesindexTemplate.process(classes);
	IO.saveFile(publish.conf.outDir, "index" + publish.conf.ext, classesIndex);
	classesindexTemplate = classesIndex = classes = null;
	
	// create the file index page
  var fileindexTemplate;
	try {
		fileindexTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + "allfiles.tmpl");
	}	catch (e) {
    print(e.message);
    quit();
  }
	
	var documentedFiles = symbols.filter(isaFile); // files that have file-level docs
	var allFiles = []; // not all files have file-level docs, but we need to list every one

	for (i = 0; i < files.length; i++) {
		allFiles.push(new JSDOC.Symbol(files[i], [], "FILE", new JSDOC.DocComment("/** */")));
	}

	for (i = 0; i < documentedFiles.length; i++) {
		var offset = files.indexOf(documentedFiles[i].alias);
		allFiles[offset] = documentedFiles[i];
	}

	allFiles = allFiles.sort(makeSortby("name"));

	// output the file index page
	var filesIndex = fileindexTemplate.process(allFiles);
	IO.saveFile(publish.conf.outDir, "files" + publish.conf.ext, filesIndex);
	fileindexTemplate = filesIndex = files = null;
}

/** Just the first sentence (up to a full stop). Should not break on dotted variable names. */
function summarize(desc) {
	if (typeof desc !== "undefined") {
		return desc.match(/([\w\W]+?\.)[^a-z0-9_$]/i) ? RegExp.$1 : desc;
  }
  return "";
}

/** Make a symbol sorter by some attribute. */
function makeSortby(attribute) {
	return function(a, b) {
		if (a[attribute] != undefined && b[attribute] != undefined) {
			a = a[attribute].toLowerCase();
			b = b[attribute].toLowerCase();
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		}
	};
}

/** Pull in the contents of an external file at the given path. */
function include(path) {
	return IO.readFile(publish.conf.templatesDir + path);
}

/** Turn a raw source file into a code-hilited page in the docs. */
function makeSrcFile(path, srcDir, name) {
	if (JSDOC.opt.s) return;
	
	if (!name) {
		name = path.replace(/\.\.?[\\\/]/g, "").replace(/[\\\/]/g, "_");
		name = name.replace(/\:/g, "_");
	}
	
	var src = {path: path, name: name, charset: IO.encoding, hilited: ""};
	
	if (defined(JSDOC.PluginManager)) {
		JSDOC.PluginManager.run("onPublishSrc", src);
	}

	if (src.hilited) {
		IO.saveFile(srcDir, name + publish.conf.ext, src.hilited);
	}
}

/** Build output for displaying function parameters. */
function makeSignature(params) {
	if (!params) {
    return "()";
  }

	var signature = "(" +
    params.filter(function ($) {
			return $.name.indexOf(".") === -1; // don't show config params in signature
		}).map(function ($) {
			return $.name;
		}).join(", ") + ")";
	return signature;
}

/** Find symbol {@link ...} strings in text and turn into html links */
function resolveLinks(str, from) {
	str = str.replace(/\{@link ([^} ]+) ?\}/gi,
		function (match, symbolName) {
			return new Link().toSymbol(symbolName);
		}
	);
	
	return str;
}

function generateClassTree(data) {
  var klass, parts, name, parents = 0, tree = "";
  for (var i = 0, len = data.length; i < len; i++) {
    klass = data[i];

    parts = klass.alias.split('.');
    parts = parts.slice(0, -1).concat(parts.slice(-1).toString().split('#'));
    name = parts.slice(-1);
    if (parts.length === parents) {
      tree += "<li>" + new Link().toClass(klass.alias).withText(name) + "</li>";
    } else if (parts.length > parents) {
      tree += "<ul>";
      tree += "<li>" + new Link().toClass(klass.alias).withText(name) + "</li>";
      parents = parts.length;
    } else if (parts.length < parents) {
      while (parts.length < parents) {
        tree += "</ul>";
        parents--;
      }
      tree += "<li>" + new Link().toClass(klass.alias).withText(name) + "</li>";
    }
  }
  return tree + "</ul>";
}
