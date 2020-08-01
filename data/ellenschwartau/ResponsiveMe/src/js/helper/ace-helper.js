define([
    'jquery'
],
/**
 * Hilfsskript zur Arbeit mit dem Code Editor ACE.
 * Hierüber können HTML-Elemente, identifieziert über ihre ID, als Code Editoren initialisiert und deren Inhalt gesetzt
 * werden.
 * Alle vorhandenen Editoren werden in diesem Modul zwischengespeichert, um später auf sie zugreifen zu können.
 * @exports aceHelper
 * @param {Object} $ - JQuery
 * @returns {{initCodeEditor: Function, getEditorValue: Function, getEditorData: Function, cleatEditorValue: Function, removeEditorFromList: Function, removeImpermanentEditorsFromList: Function, PERMANENT: boolean, IMPERMANENT: boolean}}
 */
function($){
    /**
     * Liste der vorhandenen Editoren.
     * @type {Array}
     */
    var editors = [];

    /**
     * Attribute zum Setzen der Permanenz-Eigenschaft.
     * @type {boolean}
     */
    var PERMANENT = true,
        IMPERMANENT = false;

    /**
     * Initialisiert einen Code Editor zur Anzeige und Bearbeitung von CSS-Angaben.
     * @param {string} id - CSS-ID des Editors
     * @param {{indexStyleSheet:int,indexRule:int,fullCss:string}} rule - Daten der Regel, die angezeigt werden soll
     * @param {boolean} permanent - Angabe, ob der Editor permanent gespeichert werden und demnach beim leeren der Liste nicht gelöscht werden soll
     * @param {string} [bindEvent] - optionaler Name des Events, das behandelt werden soll
     * @param {function} [onBlurCallback] - optionale Funktion zur Behandlung des Events
     * @returns {Object} - Editor
     */
    var initCodeEditor = function(id, rule, permanent, bindEvent, onBlurCallback) {
        // Editor erstellen und Modus sowie Theme setzen
        var editor = ace.edit(id),
            style = rule.fullCss,
            indexStyleSheet = rule.indexStyleSheet,
            indexRule = rule.indexRule;

        editor.session.setMode("ace/mode/css");
        editor.setTheme("ace/theme/dawn");

        // Umbrüche erzwingen
        //editor.session.setUseWrapMode(true);
        // Keine Warnmeldung wenn kein Cursor gesetzt wurde
        editor.$blockScrolling = Infinity;
        // Zeilenzahlen
        //editor.renderer.setShowGutter(false);
        // Wert des Editors initialisieren
        editor.session.setValue(style);
        // Auto-Vervollständigung
        enableAutocompletion(editor);

        // Editor und wichtige Daten zum späteren Zugriff zwischenspeichern
        saveEditorData(editor, id, indexStyleSheet, indexRule, permanent);
        // Callbacks initialisieren
        if(onBlurCallback != undefined && bindEvent != undefined) {
            bindEventCallback(editor, indexStyleSheet, indexRule, id, bindEvent, onBlurCallback);
        }

        return editor;
    };

    /**
     * Aktiviert die Autovervollständigung des Editors.
     * @param {Object} editor - Code Editor
     */
    var enableAutocompletion = function(editor){
        ace.require("ace/ext/language_tools");
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        });
    };

    /**
     * Bindet eine Callback-Funktion zur Behandlung des spezifizierten Events.
     * @param {Object} editor - Code-Editor
     * @param {int} indexStyleSheet - Index des Style Sheets, zu dem der Inhalt des Editors gehört
     * @param {int} indexRule - Index der Regel, zu der der Inhalt des Editors gehört
     * @param {string} id - CSS-ID des Editors
     * @param {string} bindEvent - Name des Events, das behandelt werden soll
     * @param {function} callback - Funktion, die aufgerufen werden soll
     */
    var bindEventCallback = function(editor, indexStyleSheet, indexRule, id, bindEvent, callback) {
        editor.on(bindEvent, function(){
            callback(editor.session.getValue(), indexStyleSheet, indexRule, id);
        });
    };

    /**
     * Speichert die Daten eines Editors zwischen.
     * @param {Object} editor - Code Editor
     * @param {string} id - CSS-ID des Editors
     * @param {int} indexStyleSheet - Index des Style Sheets, zu dem der Inhalt des Editors gehört
     * @param {int} indexRule - Index der Regel, zu der der Inhalt des Editors gehört
     * @param {boolean} permanent - Angabe, ob der Editor permanent gespeichert werden und demnach beim leeren der Liste nicht gelöscht werden soll
     */
    var saveEditorData = function(editor, id, indexStyleSheet, indexRule, permanent) {
        editors.push({
            editor: editor,
            id: id,
            indexStyleSheet: indexStyleSheet,
            indexRule: indexRule,
            savePermanent: permanent
        });
    };

    /**
     * Löscht alle Editoren aus der Liste, die nicht permanent gespeichert werden sollen.
     */
    var removeImpermanentEditorsFromList = function(){
        var clearedEditors = [];
        $.each(editors, function(i, editorData){
            if(editorData.savePermanent) {
                // Nur Editoren behalten, die explizit permanent gespeichert werden sollen
                clearedEditors.push(editorData);
            }
        });
        editors = clearedEditors;
    };

    /**
     * Löscht einen Editor aus der Liste der Editoren.
     * @param {string} id - CSS-ID des Editors
     */
    var removeEditorFromList = function(id) {
        var removeItem;
        $.each(editors, function(i, editorData){
            if(editorData.id === id) {
                // zwischenmerken, da beim durchlaufen nicht einfach aus dem Array gelöscht werden kann
                removeItem = i;
            }
        });
        if(removeItem != undefined){
            editors.splice(removeItem, 1);
        }
    };

    /**
     * Liefert den aktuellen Inhalt eines Editors, spezifiziert über dessen ID.
     * @param {string} id - CSS-ID des Editors
     * @returns {string} Inhalt des Editors
     */
    var getEditorValue = function(id) {
        var editorData = getEditorData(id);
        return editorData != undefined ? editorData.editor.session.getValue() : "";
    };

    /**
     * Leert den Inhalt eines über seine ID bestimmten Editors.
     * @param {string} id - CSS-ID des Editors
     */
    var clearEditorValue = function(id){
        var editorData = getEditorData(id);
        if(editorData != undefined) {
            editorData.session.setValue("");
        }
    };

    /**
     * Liefert die Daten eines Editors, der über seine ID spezifiziert wird.
     * @param {String} id - CSS-ID des Editors
     * @returns {undefined|{editor:Object,id:string,indexStyleSheets:int,indexRule:int}}
     */
    var getEditorData = function(id) {
        var data = undefined;
        $.each(editors, function(i, editorData){
            if(editorData.id === id) {
                data = editorData;
            }
        });
        return data;
    };

    return {
        initCodeEditor: initCodeEditor,
        getEditorValue: getEditorValue,
        getEditorData: getEditorData,
        cleatEditorValue: clearEditorValue,
        removeEditorFromList: removeEditorFromList,
        removeImpermanentEditorsFromList: removeImpermanentEditorsFromList,
        PERMANENT: PERMANENT,
        IMPERMANENT: IMPERMANENT
    };
});
