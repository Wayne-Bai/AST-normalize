define([
    "hr/hr",
    "hr/promise",
    "hr/utils"
], function(hr, Q, _) {
    var npmi = node.require("npmi");
    var fs = node.require("fs");
    var path = node.require("path");
    var parse = node.require("gitbook").parse;

    var Book = hr.Model.extend({
        defaults: {
            base: "",
            lang: {
                title: "Default",
                path: "./",
                lang: "default"
            },
            langs: []
        },

        isValidPath: function(_path) {
            return _path.indexOf(this.get("base")) === 0;
        },
        virtualPath: function(_path) {
            return path.relative(this.get("base"), _path);
        },
        contentVirtualPath: function(_path) {
            return path.relative(path.join(this.get("base"), this.get("lang.path", "./")), _path);
        },
        realPath: function(_path) {
            return path.join(this.get("base"), _path);
        },
        contentPath: function(_path) {
            return path.join(this.get("lang.path", "./"), _path);
        },
        root: function() {
            return this.realPath("/");
        },
        contentRoot: function() {
            return this.realPath(this.get("lang.path", "./"));
        },

        /*
         * Read a directory content by its path
         *
         * @return Promise([File])
         */
        readdir: function(_path) {
            var that = this;
            _path = this.realPath(_path);

            return Q.nfcall(fs.readdir, _path)
            .then(function(files) {
                return Q.all(
                    _.chain(files)
                    .filter(function(file) {
                        if (file == "." || file == "..") return false;
                        return true;
                    })
                    .map(function(file) {
                        var f_path = path.join(_path, file);

                        return Q.nfcall(fs.stat, f_path)
                        .then(function(_stat) {
                            return {
                                'path': that.virtualPath(f_path),
                                'name': file,
                                'isDirectory': _stat.isDirectory()
                            };
                        });
                    }).__wrapped__
                );
            });
        },

        /*
         * Try to make a directory by its path
         *
         * @return Promise()
         */
        mkdir: function(_path) {
            var that = this;
            return that.exists(_path)
            .then(function(exists){
                if (! exists){
                    _path = that.realPath(_path);
                    return Q.nfcall(fs.mkdir, _path);
                }else{
                    return Q();
                }
            });
        },
        /*
         * Remove a directory by its path
         *
         * @return Promise()
         */
        rmdir: function(_path) {
            var that = this;
            return that.readdir(_path)
            .then(function(files){
                return Q.all(
                    _.map(files, function(file){
                        if (file.isDirectory){
                            return that.rmdir(file.path);
                        }else{
                            return that.unlink(file.path);
                        }
                    })
                );
            })
            .then(function() {
                return Q.nfcall(fs.rmdir, that.realPath(_path));
            });
        },

        /*
         * Read a file by its path
         *
         * @return Promise(String)
         */
        read: function(_path) {
            var that = this;
            _path = this.realPath(_path);

            return Q.nfcall(fs.readFile, _path)
            .then(function(buf) {
                return buf.toString();
            });
        },

        /*
         * Write a file by its path
         *
         * @return Promise()
         */
        write: function(_path, content) {
            var that = this;
            _path = this.realPath(_path);

            return Q.nfcall(fs.writeFile, _path, content);
        },

        /*
         * Unlink a file by its path
         *
         * @return Promise()
         */
        unlink: function(_path) {
            var that = this;
            return that.exists(_path)
            .then(function(exists){
                if (exists){
                    _path = that.realPath(_path);
                    return Q.nfcall(fs.unlink, _path);
                }
                return Q();
            })
        },

        /*
         * Check a file exists
         *
         * @return boolean
         */
        exists: function(_path) {
            var that = this;
            _path = this.realPath(_path);

            var deferred = Q.defer();
            fs.exists(_path, function(exists) {
                deferred.resolve(exists);
            });
            return deferred.promise;
        },

        /*
         *  Valid that is a gitbook
         */
        valid: function() {
            var that = this;

            return that.exists("README.md")
            .then(function(exists) {
                if (!exists) {
                    return Q.reject(new Error("Invalid GitBook: need README.md"));
                }
                return that.langs();
            })
            .then(function(langs) {
                that.set("lang", _.first(langs));
                return that.contentExists("SUMMARY.md")
            })
            .then(function(exists) {
                if (!exists) {
                    return Q.reject(new Error("Invalid GitBook: need SUMMARY.md"));
                }
            });
        },

        /*
         *  Return a title for this book
         */
        title: function() {
            return path.basename(this.root());
        },

        /*
         * Get langs index
         */
        langs: function() {
            var that = this;

            return that.exists("LANGS.md")
            .then(function(e) {
                if (!e) return [
                    {
                        title: "Default",
                        path: "./",
                        lang: "default"
                    }
                ];

                return that.read("LANGS.md")
                .then(function(content) {
                    return parse.langs(content)
                }).get("list");
            })
            .then(function(langs) {
                that.set("langs", langs);
                return langs;
            });
        },

        contentReaddir: function(_path) {
            return this.readdir(this.contentPath(_path));
        },
        contentMkdir: function(_path) {
            return this.mkdir(this.contentPath(_path));
        },
        contentRmdir: function(_path) {
            return this.rmdir(this.contentPath(_path));
        },
        contentRead: function(_path) {
            return this.read(this.contentPath(_path));
        },
        contentWrite: function(_path, content) {
            return this.write(this.contentPath(_path), content);
        },
        contentUnlink: function(_path) {
            return this.unlink(this.contentPath(_path));
        },
        contentExists: function(_path) {
            return this.exists(this.contentPath(_path));
        },

        /*
         *  Read book.json
         */
        readConfig: function() {
            return this.read("book.json")
            .fail(function() {
                return "{}"
            })
            .then(function(content) {
                return JSON.parse(content);
            })
            .fail(function(err) {
                return Q.reject(new Error("Error parsing book configuration file (book.json): " + (err.message || err)));
            });
        },

        /*
         *  Write book.json
         */
        writeConfig: function(config) {
            var that = this;

            return Q()
            .then(function() {
                return that.write("book.json", JSON.stringify(config, null, 4));
            });
        },

        /*
         *  Install dependencies
         */
        installDependencies: function() {
            var that = this;
            return this.exists("package.json")
            .then(function(e) {
                if (!e) throw "No plugins to install (package.json not found).";

                return Q.nfcall(npmi, {
                    'path': that.root()
                });
            });
        }
    });

    return Book;
});