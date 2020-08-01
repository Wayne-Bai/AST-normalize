const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const tty = require('tty');
const util = require('./util');
const errors = require('./errors');
const Account = require('./account');
const Adapter = require('./adapter');
const TemplateManager = require('./template');

module.exports = (function(){
    function cls()
    {
        /** Current account object */
        var curAcct = null;
        
        /** Current adapter object */
        var curAdap = null;
        
        /** Adapter specific data.
         *  E.g., adapData['uva'] is the UVA adapter specific data.
         */
        var adapData = {};

        /** All accounts. */
        var accts = []; 

        var tpls = {};
        var tplMgr = new TemplateManager(this, tpls);

        var editor;
        var browserOpts = {};
        var editorOpts = {};
        
        function findAcct(type, user)
        {
            for (var i=0; i < accts.length; i++)
            {
                if (accts[i].match(type, user))
                    return i;
            }

            return -1;
        }

        this.load = function(filePath){
            var settings = JSON.parse(fs.readFileSync(filePath, {encoding: 'utf8'}));
            adapData = settings.adapData;
            accts = settings.accts;
            browserOpts = settings.browserOpts || {};
            settings.browserOpts = browserOpts;

            for (var i=0; i < accts.length; i++)
            {
                accts[i] = new Account(accts[i]);
            }

            this.setEditor(settings.editor);
            this.setBrowser(browserOpts.path, browserOpts.args);
            tplMgr = new TemplateManager(this, tpls = settings.tpls || {});

            curAcct = null;
            curAdap = null;
            if (settings.curAcct && settings.curAcct.length === 2)
            {
                try
                {
                    this.use(settings.curAcct[0], settings.curAcct[1]);
                }
                catch (e){/*ignore*/}
            }
        };

        this.save = function(filePath){
            var settings = {
                curAcct: curAcct ? [curAcct.type(), curAcct.user()] : null,
                adapData : adapData,
                accts: accts,
                tpls: tpls,
                editor: editor,
                browserOpts: browserOpts
            };

            var opts = {encoding: 'utf8', mode: 0600};
            fs.writeFileSync(filePath, JSON.stringify(settings), opts);
        };

        this.setEditor = function(editorPath){
            editor = editorPath || '';
            var editorBaseName = path.basename(editor);
            editorOpts = {
                isVim   : /^(vi|vim)(\.exe)?$/i.test(editorBaseName),
                isEmacs : /^emacs/i.test(editorBaseName)  
            };
        };

        this.getTemplateManager = function(){
            return tplMgr;
        };

        this.edit = function(filePath, callback){
            if (!editor)
            {
                return callback(new errors.NoEditor());
            }
            
            function setRaw (mode) {
                var isRaw = process.stdin.isRaw; 
                process.stdin.setRawMode(mode);
                return isRaw;
            }

            try{
                var args  = [filePath];
                var fileExt = util.getFileExt(filePath).toLowerCase();
                var lang = util.getLang(fileExt);
                var fileExists = fs.existsSync(filePath);

                if (!fileExists)
                {
                    if (lang >= 0)
                    {
                        var r = tplMgr.spawn(lang, filePath);
                        if (r.lineNum > 0)
                            if (editorOpts.isVim)
                                args.unshift('+call cursor('+r.lineNum+','+r.colNum+')');
                            else if (editorOpts.isEmacs)
                                args.unshift('+'+r.lineNum+':'+r.colNum);
                    }
                    else
                    {
                        // create a blank file
                        fs.writeFileSync(filePath, '', {encoding:'ascii'});
                    }
                }

                // start vim in insert mode only after we set the cursor
                // otherwise the cursor will be 1 column before the desired position
                if (editorOpts.isVim)
                    args.unshift('-c','startinsert');
                
                process.stdin.pause();

                // important! must preserve rawMode
                var oldMode = setRaw(true);
                var ps = spawn(editor, args, {customFds:[0,1,2]});
                ps.on('exit', function(code,sig){
                    setRaw(oldMode);
                    process.stdin.resume();
                    callback();
                }).on('error', function(e){
                    setRaw(oldMode);
                    process.stdin.resume();
                    callback(e);
                });
            }
            catch(e){
                callback(e);
            }
        };

        this.getAdapterData = function(type){
            type = type.toLowerCase();
            return adapData[type] || (adapData[type] = {});
        };

        /**
         * Adds a new account, or replaces an existing one.
         * Replacing the current account is not an error.
         * @return boolean true if account was replaced; false if added
         */
        this.add = function(acct){
            var idx = findAcct(acct.type(), acct.user());
            if (idx >= 0)
            {
                accts[idx] = acct;
                if (curAcct && curAcct.match(acct.type(), acct.user()))
                {
                    curAcct = acct;
                    curAdap = Adapter.create(this, acct);
                }
                return true;
            }

            accts.push(acct);
            return false;
        };

        /**
         * Removes an existing account which must not be the current account.
         * @exception IsCurrent trying to remove a current account.
         * @exception NotExist
         * @return void
         */
        this.remove = function(type, user){
            if (curAcct && curAcct.match(type, user))
                throw new errors.IsCurrent();

            var idx = findAcct(type, user);
            if (idx < 0) throw new errors.NotExist();

            accts.splice(idx, 1);
        };

        this.getCurrent = function(){
            return curAcct;
        };

        this.getCurrentAdapter = function(){
            return curAdap;
        };

        this.useNone = function(){
            curAdap = curAcct = null;
        };

        /**
         * Sets an account as current.
         * @exception NotExist
         * @return void
         */
        this.use = function(type, user){
            var idx = findAcct(type, user);
            if (idx < 0) throw new errors.NotExist();
            
            var a = Adapter.create(this, accts[idx]);
            if (!a) throw new errors.NotExist();

            curAcct = accts[idx];
            curAdap = a;
        };

        this.get = function(idx){
            return accts[idx];
        };

        this.size = function(){
            return accts.length;
        };

        this.setBrowser = function(path, args){
            browserOpts.path = path || '';
            browserOpts.args = args || [];
        };

        this.getBrowser = function(){
            return browserOpts;
        };

        this.openBrowser = function(url){
            if (!browserOpts.path)
            {
                throw new errors.NoBrowser();
            }
            
            // shortcut to quickly clone args
            var newArgs = JSON.parse(JSON.stringify(browserOpts.args));
            newArgs.unshift(url);

            var ps = spawn(browserOpts.path, newArgs, {customFds:[0,1,2]});
        };
    }

    return cls;
})();
