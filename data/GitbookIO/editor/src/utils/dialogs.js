define([
    "hr/promise",
    "hr/dom",
    "hr/hr",
    "views/dialog"
], function (Q, $, hr, DialogView) {
    var fs = node.require("fs");

    var Dialogs = {
        /**
         * Open a dialog from a specific view class with some configuration
         *
         * @param {DialogView} cls dialog view class
         * @param {options} options dialog view constructor options
         * @return {promise}
         */
        open: function(cls, options) {
            var d = Q.defer();

            cls = cls || DialogView;
            var diag = new cls(options);

            diag.once("close", function(result, e) {
                if (result != null) {
                    d.resolve(result);
                } else {
                    d.reject(result);
                }
            });
            setTimeout(function() {
                d.notify(diag);
            }, 1);
            diag.update();

            return d.promise;
        },

        /**
         * Open a form modal dialog with different field inputs
         *
         * @param {object} fields map of fields (standard with settings fields)
         */
        fields: function(title, sections, values, options) {
            if (!_.isArray(sections)) sections = [sections];

            var fields = _.reduce(sections, function(prev, value) { return _.merge(prev, value); }, {});

            return Dialogs.open(null, _.defaults(options || {}, {
                "title": title,
                "sections": sections,
                "values": values || {},
                "dialog": "fields",
                "autoFocus": true,
                "valueSelector": function(that) {
                    var data = {};

                    var selectors = {
                        'text': function(el) { return el.val(); },
                        'password': function(el) { return el.val(); },
                        'textarea': function(el) { return el.val(); },
                        'number': function(el) { return el.val(); },
                        'select': function(el) { return el.val(); },
                        'checkbox': function(el) { return el.is(":checked"); },
                        'action': function(el)  { return null; }
                    };

                    _.each(fields, function(field, key) {
                        var v = selectors[field.type](that.$("*[name='"+ key+"']"));
                        if (v !== null) data[key] = v;
                    });
                    return data;
                }
            }));
        },

        /**
         * Open a prompt modal dialog
         *
         * @param {string} title
         * @param {string} message
         * @param {string} defaultmsg
         */
        prompt: function(title, message, defaultmsg) {
            return Dialogs.open(null, {
                "title": title,
                "message": message,
                "dialog": "prompt",
                "default": defaultmsg,
                "autoFocus": true,
                "valueSelector": "selectorPrompt"
            });
        },

        /**
         * Open a select modal dialog
         *
         * @param {string} title
         * @param {string} message
         * @param {object} choices
         * @param {string} defaultChoice
         */
        select: function(title, message, choices, defaultChoice) {
            return Dialogs.open(null, {
                "title": title,
                "message": message,
                "dialog": "select",
                "default": defaultChoice,
                "choices": choices,
                "autoFocus": true,
                "valueSelector": "selectorPrompt"
            });
        },

        /**
         * Open a confirmation modal dialog
         *
         * @param {string} title
         * @param {string} message
         */
        confirm: function(title, message) {
            if (!message) {
                message = title;
                title = null;
            }

            return Dialogs.open(null, {
                "title": title,
                "message": message,
                "dialog": "confirm"
            });
        },

        /**
         * Open an alert modal dialog
         *
         * @param {string} title
         * @param {string} message
         */
        alert: function(title, message) {
            return Dialogs.open(null, {
                "title": title,
                "message": message,
                "dialog": "alert"
            });
        },

        /**
         * File dialog
         *
         * @param {string} props base name
         */
        file: function(props) {
            var that = this;
            var d = Q.defer();

            var $f = $("input.file-dialog");
            if ($f.length > 0) $f.remove();

            $f = $("<input>", {
                "type": "file",
                "class": "file-dialog"
            });
            $f.appendTo($("body"));
            $f.hide();

            $f.prop(props || {});

            // Create file element for selection
            $f.one("change", function(e) {
                e.preventDefault();

                var _path = $f.val();

                if (_path) d.resolve(_path);
                else d.reject(new Error("No file selected"));

                $f.remove();
            });

            $f.trigger('click');

            return d.promise;
        },

        /**
         * Save as
         *
         * @param {string} base name
         */
        saveAs: function(path, basePath) {
            return Dialogs.file({
                nwsaveas: path,
                nwworkingdir: basePath
            });
        },

        /**
         * Open folder selection
         */
        folder: function() {
            return Dialogs.file({
                nwdirectory: true
            });
        },

        /**
         * Save as (folder)
         */
        saveFolder: function() {
            return Dialogs.file({
                nwdirectory: true
            })
            .then(function(_path) {
                return [_path, Q.nfcall(fs.readdir, _path)];
            })
            .spread(function(_path, files) {
                if (files.length > 0) {
                    return Dialogs.alert("Invalid folder", "Please select an empty folder.")
                    .then(Dialogs.saveFolder, Dialogs.saveFolder);
                }

                return _path;
            });
        },

        /**
         * Show an error message
         */
        error: function(err) {
            Dialogs.alert("Error:", err.message || err);
            console.error(err.stack || err.message || err);
            return Q.reject(err);
        },

        /**
         *  Show a dialog to edit some json
         */
        json: function(input, options) {
            options = _.defaults(options || {}, {
                title: "",
                defaultValue: "{}"
            })
            var content = options.defaultValue;

            var showDialog = function() {
                return Dialogs.fields(options.title, {
                    content: {
                        type: "textarea",
                        rows: 8
                    }
                }, {
                    content: content
                }, {keyboardEnter: false})
                .then(function(values) {
                    content = values.content;
                    return JSON.parse(content);
                })
                .fail(function(err) {
                    return Dialogs.confirm("Would you like to correct the error?", "The JSON is invalid: "+err.message)
                    .then(showDialog);
                });
            };

            return Q(input)
            .then(function(_content) {
                content = JSON.stringify(_content, null, 4);
            })
            .then(showDialog, showDialog);
        }
    };

    return Dialogs;
});