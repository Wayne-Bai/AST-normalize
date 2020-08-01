( function(exports) {
    
    var script = undefined;
    
    function eval(code) {
        // make a new iframe every time evaluate
        // Sandbox is not READY
        if (script !== undefined) {
            var iframe = document.createElement("iframe");
            iframe.style.width ="0px";
            iframe.style.height = "0px";
            iframe.style.visibility = "hidden";        
            document.body.appendChild(iframe);
            
            // Cross-platform: http://xkr.us/articles/dom/iframe-document/
            var iframeWindow = iframe.contentWindow;
            var iframeDocument = iframe.contentWindow || iframe.contentDocument;
            if (iframeDocument.document) {
                iframeDocument = iframeDocument.document;
            }                    
                            
            // getting result
            var result;
            iframeDocument.open();
            try {        
                if(iframeWindow.eval) {
                    iframeWindow.eval(script);
                    iframeWindow.eval(code);
                    result = iframeWindow.eval("System.getStream();");
                }
                else if(!iframeWindow.eval && iframeWindow.execScript) {
                    iframeWindow.execScript(script);
                    iframeWindow.execScript(code);
                    result = iframeWindow.execScript("System.getStream();");
                }            
                else
                    result = "Sandbox: Unsupport browser";
            } catch (ex) {
                result = ex.message;
            }
            
            iframeDocument.close();
                    
            // remove iframe from body
            document.body.removeChild(iframe);
            
            return result;
        }
        else {
            console.log("System script is not loaded.");
            return undefined;
        }
    }
        
    function setScript(text) {
        script = text;
    }
    
    // Hard-code the URL
    Ajax.load("lib/ieditor/system.js", setScript);
    exports.eval = eval;
    
} (typeof exports === "undefined"? (Sandbox = {}) : exports));






