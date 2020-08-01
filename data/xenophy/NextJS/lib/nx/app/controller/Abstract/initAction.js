/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */

/*!
 * Next JS
 * Copyright (c)2011 Xenophy.CO.,LTD All rights Reserved.
 * http://www.xenophy.com
 */

// {{{ checkGlobalActionFile

var checkGlobalActionFile = function(file, fn) {

    NX.Path.exists(file, function(exists) {

        if(!exists) {
            fn();
        } else {
            fn({
                type: 'global',
                path: file
            });
        }

    });

};

// }}}
// {{{ checkExtentActionFile

var checkExtentActionFile = function(root, dirs, fn) {

    if(dirs.length > 0) {

        var dir = NX.Path.normalize(root + '/' + dirs.join('/') + '/');
        var file = dir + 'extent.action.js';

        NX.Path.exists(file, function(exists) {

            if(!exists) {
                dirs.pop();
                checkExtentActionFile(root, dirs, fn);
            } else {
                fn({
                    type: 'extent',
                    path: file
                });
            }

        });

    } else {
        fn();
    }

};

// }}}
// {{{ checkDefaultActionFile

var checkDefaultActionFile = function(file, fn) {

    NX.Path.exists(file, function(exists) {

        if(!exists) {
            fn();
        } else {
            fn({
                type: 'default',
                path: file
            });
        }

    });

};

// }}}
// {{{ NX.app.controller.Abstract.initAction

module.exports = function(req, res, next) {

    var me = this,
        paths = me.paths,
        root = paths.actions,
        urlpath = paths.urlpath,
        len,
        file,
        path,
        files = [];

    // {{{ 特殊ディレクトリはアクションを実行しない

    var face = '/(-_-)v/';

    if(req.url.substr(0, face.length) === face) {
        next();
        return;
    }

    // }}}
    // {{{ 実行登録されている拡張子以外は、アクションを実行しない

    var ext = NX.Path.extname(req.url);

    if(ext || ext === '') {

        if(ext === '') {
            ext = '.html';
        }

        ext = ext.substr(1);

        if(NX.Array.indexOf(res.actionAllowExt, ext) === -1) {
            next();
            return;
        }

    } else {

        next();
        return;
    }

    // }}}

    // アクションチェーン初期化
    me.actions = [];

    var expandActions = function(files, fn) {

        if(files.length === 0) {
            fn();
            return;
        }

        file = files.shift();

        var path = file.path;
        var type = file.type;
        var exit = function() {

            if(files.length > 0) {
                expandActions(files, fn);
            } else {
                fn();
            }

        };

        NX.Path.exists(path, function(exists) {

            if(!exists) {

                exit();

            } else {

                NX.Fs.stat(path, function(err, stat) {

                    if(err) {

                        exit();

                    } else {

                        // モジュールキャッシュクリア
                        NX.moduleCacheClear(path, stat.mtime);

                        var actionsrc;

                        try {

                            actionsrc = require(path);

                        } catch(e) {

                            // {{{ 500エラー

                            res.$errorCode = 500;
                            res.$errorDetails = {
                                msg: e.message,
                                stack: e.stack
                            };

                            // 次へ
                            next();

                            // }}}

                            return;

                        }

                        // 配列判定
                        if(NX.isArray(actionsrc)) {

                            actionsrc.forEach(function(src, i) {

                                var o = {
                                    name: me.action + i,
                                    type: type,
                                    $src: src,
                                    define: false,
                                    ready: false
                                };

                                me.actions.push(o);

                            });

                        } else {

                            var o = {
                                name: me.action,
                                type: type,
                                $src: actionsrc,
                                define: false,
                                ready: false
                            };

                            me.actions.push(o);

                        }

                        exit();

                    }

                });

            }

        });

    };

    var makeInstance = function(fn) {

        var doException = false;

        me.actions.forEach(function(o, i) {

            if(doException) {
                return;
            }

            var actionsrc = o.$src;

            if(NX.isString(actionsrc)) {

                try {

                    var p = NX.Loader.classNameToFilePathMap[actionsrc];

                    if(p) {

                        var stat = require('fs').statSync(p);

                        if(stat.mtime > NX.ClassManager.classesModified[actionsrc]) {

                            try {
                                eval("delete " + actionsrc + ";");
                                delete NX.Loader.classNameToFilePathMap[actionsrc];
                                delete NX.ClassManager.classesModified[actionsrc];
                                delete require.cache[p];
                                delete NX.ClassManager.classes[actionsrc];

                                require(p);
                            } catch(e) {}

                        }

                    }

                    actionsrc = NX.create(actionsrc);

                } catch(e) {

                    // {{{ 500エラー

                    res.$errorCode = 500;
                    res.$errorDetails = {
                        msg: e.message,
                        stack: e.stack
                    };

                    // 次へ
                    next();

                    // }}}

                    doException = true;

                    return;
                }

            }

            o.ready = false;

            // アクションインスタンス
            o.define = NX.create('NX.app.action.' + me.controllerType, actionsrc);

        });

        if(doException) {
            return;
        }

        // アクションチェーン生成
        var temp = [];

        me.actions.forEach(function(action, i) {
            if(action.define) {
                temp.push(action);
            }
        });

        me.actions = temp;

        var chain = [];

        me.actions.forEach(function(action, i) {

            var exec = action.define.$execute();
            exec.$actionName = action.name;

            chain.push(exec);
        });

        me.actionChain = chain;

        me.actions.forEach(function(o, i) {

            // アクション初期化
            o.define.init(paths, req, function() {
                o.ready = true;
                fn();
            });

        });

    };

    // グローバルアクションファイル確認
    checkGlobalActionFile(NX.Path.normalize(root + '/global.action.js'), function(ret) {

        if(ret) {
            files.push(ret);
        }

        var dirs = me.actionPath.split('/');

        checkExtentActionFile(root, dirs, function(ret) {

            if(ret) {
                files.push(ret);
            }

            checkDefaultActionFile(NX.Path.normalize(root + '/' + me.actionPath + '/' + me.action + '.js'), function(ret) {

                if(ret) {
                    files.push(ret);
                }

                expandActions(files, function() {

                    if(me.actions.length === 0) {

                        next();

                    } else {

                        makeInstance(function() {

                            var all = true;

                            me.actions.forEach(function(item, i) {
                                if(!item.ready) {
                                    all = false;
                                }
                            });

                            if(all) {
                                next();
                            }

                        });

                    }

                });

            });

        });

    });

};

// }}}

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
