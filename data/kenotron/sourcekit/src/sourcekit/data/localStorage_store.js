define("sourcekit/data/localStorage_store", ['sourcekit/fileutil'], function(FileUtil) {

var kStoragePrefix = '__file_data_';

function LocalStorageStore() {
    function _GetStorageName(name) {
        return kStoragePrefix + name;
    }
    function _GetFileList() {
        var files = localStorage.getItem(_GetStorageName('/'));
        if (!files) {
            return [];
        }
        return files.split(',');
    }
    function _SetFileList(list) {
        localStorage.setItem(_GetStorageName('/'), list);
    }
    function _GetFile(name) {
        var content = localStorage.getItem(_GetStorageName(name));
        if (content) {
            return content;
        }
        return "";
    }
    function _SetFile(name, value) {
        return localStorage.setItem(_GetStorageName(name), value);
    }
    function _CreateItem(path) {
        return {
            path: path,
            is_dir: false,
            loaded: true,
            content: _GetFile(path)
        };
    }

    return {
        getName: function() { return 'LocalStorage'; },
        getValue: function(item, attribute, defaultValue) {
            if (item[attribute]) {
                // 'content' is already in 'item' field, so we don't
                // need to treat it here especially.
                return item[attribute];
            }
          if (attribute == 'content') {
            return '';
          }
            return defaultValue;
        },
        getContent: function(item, callback) {
          var content = this.getValue(item, 'content');
          callback(content);
        },
        getValues: function(item, attribute) {
            return (item[attribute] || []).slice(0);
        },
        getAttributes: function(item) { console.log('Not Implemented Yet'); },
        hasAttribute: function(item, attribute) {
            return item[attribute] != null;
        },
        containsValue: function(item, attribute, value) { console.log('Not Implemented Yet'); },
        isItem: function(something) { console.log('Not Implemented Yet'); },
        isItemLoaded: function(something) {
            var result = false;

            if (something && something.loaded) {
                result = something.loaded;
            }

            return result;
        },
        loadItem: function(keywordArgs) {
            var scope = keywordArgs.scope || dojo.global;

            if (keywordArgs.item) {
                var item = keywordArgs.item;

                if ((item.is_dir || item.root != null) &&
                    item.children.length == 0) {
                    var fileList = _GetFileList('/');
                    for (var i = 0; i < fileList.length; ++i) {
                        var fileName = fileList[i];
                        item.children.push(_CreateItem(fileName));
                    }
                }
              item.loaded = true;
                keywordArgs['onItem'].call(scope, item);
            }

            return true;
        },

        // Initial Fetch
        fetch: function(keywordArgs) {
            var path = keywordArgs.query.path;
            var scope = keywordArgs.scope || dojo.global;

            console.log(keywordArgs);
          if (path == '/') {
              // root
              var fileList = _GetFileList('/');
              if (keywordArgs.onBegin) {
                  keywordArgs['onBegin'].call(
                      scope, fileList.length, keywordArgs);
              }
            if (keywordArgs.onItem) {
                for (var i = 0; i < fileList.length; ++i) {
                    keywordArgs['onItem'].call(
                        scope, _CreateItem(fileList[i]), keywordArgs);
                }
            }
            if (keywordArgs.onComplete) {
                keywordArgs['onComplete'].call(scope, keywordArgs);
            }
          }
        },
        getFeatures: function() {
            return {
                'dojo.data.api.Read':true,
                'dojo.data.api.Identity':true,
                'dojo.data.api.Write':true,
                'dojo.data.api.Notification':true
            };
        },
        close: function(request) { console.log('Not Implemented Yet'); },
        getLabel: function(item) {
            if (item.label) {
                return item.label;
            }

            return FileUtil.basename(item.path);
        },
        getLabelAttributes: function(item) { console.log('Not Implemented Yet'); },

        /* Identity API */
        getIdentity: function(item) {
            return item.path;
        },
        getIdentityAttributes: function(/* item */ item) { console.log('Not Implemented Yet'); },
        fetchItemByIdentity: function(keywordArgs) { console.log('Not Implemented Yet'); },

        /* Write API */
        newItem: function(keywordArgs, parentInfo) {
            var item = keywordArgs;
            if (item.is_dir) {
                console.log('Not Implemented Yet');
                return false;
            }

            // Checking for dups
            var children = parentInfo.parent[parentInfo.attribute];
            for (key in children) {
                if (children[key].path == item.path) {
                    console.log('filename duplication');
                    return false;
                }
            }
            children.push(item);
            children.sort(function(a, b) { return a.path.toLowerCase() > b.path.toLowerCase() ? 1 : -1 });

            var fileList = _GetFileList('/');

            item.loaded = true;
            _SetFile(item.path, '');
            var file_list = _GetFileList('/');
            file_list.push(item.path);
            file_list.sort();
            _SetFileList(file_list);
            this.onNew(item, {
                item: parentInfo.parent,
                attrivute: parentInfo.attribute,
                oldValue: null,
                newValue: item
            });

            return item;
        },

        deleteItem: function(item) {
            var file_list = _GetFileList('/');
            var new_file_list = [];
            var found = false;
            for (var i = 0; i < file_list.length; ++i) {
                if (file_list[i] != item.path) {
                    new_file_list.push(file_list[i]);
                } else {
                    found = true;
                }
            }
            if (!found) {
                console.log('file not found');
                return false;
            }
            _SetFileList(new_file_list);
            _SetFile(item.path, null);
            this.onDelete(item);

            return item;
        },

        setValue: function(item, attribute, value) {
          console.log(item);
          console.log(attribute);
          console.log(value);
            var oldValue = null;
            if (item[attribute]) {
                oldValue = item[attribute];
            }

            item[attribute] = value;

            if (attribute == "content") {
                _SetFile(item.path, value);
                this.onSet(item, attribute, oldValue, value);
            }
        },

        setValues: function(item, attribute, values) {
            item[attribute] = values;
        },

        unsetAttribute: function(/* item */ item, /* string */ attribute) {
            console.log('Not implemented yet');
        },

        save: function(keywordArgs) {
            console.log('Not implemented yet');
        },

        revert: function() {
            console.log('Not implemented yet');
        },

        isDirty: function(/* item? */ item) {
            console.log('Not implemented yet');
        },

        /* Notification API */
        onSet: function(item, attribute, oldValue, newValue) { },

        onNew: function(newItem, parentInfo) { },

        onDelete: function(deletedItem) { }
    };
};

return LocalStorageStore;

});
