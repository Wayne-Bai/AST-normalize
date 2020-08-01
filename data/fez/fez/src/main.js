var util = require("util"),
    ansi = require("ansi"),
    cursor = ansi(process.stdout),
    crypto = require("crypto"),
    through = require("through"),
    glob = require("glob"),
    path = require("path"),
    minimatch = require("minimatch"),
    isPromise = require("is-promise"),
    fs = require("fs"),
    mkdirp = require("mkdirp"),
    assert = require("assert"),
    Writable = require("stream").Writable,
    exec = require("child_process").exec,
    Promise = require("bluebird"),
    xtend = require("xtend"),
    Match = require("./match.js"),
    mxtend = require("xtend/mutable"),
    Input = require("./input.js"),
    flatten = require("./flatten.js"),
    getOptions = require("./options.js"),
    ProxyFile = require("./proxy-file.js").ProxyFile,
    ProxyFileList = require("./proxy-file.js").ProxyFileList,
    LazyFile = require("./lazy.js").LazyFile,
    LazyFileList = require("./lazy.js").LazyFileList,
    Set = require("./set.js");

var id = 0;

function fez(module) {
  var options, target;
  if(typeof module === "function") {
    options = xtend({ output: true }, getOptions());
    processTarget(module, options).then(function(work) {
      if(options.clean && !work) console.log("Nothing to clean.");
      else if(!options.clean && !work) console.log("Nothing to be done.");
    });
  } else if(require.main === module) {
    options = xtend({ output: true }, getOptions());
    target = getTarget(options);

    options.module = module;
    processTarget(module.exports[target], options).then(function(work) {
      if(options.clean && !work) console.log("Nothing to clean.");
      else if(!options.clean && !work) console.log("Nothing to be done.");
    });
  }
}

function getTarget(options) {
  return options.argv.remain.length ? options.argv.remain[0] : 'default';
}

function processTarget(target, options, shared) {
  if(!shared) {
    shared = { top: target, work: false, deleted: [] };
  }

  var stages = [],
      currentStage = null,
      spec = {},
      context = { nodes: new Set(), stages: stages, tasks: [], worklist: [], options: options, shared: shared },
      requires = [];

  spec.rule = function(primaryInput, secondaryInputs, output, fn) {
    if(arguments.length === 2) {
      fn = secondaryInputs;
      output = undefined;
      secondaryInputs = function() { return []; };
    } else if(arguments.length === 3) {
      fn = output;
      output = secondaryInputs;
      secondaryInputs = function() { return Promise.resolve([]); };
    }

    currentStage.rules.push({ primaryInput: primaryInput, secondaryInputs: secondaryInputs, output: output, fn: fn, stage: currentStage });
  };

  /*spec.before = function(output) {
    return new DoSpec([], toArray(output));
  };*/

  spec.after = function(input) {
    return new DoSpec(toArray(input), []);
  };

  spec.do = function(fn) {
    context.tasks.push({ fn: fn, inputs: [], outputs: [] });
  };

  function DoSpec(inputs, outputs) {
    this.inputs = inputs;
    this.outputs = outputs;
  }

  DoSpec.prototype.after = function(input) {
    return new DoSpec(this.inputs.concat(toArray(input)), this.outputs);
  };

  /*DoSpec.prototype.before = function(output) {
    return new DoSpec(this.input, this.outputs.concat(toArray(output)));
  };*/

  DoSpec.prototype.do = function(fn) {
    context.tasks.push({ fn: fn, inputs: this.inputs, outputs: this.outputs });
  };

  spec.with = function(globs) {
    return new Match(function(file) {
      return any(toArray(globs).map(function(glob) {
        return minimatch(file, glob);
      }));
    }, function(stage) {
      stages.push(stage);
      currentStage = stage;
    }, function () {
      currentStage = undefined;
    }, toArray(globs));
  };

  spec.use = function(target) {
    requires.push(target);
  };

  target(spec);

  return (function nextRequire() {
    if(requires.length > 0) {
      return processTarget(requires.shift(), options, shared).then(function() {
        return nextRequire();
      });
    } else {
      return loadInitialNodes(context);
    }
  })();
}

function loadInitialNodes(context) {
  context.stages.forEach(function(stage) {
    var inputs = [];
    stage.initialGlobs.forEach(function(g) {
      inputs = inputs.concat(glob.sync(g, { nosort: true }));
    });
    inputs = inputs.concat(context.shared.deleted.filter(stage.input)); // XXX: This line needs test coverage
    inputs.forEach(function(filename) {
      nodeForFile(context, filename);
    });
  });

  return work(context);
}

