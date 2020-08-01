/*
** Ext.ux.upload.Html5Connector.js for Ext.ux.upload.Html5Connector
**
** Made by Gary van Woerkens
** Contact <gary@chewam.com>
**
** Started on  Fri Jun  4 19:02:46 2010 Gary van Woerkens
** Last update Fri Jul  2 15:30:52 2010 Gary van Woerkens
*/

// Ext.ns('Ext.ux.upload');

/**
 * @class Ext.ux.upload.Html5Connector
 * @extends Ext.util.Observable
 * A simple class which handles native browser drag and grop events and upload files
 * with help of {@link Ext.Ajax#request Ajax request}.
 * @author Gary van Woerkens
 * @version 1.0
 */
Ext.define('Ext.ux.upload.Html5Connector', {

    extend: 'Ext.util.Observable',

    /**
    * @cfg String url
    * The URL where files will be uploaded.
    */
    url:"",
    /*
    * @cfg path
    */
    path:"",
    /**
    * @cfg Number maxFiles
    * Maximum number of files to upload in a row.
    */
    maxFiles:5,
    /**
    * @cfg Number maxFileSize
    * Maximum size of a file to upload.
    */
    maxFileSize:1024, // KB
    /**
    * @cfg String allowedFileTypes
    * all types of file that can be uploaded
    * (e.g., "*.png;*.jpg;*.gif").<br/>
    * To allow all types of file to be uploaded use "*.*".
    */
    allowedFileTypes:"*.*",
    /**
    * @cfg Boolean enableHighlight
    * True to enable highlight of drop zone on Component over.
    */
    enableHighlight:true,
    /**
    * @cfg Boolean enableGlobalHighlight
    * True to enable highlight drop zone on window over.
    */
    loaded:true,
    /**
    * @cfg Boolean loaded
    * is generally immediately loaded
    */
    enableGlobalHighlight:true,
    /**
    * @cfg {String} lang
    * The language to display log panel messages (default to "en").
    */
    lang:"en",
    /**
    * @cfg {Object} langs
    * Available languages to load on init with {@link Ext.ux.upload.LogPanel#lang lang}.
    */
    langs:{
        en:{
            maxFilesError:"Max number of files reached (max:{maxFiles})",
            maxFileSizeError:"Max file size reached (max:{maxFileSize} KB)",
            allowedFileTypeError:"File type not allowed",
            serverError:"Cannot reach server"
        },
        fr: {
            maxFilesError:"Trop de fichiers envoyés simultanément (max:{maxFiles})",
            maxFileSizeError:"Taille limite atteinte (max:{maxFileSize} KB)",
            allowedFileTypeError:"Type de fichier incorrect",
            serverError:"Serveur injoignable"
        }
    },

    /**
    * The {@link Ext.Element} which handles drag and drop events.
    * @type {Ext.Element}
    * @property el
    */

    constructor: function(config) {
        Ext.apply(this, config);

        this.lang = this.langs[this.lang] || this.langs["en"];
        this.lang.maxFilesError = new Ext.Template(this.lang.maxFilesError);
        this.lang.maxFileSizeError = new Ext.Template(this.lang.maxFileSizeError);

        this.addEvents(
            /**
            * @event dragstart Fires when a file is draged over the component's body.
            * @param {Ext.ux.upload.Html5Connector} this
            */
            "dragstart",
            /**
            * @event drastop Fires when a file is draged out the component's body.
            * @param {Ext.ux.upload.Html5Connector} this
            */
            "dragstop",
            /**
            * @event dragstart Fires when a file is draged over the window's body.
            * @param {Ext.ux.upload.Html5Connector} this
            */
            "windragstart",
            /**
            * @event drastop Fires when a file is draged out the window's body.
            * @param {Ext.ux.upload.Html5Connector} this
            */
            "windragstop",
            /**
            * @event beforeupload Fires on files drop,
            * after check of {Ext.ux.upload.Html5Connector#maxFiles maxFiles}.
            * @param {Ext.ux.upload.Html5Connector} this
            * @param {Number} selectedFilesCount
            */
            "beforeupload",
            /**
            * @event start Fires on files drop.
            * @param {Ext.ux.upload.Html5Connector} this
            */
            "start",
            /**
            * @event progress Fires when file upload progress
            * @param {Ext.ux.upload.Html5Connector} this
            * @param {Object} file
            * @param {Number} loaded The file loading percentage<br/>
            * It must a decimal value greater than 0 and less than 1
            */
            "progress",
            /**
            * @event error Fires on upload error.
            * @param {Ext.ux.upload.Html5Connector} this
            * @param {Object} file
            * @param {String} msg The error message
            */
            "error",
            /**
            * @event complete Fires when file upload is over
            * @param {Ext.ux.upload.Html5Connector} this
            * @param {Object} file
            */
            "complete",
            /**
            * @event medialinkdrop Fires on media link drop.
            * @param {Ext.ux.upload.Html5Connector} this
            * @param {String} mediaLink
            */
            "medialinkdrop"
        );
        this.callParent();
        this.init();

    },

    // private
    init:function() {
        this.setWindowEvents();

        this.el.on({
            scope:this,

            dragover:function(e) {
                e.stopPropagation();
                e.preventDefault();
                if (!Ext.isGecko) { // prevents drop in FF ;-(
                    e.browserEvent.dataTransfer.dropEffect = 'copy';
                }
                if (this.enableHighlight)
                this.el.addCls("x-uploader-dragover");
                this.fireEvent("dragstart", this);
                return;
            },

            dragleave:function(e) {
                e.stopPropagation();
                e.preventDefault();
                if (this.enableHighlight)
                    this.el.removeCls("x-uploader-dragover");
                this.fireEvent("dragstop", this);
                return;
            },

            drop:this.onFilesDrop

        });
    },

    // private
    setWindowEvents:function() {

        Ext.getBody().on({
            scope:this,

            dragover:function(e) {
                e.stopPropagation();
                e.preventDefault();
                if (!Ext.isGecko) { // prevents drop in FF ;-(
                    e.browserEvent.dataTransfer.dropEffect = 'copy';
                }
                if (this.enableGlobalHighlight)
                this.el.addCls("x-uploader-dragover");
                this.fireEvent("windragstart", this);
                return;
            },

            dragleave:function(e) {
                e.stopPropagation();
                e.preventDefault();
                if (this.enableGlobalHighlight)
                this.el.removeCls("x-uploader-dragover");
                this.fireEvent("windragstop", this);
                return;
            }
        });
    },

    // private
    onFilesDrop:function(e) {
        e.stopPropagation();
        e.preventDefault();
        var mediaLink = e.browserEvent.dataTransfer.getData('Text');
        var files = e.browserEvent.dataTransfer.files;
        if (!Ext.isEmpty(mediaLink)) {
            this.uploadMediaLink(mediaLink);
        } else if (
            files && files.length &&
            this.fireEvent("beforeupload", this, files.length) !== false
        ) {
            this.uploadFiles(files, e.target);
        }
    },

    uploadMediaLink: function (mediaLink) {
        this.fireEvent('medialinkdrop', this, mediaLink);
    },

    /**
    * Checks number of files to upload ({@link Ext.ux.upload.Html5Connector#maxFiles maxFiles})
    * and loop on each file to upload.
    * @param {Array} files Array of file objects.
    */
    uploadFiles:function(files, targetElement) {
        this.targetElement = targetElement;
        var tooManyFiles = files.length > this.maxFiles;
        if (tooManyFiles && this.maxFiles) {
            var msg = this.lang.maxFileSizeError.apply({maxFiles:this.maxFiles});
            this.onUploadError(null, msg);
        } else Ext.each(files, this.uploadFile, this);
    },

    /**
    * Checks allowed file types and file size before upload it whit help
    * of {@link Ext.Ajax#request Ajax request}.
    * @param {Object} file The file to upload.
    */
    uploadFile:function(file) {
        file.id = Ext.id();
        this.fireEvent("start", this, file);
        if (!this.isAllowedFileType(file.name)) {
            this.onUploadError(file, this.lang.allowedFileTypeError);
        } else if (!this.isAllowedFileSize(file.size)) {
            var msg = this.lang.maxFilesError.apply({maxFileSize:this.maxFileSize});
            this.onUploadError(file, msg);
        } else {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = Ext.bind(this.onUploadLoad, this, [file, xhr], 0);
            xhr.upload.addEventListener("error", Ext.bind(this.onUploadError, this, [file], 0), false);
            xhr.upload.addEventListener("progress", Ext.bind(this.onUploadProgress, this, [file], 0), false);
            xhr.open("POST", this.url , true);
            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            xhr.setRequestHeader('X-File-Name', this.path+'/'+file.name);
            xhr.setRequestHeader('X-File-Size', file.size);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.send(file);
        }
    },

    /**
    * Returns true if file size is smaller than {@link Ext.ux.upload.Html5Connector#maxFiles maxFiles}.
    * @param {Number} size The file size.
    * @return {Boolean}
    */
    isAllowedFileSize:function(size) {
        return !this.maxFileSize || ((size / 1000) / this.maxFileSize) <= 1;
    },

    /**
    * Returns true if file type is allowed as
    * specified in {@link Ext.ux.upload.Html5Connector#allowedFileTypes allowedFileTypes}.
    * @param {String} name The file name.
    * @return {Boolean}
    */
    isAllowedFileType:function(name) {
        var allowedTypes = this.getAllowedTypesReg(this.allowedFileTypes);
        return allowedTypes ? allowedTypes.test(name) : true;
    },

    /**
    * Returns the RegExp based on {@link Ext.ux.upload.Html5Connector#allowedFileTypes allowedFileTypes}
    * to test the file extension.
    * @param {String} types The allowed file types definition.
    * @return {Object} RegExp
    */
    getAllowedTypesReg:function(types) {
        var t = [];
        if (types === "*.*") return false;
        types = types.split(";");
        Ext.each(types, function(type) {
            t.push(type.split(".")[1]);
        });
        var reg = "^.*\.("+t.join("|")+")$";
        return new RegExp(reg, "gi");
    },

    // HANDLERS

    onUploadProgress:function(file, e) {
        this.fireEvent("progress", this, file, e.loaded/e.total);
    },

    onUploadLoad:function(file, request, e) {
        if (request.readyState === 4) {
            if (request.status === 500)
                this.fireEvent("error", this, file, this.lang.serverError);
            else if (request.status === 404)
                this.fireEvent("error", this, file, this.lang.serverError);
            else if (request.status === 200) {
                this.fireEvent("complete", this, file, e.loaded/e.total);
            }
        }
    },

    onUploadError:function(file, msg) {
        this.fireEvent("error", this, file, msg);
    }

});
