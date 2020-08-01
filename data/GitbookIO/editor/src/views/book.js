define([
    "hr/hr",
    "hr/promise",
    "utils/normalize",
    "utils/loading",
    "utils/dialogs",
    "utils/normalize",
    "utils/analytic",
    "models/article",
    "models/book",
    "collections/glossary",
    "collections/plugins",
    "core/server",
    "core/settings",
    "views/grid",
    "views/summary",
    "views/editor",
    "views/preview"
], function(hr, Q, normalize, loading, dialogs, normalize, analytic, Article, Book, Glossary, Plugins, server, settings, Grid, Summary, Editor, Preview) {
    var generate = node.require("gitbook").generate,
        normalizeFilename = node.require("normall").filename,
        dirname = node.require("path").dirname;
    var gui = node.gui;

    var BookView = hr.View.extend({
        className: "book",
        defaults: {
            base: null
        },

        initialize: function() {
            BookView.__super__.initialize.apply(this, arguments);

            this.model = this.model || new Book({}, {
                base: this.options.base
            });
            this.editorSettings = settings;

            // Map article path -> content
            this.articles = {};
            this.currentArticle = null;

            // Glossary
            this.glossary = new Glossary();
            this.listenTo(this.glossary, "add remove change reset", this.updateGlossaryMenu);

            // Plugins
            this.plugins = new Plugins();
            this.listenTo(this.plugins, "add remove change reset", this.updatePluginsMenu);

            // Main grid
            this.grid = new Grid({
                columns: 3
            }, this);
            this.grid.appendTo(this);

            // Summary
            this.summary = new Summary({}, this);
            this.summary.update();
            this.grid.addView(this.summary, {width: 18});

            // Editor
            this.editor = new Editor({}, this);
            this.editor.update();
            this.grid.addView(this.editor);

            // Preview
            this.preview = new Preview({}, this);
            this.preview.update();
            this.grid.addView(this.preview);

            // Autosave
            this.listenTo(this, "article:write", _.debounce(this.autoSave, 1000));

            // Languages menu
            this.listenTo(this.model, "change:langs", this.updateLanguagesMenu);
            this.listenTo(this.model, "change:lang", function() {
                return loading.show(this.updateContent(), "Switching to language '"+this.model.get("lang.lang")+"' ...");
            });
            this.listenTo(this.model, "set:lang", this.updateLanguagesMenu);
            this.updateLanguagesMenu();

            loading.show(this.updateContent(), "Loading book content ...");
        },

        // Update all content
        updateContent: function() {
            var that = this;

            return this.summary.load()
            .then(function() {
                return that.loadGlossary();
            })
            .then(function() {
                return that.loadPlugins();
            })
            .then(function() {
                return that.openReadme();
            })
            .fail(dialogs.error);
        },

        // Update glossary menu
        updateGlossaryMenu: function() {
            var that = this;
            var submenu = new gui.Menu();

            submenu.append(new gui.MenuItem({
                label: 'New Entry',
                click: function () {
                    that.editGlossaryTerm();
                }
            }));
            submenu.append(new gui.MenuItem({
                type: 'separator'
            }));

            _.chain(this.glossary.models)
            .map(function(entry) {
                return new gui.MenuItem({
                    label: entry.get("name"),
                    click: function () {
                        that.editGlossaryTerm(entry.get("name"));
                    }
                });
            })
            .each(submenu.append.bind(submenu));
            this.parent.glossaryMenu.submenu = submenu;
        },

        // Update plugins menu
        updatePluginsMenu: function() {
            var that = this;
            var submenu = new gui.Menu();

            submenu.append(new gui.MenuItem({
                label: 'New Plugin',
                click: function () {
                    that.addPlugin();
                }
            }));
            submenu.append(new gui.MenuItem({
                label: 'Install Plugins',
                click: function () {
                    loading.show(that.model.installDependencies(), "Installing Dependencies ...")
                    .fail(dialogs.error);
                }
            }));
            submenu.append(new gui.MenuItem({
                type: 'separator'
            }));

             _.chain(this.plugins.models)
            .map(function(plugin) {
                var actions = new gui.Menu();

                actions.append(new gui.MenuItem({
                    label: "Edit Configuration",
                    click: function() {
                        dialogs.json(plugin.get("config"), {
                            title: "Configuration for '"+_.escape(plugin.get("name"))+"' plugin"
                        })
                        .then(function(config) {
                            plugin.set("config", config);
                            return that.savePlugins();
                        });
                    }
                }));

                actions.append(new gui.MenuItem({
                    label: "Remove",
                    click: function() {
                        plugin.destroy();

                        that.savePlugins();
                    }
                }));


                return new gui.MenuItem({
                    label: plugin.get("name"),
                    submenu: actions
                });
            })
            .each(submenu.append.bind(submenu));
            this.parent.pluginsMenu.submenu = submenu;
        },

        // Update languages menu
        updateLanguagesMenu: function() {
            var that = this;
            var submenu = new gui.Menu();
            var currentLang = this.model.get("lang");

            _.chain(this.model.get("langs"))
            .map(function(lang) {
                return new gui.MenuItem({
                    label: lang.title,
                    type: "checkbox",
                    checked: currentLang.lang == lang.lang,
                    click: function () {
                        that.model.set("lang", lang);
                    }
                });
            })
            .each(submenu.append.bind(submenu));
            this.parent.langsMenu.submenu = submenu;
        },

        // Build the book (website)
        buildBook: function(params, options) {
            var that = this;

            var p = generate.folder(_.extend(params || {}, {
                input: this.model.root()
            }));

            return loading.show(p, "Building website ...");
        },

        // Generate a file (pdf or ebook)
        buildBookFile: function(format, params) {
            var that = this;

            var filename = "book."+format;

            dialogs.saveAs(filename)
            .then(function(_path) {
                var p = generate.file(_.extend(params || {}, {
                    extension: format,
                    input: that.model.root(),
                    output: _path,
                    generator: "ebook"
                }))

                return loading.show(p, "Building ebook ("+format+") ...")
                .then(_.constant(_path));
            })
            .then(function(_path) {
                node.gui.Shell.showItemInFolder(_path);
            }, dialogs.error);
        },

        // Refresh preview
        refreshPreviewServer: function(open) {
            var that = this;

            return server.stop()
            .then(function() {
                return loading.show(that.buildBook(), "Preparing website for preview ...");
            })
            .then(function(options) {
                return server.start(options.output)
            })
            .then(function() {
                if (open != false) server.open(that.currentArticle);
            }, dialogs.error);
        },

        // Ask user to set a cover picture
        setCover: function() {
            var that = this;

            return dialogs.file()
            .then(function(coverFile) {
                var d = Q.defer();

                var canvas = $("<canvas>")[0];
                canvas.width = 1800;
                canvas.height = 2360;

                var ctx = canvas.getContext("2d");
                var img = $("<img>", {
                    src: "file://"+coverFile,
                });
                img = img[0];
                img.onload = function () {
                    ctx.drawImage(img, 0, 0, 1800, 2360);
                    var imgBig = canvas.toDataURL("image/jpeg");

                    canvas.width = 200;
                    canvas.height = 262;
                    ctx.drawImage(img, 0, 0, 200, 262);
                    var imgSmall = canvas.toDataURL("image/jpeg");

                    d.resolve({
                        big: imgBig,
                        small: imgSmall
                    });
                };
                img.onerror = function(err) {
                    d.reject(err);
                };

                return d.promise;
            })
            .then(function(img) {
                return Q.all([
                    that.model.write("cover.jpg", normalize.dataTobuffer(img.big)),
                    that.model.write("cover_small.jpg", normalize.dataTobuffer(img.small))
                ]);
            })
            .fail(dialogs.alert);
        },

        // Open a specific article
        openArticle: function(article) {
            var that = this;

            var path = article.get("path");

            var normalize = function(path){
                path = path.replace(".md","").split("/");
                for (var i = 0; i < path.length; i++) {
                    path[i] = normalizeFilename(path[i]);
                };
                if (path[path.length -1] === "readme"){
                    path[path.length -1] = "README";
                }
                path = path.join("/") + ".md";
                return path;
            };

            var updateArticlePath = function(path) {
                if (!that.model.isValidPath(path)) return Q.reject(new Error("Invalid path for saving this article, need to be on the book repository."));
                path = that.model.contentVirtualPath(path);
                article.set("path", normalize(path));
                return Q();
            };

            var doOpen = function() {
                that.currentArticle = article;
                that.trigger("article:open", article);
                that.triggerArticleState(article);

                that.toggleArticlesClass(article, "active");

                return Q();
            };

            var doSaveAndOpen = function() {
                return Q()
                .then(function(){
                    if (path && that.editorSettings.get("autoFileManagement")){
                        article.set("path", normalize(path));
                        return Q();
                    }else{
                        return dialogs.saveAs(article.get("title")+".md", that.model.contentRoot())
                        .then(updateArticlePath);
                    }

                })
                // Check if it's going to overwrite anything
                .then(function overwriteDetection(){
                    return that.model.contentExists(article.get("path"))
                    .then(function(exists){
                        if (exists){
                            return dialogs.saveAs("File name should be unique.", that.model.root())
                            .then(updateArticlePath);
                        }else{
                            return Q();
                        }
                    })
                })
                // Write article
                .then(function() {
                    return that.writeArticle(article, "# "+article.get("title")+"\n")
                })
                // Save the article
                .then(function() {
                    return that.saveArticle(article);
                })
                // Save summary
                .then(function() {
                    return that.summary.save();
                })
                .then(function() {
                    return doOpen();
                })
                .fail(function(err) {
                    dialogs.alert("Error", err.message || err);
                });
            };

            return this.autoSave()
            .fail(_.constant(Q()))
            .then(function() {
                if (!path) {
                    return doSaveAndOpen();
                } else {
                    return that.model.contentExists(path)
                    .then(function(exists) {
                        if (exists) {
                            return doOpen();
                        } else {
                            return doSaveAndOpen();
                        }
                    });
                }
            });
        },

        // Open readme
        openReadme: function() {
            return this.openArticle(this.summary.getIntroduction());
        },

        // Get unsaved article
        getUnsavedArticles: function() {
            return _.chain(this.articles)
            .map(function(article, _path) {
                article.path = _path;
                return article;
            })
            .filter(function(article) {
                return !article.saved;
            })
            .value();
        },

        // Save all unsaved
        saveAll: function() {
            _.each(this.getUnsavedArticles(), function(_article) {
                var article = this.summary.getArticle(_article.path);
                if (article) this.saveArticle(article);
            }, this);
        },

        // Autosave (if enabled) current file
        autoSave: function(article) {
            article = article || this.currentArticle;
            if (!settings.get("autoSave") || !article) return Q();

            return this.saveArticle(article);
        },

        // Open edit book.json dialog
        editConfig: function() {
            var that = this;

            return this.model.readConfig()
            .then(function(content) {
                return dialogs.json(content, {
                    title: "Edit Book Configuration (book.json)"
                })
            })
            .then(function(content) {
                return that.model.writeConfig(content).fail(dialogs.error);
            })
            .then(function() {
                return that.loadPlugins();
            });
        },

        // Read/Write article in this fs
        readArticle: function(article) {
            var that = this;
            var path = article.get("path");

            if (this.articles[path]) return Q(this.articles[path].content);

            return this.model.contentRead(path)
            .then(function(content) {
                that.articles[path] = {
                    content: content,
                    saved: true
                };
                return content;
            });
        },

        // Update article buffer
        writeArticle: function(article, content) {
            var path = article.get("path");

            this.articles[path] = this.articles[path] || {};
            this.articles[path].saved = false;
            this.articles[path].content = content;

            this.trigger("article:write", article);
            this.triggerArticleState(article);

            return Q();
        },

        // Save an article
        saveArticle: function(article, options) {
            options = _.defaults(options || {}, {
                cursor: this.editor.getCursor()
            });


            var that = this;
            var path = article.get("path");
            if (!this.articles[path]) return Q.reject(new Error("No content to save for this article"));

            // Normalize content before saving
            var content = this.articles[path].content;
            if (settings.get("normalizeEof")) content = normalize.eof(content, options);
            if (settings.get("normalizeWhitespace")) content = normalize.whitespace(content, options);

            analytic.track("save");

            // Try to create the directory
            return that.model.contentMkdir(dirname(path))
            .then( function(){
                return that.model.contentWrite(path, content)
            })
            .then(function() {
                that.articles[path].saved = true;
                that.triggerArticleState(article);

                // Update code views
                that.trigger("article:save", article, content);

                if (server.isRunning() && settings.get("restartPreviewOnSave")) {
                    that.refreshPreviewServer(false);
                }
            });
        },

        // Load glossary
        loadGlossary: function() {
            var that = this;

            return this.model.contentRead("GLOSSARY.md")
            .fail(function() {
                return "";
            })
            .then(function(content) {
                that.glossary.parseGlossary(content);
            });
        },

        // Save glossary
        saveGlossary: function() {
            var that = this;

            return Q()
            .then(function() {
                var content = that.glossary.toMarkdown();
                return that.model.contentWrite("GLOSSARY.md", content)
            });
        },

        // Load plugins
        loadPlugins: function() {
            return this.plugins.parsePlugins(this.model);
        },

        // Save plugins
        savePlugins: function() {
            return this.plugins.toFs(this.model)
            .fail(dialogs.error)
        },

        // Add plugins
        addPlugin: function() {
            var that = this;

            return dialogs.prompt("New Plugin", "Enter the name of the plugin to be added.")
            .then(function(plugin) {
                if (that.plugins.get(plugin)) return;

                that.plugins.add({
                    name: plugin
                });
                return that.savePlugins();
            })
        },

        // Add term in glossary
        editGlossaryTerm: function(name, description) {
            var that = this;
            name = name || "";
            description = description || "";

            var fields = {
                name: {
                    label: "Name",
                    type: "text"
                },
                description: {
                    label: "Description",
                    type: "textarea"
                }
            };

            // Search if entry already exists
            var entry = this.glossary.getByName(name);
            if (entry) {
                name = entry.get("name");
                description = entry.get("description");

                fields["delete"] = {
                    label: "Delete",
                    type: "checkbox"
                };
            }


            return dialogs.fields("Glossary Entry", fields, {
                'name': name,
                'description': description
            })
            .then(function(_entry) {
                if (_entry.delete) {
                    return entry.destroy();
                }

                if (entry) {
                    entry.set(_entry);
                } else {
                    that.glossary.add(_entry);
                }
            })
            .then(function() {
                return that.saveGlossary();
            })
            .then(function() {
                return that.loadGlossary();
            })
            .fail(dialogs.error);
        },

        // Update article state
        triggerArticleState: function(article) {
            var path = article.get("path");
            var st = this.articles[path]? this.articles[path].saved : true;

            this.trigger("article:state", article, st);
            this.toggleArticleClass(article, "modified", !st);
        },

        // return article state
        getArticleState: function(article) {
            article = article || this.currentArticle;
            var path = article.get("path");
            return this.articles[path];
        },
        toggleArticleClass: function(article, className, st) {
            this.$("*[data-article='"+article.get("path")+"']").toggleClass(className, st);
        },
        toggleArticlesClass: function(article, className) {
            this.$("*[data-article]").each(function() {
                $(this).toggleClass(className, $(this).data("article") == article.get("path"));
            });
        },

        // Show/hide summary panel
        toggleSummaryPanel: function(st) {
            if (st == null) st = !this.summary._gridOptions.enabled;
            this.summary._gridOptions.enabled = st;
            this.grid.update();

            return st;
        },

        // Show/hide preview panel
        togglePreviewPanel: function(st) {
            if (st == null) st = !this.preview._gridOptions.enabled;
            this.preview._gridOptions.enabled = st;
            this.grid.update();

            return st;
        }
    });

    return BookView;
});