function work(context) {
  var worklist = context.worklist, changed = false;
  context.worklist = [];
  worklist.forEach(function(node) {
    changed = checkFile(context, node) || changed;
  });

  if(changed || context.worklist.length > 0) {
    return new Promise(function(resolve, reject) {
      setImmediate(function() {
        resolve(work(context));
      });
    });
  } else {
    if(context.options.clean) {
      var anything = false;
      context.nodes.array().filter(isFile).filter(not(isSource)).forEach(function(node) {
        try {
          fs.unlinkSync(node.file);
          anything = true;

          if(!context.options.quiet) {
            context.shared.deleted.push(node.file);
            anything = true;
            process.stdout.write("Removing ");
            cursor.red();
            console.log(node.file);
            cursor.reset();
          }
        } catch(e) {}
      });

      return Promise.resolve(anything);
    } else {
      context.tasks.forEach(function(task) {
        var taskNode = new TaskNode(task.fn);

        context.nodes.array().filter(isFile).forEach(function(node) {
          task.inputs.forEach(function(input) {
            if(typeof input === "string") {
              if(minimatch(node.file, input)) {
                node.outputs.push(taskNode);
                taskNode.inputs.push(node);
              }
            }
          });
        });

        task.inputs.forEach(function(input) {
          if(typeof input !== "string") {
            input.operations.forEach(function(op) {
              taskNode.inputs.push(op);
            });
          }
        });

        Promise.all(taskNode.inputs.map(promise)).then(function() {
          Promise.cast(taskNode.fn()).then(function() {
            taskNode._deferred.resolve();
          });
        });

        context.nodes.insert(taskNode);
      });

      context.nodes.array().filter(isMulti).forEach(function(node) {
        node.lazies._setFilenames(node.stageInputs.map(file));
      });

      context.nodes.array().filter(isSource).forEach(function(node) {
        node.complete();
      });

      return Promise.all(context.nodes.array().filter(isOperation).map(promise)).then(function(work) {
        if(context.options.dot) printGraph(context.nodes);
        return any(work);
      });
    }
  }
}

function isFile(node) {
  return node.file !== undefined;
}

function isOperation(node) {
  return node.rule !== undefined;
}

function isMulti(node) {
  return isOperation(node) && node.rule.stage.multi;
}

function isSource(node) {
  return isFile(node) && node.inputs.length === 0;
}

function not(fn) {
  return function(val) {
    return !fn(val);
  };
}

function printGraph(nodes) {
  process.stdout.write("digraph{");
  nodes.array().forEach(function(node) {
    var name;
    if(node.file) {
      name = node.file;
      //if(node.promise.isResolved())
      //name += "+";
      process.stdout.write(node.id + " [shape=box,label=\"" + name + "\"];");
    } else {
      name = node.rule.fn.name;

      if(name === "")
        name = "?";

      //if(node.promise.isResolved())
      //name += "+";

      process.stdout.write(node.id + " [label=\"" + name + "\"];");
    }
  });

  nodes.array().forEach(function(node) {
    if(node.output)
      process.stdout.write(node.id + "->" + node.output.id + ";");
    else if(node.outputs)
      node.outputs.forEach(function(output) {
        process.stdout.write(node.id + "->" + output.id + ";");
      });
  });

  process.stdout.write("}\n");
}

function checkFile(context, node) {
  return context.stages.map(function(stage) {
    return matchAgainstStage(context, node, stage);
  });
}

