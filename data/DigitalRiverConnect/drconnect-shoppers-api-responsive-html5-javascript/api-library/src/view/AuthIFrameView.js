define(['view/AuthViewUtil', 'Config'], function(Util, Config) {
    /**
     * IFrame auth view.
     * Opens an IFrame inside the specified DOM Element (using the parent size).
     * Visually, it looks like the login form is part of the application
     * 
     */
    var AuthIFrameView = function(uri, redirectUri, options) {
        this.uri = Util.buildUriFromOptions(uri, redirectUri, options);
        this.id = Config.config.AUTH_FRAME_ID;
        this.parentElementId = options.elementId;
    }
    
    /**
     * Opens the IFrame
     */
    AuthIFrameView.prototype.open = function(reqToken, onViewLoadedCallback) {
        var authFrame = document.getElementById(this.id);
        if(!authFrame) {
            authFrame = this.create();
        } 
        
        var finalUri = Util.getUriWithToken(this.uri, reqToken); 
        authFrame.onload = function() {
            if(this.src == finalUri) {
                if(onViewLoadedCallback) {
                    onViewLoadedCallback();
                }
            }
        }
        authFrame.src = finalUri;
    }
    
    /**
     * Removes the IFrame when finished
     */
    AuthIFrameView.prototype.close = function() {
        console.log("Closing Auth IFrame");
        var iframe = document.getElementById(this.id);
        
        if(iframe) {
            iframe.parentNode.removeChild(iframe);
        }
    }
    
    /**
     * Creates a new IFrame with the correct properties
     */
    AuthIFrameView.prototype.create = function() {
        var authFrame = document.createElement("iframe");
        authFrame.id = this.id;   
        authFrame.width = "100%";
        authFrame.height = "100%";
        authFrame.style.margin="auto";
        authFrame.style.border="none";
        authFrame.scrolling = "auto";
        
        var parent = (this.parentElementId != "")? document.getElementById(this.parentElementId) : document.body; 
        parent.appendChild(authFrame);
        
        return authFrame;
    }
    
    AuthIFrameView.prototype.AddOnLoadedHandler = function() {
        authFrame
    }
    
    return AuthIFrameView;
});