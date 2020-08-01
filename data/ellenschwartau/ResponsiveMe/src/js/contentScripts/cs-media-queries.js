require([
    'jquery', 'matchMedia', 'stylesheetParser', 'extension'
],
/**
 * Content Script zur Verarbeitung der aktuellen Media Angaben.
 * @exports csMediaQueries
 * @param {Object} $ - JQuery
 * @param {module} matchMedia - matchMedia-Modul
 * @see module:matchMedia
 * @param {module} styleSheetParser - stylesheetParser-Modul
 * @see module:stylesheetParser
 * @param {module} extension - extension-Modul
 * @see module:extension
 */
function($, matchMedia, styleSheetParser, extension){
    /**
     * Berechnet die aktuell greifenden Media Queries und stößt die Aktualisierung in Background Page und Popup an.
     */
    var updateMediaList = function() {
        extension.sendMessage({
            type: extension.messageTypes.displayCurrentMediaList,
            data: {
                mediaList: matchMedia.getMatchedMediaQueries()
            }
        });
    };

    /**
     * Berechnet bei Skalierung des Browsers die aktuell greifenden Media Queries.
     */
    var updateMatchedMediaOnResize = function(){
        $(window).resize(function(){
            updateMediaList();
        });
    };

    /**
     * Liest die Media Queries aus den Style Sheets aus.
     * @param {{type:string, data:json}} request - Daten und Typ der Anfrage
     * @param {string} request.type - Typ der Nachricht, zur Angabe, welche Aktion folgen soll
     * @param {json} request.data - zusätzliche Daten der Nachricht
     * @param {MessageSender} sender - Enthält Informationen über den Absender
     * @param {function} sendResponse - Funktion zum Absenden einer Antwort
     */
    var handleShowMediaQueries = function(request, sender, sendResponse) {
        sendResponse({
            data: styleSheetParser.getMediaQueries()
        });
    };

    /**
     * Behandelt die Nachrichten, die an das Content Script gesendet werden.
     */
    var handleMessages = function() {
        extension.handleMessage(extension.messageTypes.showMediaQueries, handleShowMediaQueries);
        extension.handleMessage(extension.messageTypes.updateBackgroundPage, updateMediaList);
        extension.handleMessage(extension.messageTypes.updateActiveMediaQueries, updateMediaList);
    };

    /**
     * Initialisiert die Ermittlung der aktuell greifenden Media-Angaben.
     */
    var init = function(){
        updateMediaList();
        updateMatchedMediaOnResize();
        handleMessages();
    }();
});