function evaluateOperation(context, node) {
  if(node.evaluated) return false;
  node.evaluated = true;
  if(node.rule.stage.multi) node.rule.stage.proxy._lazies = node.lazies;
  else node.rule.stage.proxy._setFile(node.stageInputs[0].lazy);

  var hasOutput = false, outNode;
  if(typeof node.rule.output === "string") {
    outNode = createOutNode(context, node, node.rule.output);
    hasOutput = true;
  } else if(node.rule.output !== undefined) {
    outNode = createOutNode(context, node, node.rule.output());
    hasOutput = true;
  }

  var primaryInputPromise = getPrimaryInputPromise(node, context);
  var secondaryInputPromise = getSecondaryInputPromise(node, context);
  
  if(!node.rule.stage.multi) node.rule.stage.proxy._setFile(undefined);
  else node.rule.stage.proxy._lazies = undefined;

  node.promise = Promise.all([primaryInputPromise, secondaryInputPromise]).spread(function(primaryInputs, secondaryInputs) {
    node.primaryInputs = primaryInputs;
    node.secondaryInputs = secondaryInputs;

    if(!hasOutput) {
      var hash = crypto.createHash("sha256");

      var inputs = primaryInputs.map(file).concat(secondaryInputs.map(file));
      inputs.forEach(function(input) {
        hash.update(input);
      });

      var filename = ".fez/" + (node.rule.fn.name === "" ? "" : node.rule.fn.name + ".") + hash.digest("base64").replace("+", "").replace("/", "").substr(0, 6) + "~";
      outNode = createOutNode(context, node, filename);
    }

    return Promise.all(flatten([node.primaryInputs.map(promise), secondaryInputs.map(promise)])).then(function() {
      return performOperation(node, context).then(function(val) {
        outNode.complete();
        return val;
      });
    });
  });

  return true;
}

function createOutNode(context, node, output) {
  var outNode = nodeForFile(context, output);
  node.outputs.push(outNode);
  outNode.inputs.push(node);
  node.output = outNode;
  return outNode;
}

function getPrimaryInputPromise(node, context) {
  var primaryInputPromise;
  if(node.rule.primaryInput instanceof ProxyFileList) primaryInputPromise = node.rule.primaryInput.names();
  else if(node.rule.primaryInput instanceof ProxyFile) primaryInputPromise = Promise.resolve(node.rule.primaryInput._inspect().getFilename());
  else primaryInputPromise = node.rule.primaryInput();

  return Promise.cast(primaryInputPromise).then(function(resolved) {
    var primaryInputs = [];

    toArray(resolved).forEach(function(file) {
      var input = nodeForFile(context, file);
      input.outputs.push(node);
      primaryInputs.push(input);
    });

    return primaryInputs;
  });
}

function getSecondaryInputPromise(node, context) {
  var secondaryInputPromise;
  secondaryInputPromise = node.rule.secondaryInputs();

  return Promise.cast(secondaryInputPromise).then(function(resolved) {
    var secondaryInputs = resolved.map(function(file) {
      var input = nodeForFile(context, file);
      input.complete();
      input.outputs.push(node);

      return input;
    });

    return secondaryInputs;
  });
}

function file(node) {
  return node.file;
}

function performOperation(node, context) {
  if(node.complete) return Promise.resolve(false);

  var inputs = node.primaryInputs.map(file).concat(node.secondaryInputs.map(file)),
      output = node.output.file;

  if(context.options.verbose)
    console.log(inputs.join(" "), "->", output);

  node.complete = true;

  if(needsUpdate(inputs, [output], context)) {
    var out = node.rule.fn(buildInputs(node.primaryInputs.map(file)), [output]);
    return processOutput(out, output, inputs, context);
  } else {
    return Promise.resolve(false);
  }
}

function buildInputs(files) {
  var inputs = [];
  files.forEach(function(file) {
    inputs.push(new Input(file));
  });

  inputs.asBuffers = function() {
    return this.map(function(i) { return i.asBuffer(); });
  };

  return inputs;
}

function processOutput(out, output, inputs, context) {
  if(isPromise(out)) {
    return out.then(function(out) {
      return processOutput(out, output, inputs);
    }, function(err) {
      console.log("An operation failed. Aborting.");
      if(err instanceof Error) console.log(err.stack);
      //(ibw) there's got to be a more elegant way to break out of the build
      process.exit(1);
      return Promise.resolve(true);
    });
  } else if(out instanceof Writable) {
    printCreating(output);

    return new Promise(function(resolve, reject) {
      out.pipe(fs.createWriteStream(output));
      out.on("end", function() {
        resolve(true);
      });
    });
  } else if(out instanceof Buffer || typeof out === "string") {
    printCreating(output);
    return writep(output, out);
  } else if(out === undefined) {
    return writep(output, new Buffer(0));
  } else if(out === null) {
    printCreating(output);
    return writep(output, new Buffer(0));
  } else if(out === true) {
    printCreating(output);
  } else if(typeof out === "function") {
    throw new Error("Output can't be a function. Did you forget to call the operation in your rule (e.g op())?");
  } else {
    throw new Error("Invalid operation output (" + Object.getPrototypeOf(out).constructor.name + '):' + out);
  }

  return Promise.resolve(true);
}

function printCreating(output) {
  process.stdout.write("Creating ");
  cursor.green();
  process.stdout.write(output + "\n");
  cursor.reset();
}

