    /* https://github.com/adobe/brackets/blob/master/src/language/JSUtils.js */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, CodeMirror */

/**
 * Set of utilities for simple parsing of JS text.
 */
define(function (require, exports, module) {
    "use strict";
    
    // Load brackets modules
    var Async                   = brackets.getModule("utils/Async"),
        DocumentManager         = brackets.getModule("document/DocumentManager"),
        FileUtils               = brackets.getModule("file/FileUtils"),
        _                       = brackets.getModule("thirdparty/lodash"),
        CodeMirror              = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror"),
        StringUtils             = brackets.getModule("utils/StringUtils");
    
    /**
     * Function matching regular expression. Recognizes the forms:
     * "function functionName()", "functionName = function()", and
     * "functionName: function()".
     *
     * Note: JavaScript identifier matching is not strictly to spec. This
     * RegExp matches any sequence of characters that is not whitespace.
     * @type {RegExp}
     */
    var _functionRegExp = /\.directive\(['"]([a-zA-Z-]+)['"]/g;
    
    /**
     * @private
     * Return an object mapping function name to offset info for all functions in the specified text.
     * Offset info is an array, since multiple functions of the same name can exist.
     * @param {!string} text Document text
     * @return {Object.<string, Array.<{offsetStart: number, offsetEnd: number}>}
     */
    function _findAllFunctionsInText(text) {
        var results = {},
            functionName,
            match;
        
        while ((match = _functionRegExp.exec(text)) !== null) {
            functionName = match[1].trim();
            
            if (!Array.isArray(results[functionName])) {
                results[functionName] = [];
            }
            
            results[functionName].push({offsetStart: match.index});
        }
        
        return results;
    }
    
    // Given the start offset of a function definition (before the opening brace), find
    // the end offset for the function (the closing "}"). Returns the position one past the
    // close brace. Properly ignores braces inside comments, strings, and regexp literals.
    function _getFunctionEndOffset(text, offsetStart) {
        var mode = CodeMirror.getMode({}, "javascript");
        var state = CodeMirror.startState(mode), stream, style, token;
        var curOffset = offsetStart, length = text.length, blockCount = 0, lineStart;
        var foundStartBrace = false;
        
        // Get a stream for the next line, and update curOffset and lineStart to point to the 
        // beginning of that next line. Returns false if we're at the end of the text.
        function nextLine() {
            if (stream) {
                curOffset++; // account for \n
                if (curOffset >= length) {
                    return false;
                }
            }
            lineStart = curOffset;
            var lineEnd = text.indexOf("\n", lineStart);
            if (lineEnd === -1) {
                lineEnd = length;
            }
            stream = new CodeMirror.StringStream(text.slice(curOffset, lineEnd));
            return true;
        }
        
        // Get the next token, updating the style and token to refer to the current
        // token, and updating the curOffset to point to the end of the token (relative
        // to the start of the original text).
        function nextToken() {
            if (curOffset >= length) {
                return false;
            }
            if (stream) {
                // Set the start of the next token to the current stream position.
                stream.start = stream.pos;
            }
            while (!stream || stream.eol()) {
                if (!nextLine()) {
                    return false;
                }
            }
            style = mode.token(stream, state);
            token = stream.current();
            curOffset = lineStart + stream.pos;
            return true;
        }

        while (nextToken()) {
            if (style !== "comment" && style !== "regexp" && style !== "string") {
                if (token === "{") {
                    foundStartBrace = true;
                    blockCount++;
                } else if (token === "}") {
                    blockCount--;
                }
            }

            // blockCount starts at 0, so we don't want to check if it hits 0
            // again until we've actually gone past the start of the function body.
            if (foundStartBrace && blockCount <= 0) {
                return curOffset;
            }
        }
        
        // Shouldn't get here, but if we do, return the end of the text as the offset.
        return length;
    }

    /**
     * @private
     * Computes function offsetEnd, lineStart and lineEnd. Appends a result record to rangeResults.
     * @param {!Document} doc
     * @param {!string} functionName
     * @param {!Array.<{offsetStart: number, offsetEnd: number}>} functions
     * @param {!Array.<{document: Document, name: string, lineStart: number, lineEnd: number}>} rangeResults
     */
    function _computeOffsets(doc, functionName, functions, rangeResults) {
        var text    = doc.getText(),
            lines   = StringUtils.getLines(text);
        
        functions.forEach(function (funcEntry) {
            if (!funcEntry.offsetEnd) {
                funcEntry.offsetEnd = _getFunctionEndOffset(text, funcEntry.offsetStart);
                funcEntry.lineStart = StringUtils.offsetToLineNum(lines, funcEntry.offsetStart);
                funcEntry.lineEnd   = StringUtils.offsetToLineNum(lines, funcEntry.offsetEnd);
            }
            
            rangeResults.push({
                document:   doc,
                name:       functionName,
                lineStart:  funcEntry.lineStart,
                lineEnd:    funcEntry.lineEnd
            });
        });
    }
    
    /**
     * @private
     * Read a file and build a function list. Result is cached in fileInfo.
     * @param {!FileInfo} fileInfo File to parse
     * @param {!$.Deferred} result Deferred to resolve with all functions found and the document
     */
    function _readFile(fileInfo) {
        return DocumentManager.getDocumentForPath(fileInfo.fullPath)
            .then(function (doc) {
                var allFunctions = _findAllFunctionsInText(doc.getText());
                return {doc: doc, functions: allFunctions};
            });
    }
    
    /**
     * @private
     * Compute lineStart and lineEnd for each matched function
     * @param {!Array.<{doc: Document, fileInfo: FileInfo, functions: Array.<offsetStart: number, offsetEnd: number>}>} docEntries
     * @param {!string} functionName
     * @param {!Array.<document: Document, name: string, lineStart: number, lineEnd: number>} rangeResults
     * @return {$.Promise} A promise resolved with an array of document ranges to populate a MultiRangeInlineEditor.
     */
    function _getOffsetsForFunction(docEntries, functionName) {
        // Filter for documents that contain the named function
        var result              = new $.Deferred(),
            matchedDocuments    = [],
            rangeResults        = [];
        
        docEntries.forEach(function (docEntry) {
            // Need to call CollectionUtils.hasProperty here since docEntry.functions could
            // have an entry for "hasOwnProperty", which results in an error if trying to
            // invoke docEntry.functions.hasOwnProperty().
            if (_.has(docEntry.functions, functionName)) {
                var functionsInDocument = docEntry.functions[functionName];
                matchedDocuments.push({doc: docEntry.doc, fileInfo: docEntry.fileInfo, functions: functionsInDocument});
            }
        });
        
        Async.doInParallel(matchedDocuments, function (docEntry) {
            var doc         = docEntry.doc,
                oneResult   = new $.Deferred();
            
            // doc will be undefined if we hit the cache
            if (!doc) {
                DocumentManager.getDocumentForPath(docEntry.fileInfo.fullPath)
                    .done(function (fetchedDoc) {
                        _computeOffsets(fetchedDoc, functionName, docEntry.functions, rangeResults);
                    })
                    .always(function () {
                        oneResult.resolve();
                    });
            } else {
                _computeOffsets(doc, functionName, docEntry.functions, rangeResults);
                oneResult.resolve();
            }
            
            return oneResult.promise();
        }).done(function () {
            result.resolve(rangeResults);
        });
        
        return result.promise();
    }
    
    /**
     * @private
     * Get all functions for each FileInfo.
     * @param {Array.<FileInfo>} fileInfos
     * @return {$.Promise} A promise resolved with an array of document info objects that each
     *   contain a map of all function names from the document and each function's start offset.
     */
    function _getFunctionsInFiles(fileInfos) {
        var docEntries      = [],
            result          = new $.Deferred();
        
        Async.doInParallel(fileInfos, function (fileInfo) {
            var oneResult = $.Deferred();
            
            _readFile(fileInfo)
                .then(function (docInfo) {
                    docEntries.push(docInfo);
                    oneResult.resolve();
                }, function (error) {
                    // If one file fails, continue to search
                    oneResult.resolve();
                });
            
            return oneResult.promise();
        }).done(function(){
            result.resolve(docEntries);
        });
        
        return result.promise();
    }
    
    /**
     * Return all functions that have the specified name, searching across all the given files.
     *
     * @param {!String} functionName The name to match.
     * @param {!Array.<FileIndexManager.FileInfo>} fileInfos The array of files to search.
     * @param {boolean=} keepAllFiles If true, don't ignore non-javascript files.
     * @return {$.Promise} that will be resolved with an Array of objects containing the
     *      source document, start line, and end line (0-based, inclusive range) for each matching function list.
     *      Does not addRef() the documents returned in the array.
     */
    function findMatches(pattern, functionName, fileInfos, keepAllFiles) {
        _functionRegExp = pattern;
        var jsFiles         = [],
            docEntries      = [];
        
        if (!keepAllFiles) {
            // Filter fileInfos for .js files
            jsFiles = fileInfos.filter(function (fileInfo) {
                return (/^\.(js|html?)/i).test(FileUtils.getFileExtension(fileInfo.fullPath));
            });
        } else {
            jsFiles = fileInfos;
        }
        
        // RegExp search for all functions in the project
        return _getFunctionsInFiles(jsFiles).then(function (docEntries) {
            // Compute offsets for all matched functions
            return _getOffsetsForFunction(docEntries, functionName);
        });
    }

    /**
     * Finds all instances of the specified searchName in "text".
     * Returns an Array of Objects with start and end properties.
     *
     * @param text {!String} JS text to search
     * @param searchName {!String} function name to search for
     * @return {Array.<{offset:number, functionName:string}>}
     *      Array of objects containing the start offset for each matched function name.
     */
    function findAllMatchingDirectivesInText(text, searchName) {
        var allFunctions = _findAllFunctionsInText(text);
        var result = [];
        var lines = text.split("\n");
        
        _.forEach(allFunctions, function (functions, functionName) {
            if (functionName === searchName || searchName === "*") {
                functions.forEach(function (funcEntry) {
                    var endOffset = _getFunctionEndOffset(text, funcEntry.offsetStart);
                    result.push({
                        name: functionName,
                        lineStart: StringUtils.offsetToLineNum(lines, funcEntry.offsetStart),
                        lineEnd: StringUtils.offsetToLineNum(lines, endOffset)
                    });
                });
            }
        });
         
        return result;
    }

    exports.findAllMatchingDirectivesInText = findAllMatchingDirectivesInText;
    exports.findMatches = findMatches;
});