function promise(e) {
  return e.promise;
}

function matchAgainstStage(context, node, stage) {
  assert(isFile(node));
  var anyMatch = stage.input(node.file);

  if(anyMatch) {
    if(stage.one && stage.matched) {
      //TODO: say which stage/glob is matching
      console.log("Warning: a with(...).one(...) matches multiple files. Only using first match.");
      return false;
    } else if (stage.one) {
      stage.matched = true;
    }

    var change = false;

    stage.rules.forEach(function(rule) {
      var operation = getOperationForRule(context, rule);
      node.outputs.push(operation);
      operation.stageInputs.push(node);
      evaluateOperation(context, operation);
      change = true;
    });

    return change;
  }

  return false;
}

function getOperationForRule(context, rule) {
  if(rule.stage.multi) {
    if(!rule.operation) {
      rule.operation = { id: id++, stageInputs: [], outputs: [], rule: rule, lazies: new LazyFileList(context) };
      rule.stage.operations.push(rule.operation);
    }

    context.nodes.insert(rule.operation);
    return rule.operation;
  } else {
    var node = { id: id++, stageInputs: [], outputs: [], rule: rule };
    rule.stage.operations.push(node);
    context.nodes.insert(node);
    return node;
  }
}

function any(arr) {
  for(var i = 0; i < arr.length; i++)
    if(arr[i]) return true;
  return false;
}

function every(arr) {
  for(var i = 0; i < arr.length; i++)
    if(!arr[i]) return false;
  return true;
}

function nodeForFile(context, file) {
  assert(typeof file === "string");
  for(var i = 0; i < context.nodes.array().length; i++)
    if(context.nodes.array()[i].file === file) return context.nodes.array()[i];

  var node = new FileNode(context, file);
  context.nodes.insert(node);
  context.worklist.push(node);

  return node;
}

function TaskNode(fn) {
  this.fn = fn;
  this._deferred = Promise.defer();
  this.promise = this._deferred.promise;
  this.inputs = [];
  this.outputs = [];
}

function FileNode(context, file) {
  this.id = id++;
  this.file = file;
  this.inputs = [];
  this.outputs = [];
  this.lazy = new LazyFile(context, file);
  this._deferred = Promise.defer();
  this.promise = this._deferred.promise;
}

FileNode.prototype.complete = function() {
  if(!this._complete) {
    this.lazy._loadFile();
    this._deferred.resolve();
    this._complete = true;
  }
};

FileNode.prototype.isComplete = function() {
  return !!this._complete;
};

function toArray(obj) {
  if(Array.isArray(obj)) return obj;
  return [obj];
}

function writep(file, data) {
  if(!data) data = new Buffer(0);
  return new Promise(function(resolve, reject) {
    mkdirp(path.dirname(file), function(err) {
      if(err) reject(err);
      fs.writeFile(file, data, function(err) {
        if(err) reject(err);
        else resolve(true);
      });
    });
  });
}

function needsUpdate(inputs, outputs, context) {
  var mtime = 0;

  if(context.options.module) {
    var stat = fs.statSync(context.options.module.filename);
    mtime = stat.mtime.getTime();
  }

  var oldestOutput = Number.MAX_VALUE;
  outputs.forEach(function(out) {
    var dir = path.dirname(out);
    if(mkdirp.sync(dir)) {
      oldestOutput = 0;
    } else {
      try {
        var stat = fs.statSync(out),
            time = stat.mtime.getTime();

        if(time < oldestOutput)
          oldestOutput = time;
      } catch (e) {
        oldestOutput = 0;
      }
    }
  });

  var newestInput = 0;
  inputs.forEach(function(input) {
    try {
      var stat = fs.statSync(input),
          time = stat.mtime.getTime();

      if(time > newestInput)
        newestInput = time;
    } catch(e) {
      newestInput = 0;
    }
  });

  return (mtime > oldestOutput) || (newestInput > oldestOutput);
}

fez.exec = function(command) {
  function ex(inputs, output) {
    var ifiles = inputs.map(function(i) { return i.getFilename(); }).join(" "),
        ofiles = output.join(" "),
        pcommand = command.
          replace("%i", ifiles).
          replace("%o", ofiles);

    return new Promise(function(resolve, reject) {
      exec(pcommand, function(err) {
        if(err) reject(err);
        else resolve(true);
      });
    });
  }

  ex.value = command;
  return ex;
};

module.exports = fez;

