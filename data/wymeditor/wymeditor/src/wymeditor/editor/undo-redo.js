/* global
    rangy
*/
"use strict";

/*
 * Undo/Redo
 */

/**
    WYMeditor.UndoRedo
    ==================

    Constructs an undoRedo mechanism for a provided editor.

    Also sets keyboard shortcuts for undo and redo.

    @param wym An editor instance.
*/
WYMeditor.UndoRedo = function (wym) {
    var undoRedo = this;

    undoRedo.wym = wym;

    // https://github.com/mightyiam/object-history
    undoRedo.history = new WYMeditor.EXTERNAL_MODULES
        .ObjectHistory(wym.getCurrentState());

    wym.keyboard.combokeys.bind(
        "mod+z",
        function () {
            wym.undoRedo.undo();
            // Prevents native action. Caution: not covered by tests.
            return false;
        }
    );
    wym.keyboard.combokeys.bind(
        ["shift+meta+z", "mod+y"],
        function () {
            wym.undoRedo.redo();
            // Prevents native action. Caution: not covered by tests.
            return false;
        }
    );
};

/**
    WYMeditor.UndoRedo._onBodyFocus
    ===============================

    This method is called on focus of the document's body.

    If the last saved history point does not include a saved selection
    then the last saved history point is replaced with the current state,
    which does include a selection.

    When this method is called by the triggering of the focus event,
    the selection is not yet made.

    Hence the use of `setTimeout`--the function provided to `setTimeout`
    will always be called after the event's native action. By that time
    there should be a selection.
*/
WYMeditor.UndoRedo.prototype._onBodyFocus = function () {
    var undoRedo = this,
        wym = undoRedo.wym;

    if (undoRedo.history.last.savedSelection) {
        // last history point has selection
        return;
    }

    setTimeout(function () {
        // this will run after the native action of the triggering event.
        undoRedo.history.last = wym.getCurrentState();
    }, 0);
};

/**
    WYMeditor.UndoRedo._add
    =======================

    Adds a history point.
*/

WYMeditor.UndoRedo.prototype._add = function () {
    var undoRedo = this,
        wym = undoRedo.wym;

    undoRedo.history.add(wym.getCurrentState());
    undoRedo.hasUnregisteredModification = false;
};

/**
    WYMeditor.UndoRedo._do
    ======================

    Performs either undo or redo.

    @param what One of two possible constants:
        * `WYMeditor.UndoRedo.UN`
        * `WYMeditor.UndoRedo.RE`
*/
WYMeditor.UndoRedo.prototype._do = function (what) {
    var undoRedo = this,
        wym = undoRedo.wym,
        history = undoRedo.history,
        state,
        postEventName;

    if (what === WYMeditor.UndoRedo.UN) {
        if (history.changesetsBack.length === 0) {
            return;
        }
        if (undoRedo.hasUnregisteredModification) {
            // in order to be able to 'redo' to this yet unregistered state
            undoRedo._add();
        }
        history.backward();
        postEventName = 'postUndo';
    } else if (what === WYMeditor.UndoRedo.RE) {
        if (history.changesetsFore.length === 0) {
            return;
        }
        history.forward();
        postEventName = 'postRedo';
    } else {
        throw "Single parameter must be either `'un'` or `'re'` " +
            "(there are constants for those).";
    }

    state = history.get();
    wym.rawHtml(state.html);

    if (state.savedSelection) {
        // The `contentWindow` and `document` (`win` and `doc` properties) were
        // deleted before the state was saved. See `editor.getCurrentState`
        // code comments to understand why.
        //
        // Restore them now.
        state.savedSelection.win = wym._iframe.contentWindow;
        state.savedSelection.doc = wym._doc;
        rangy.restoreSelection(state.savedSelection);
    }

    jQuery(wym.element).trigger(WYMeditor.EVENTS[postEventName]);
};
WYMeditor.UndoRedo.UN = 'un';
WYMeditor.UndoRedo.RE = 're';

/**
    WYMeditor.UndoRedo.redo
    =======================
*/
WYMeditor.UndoRedo.prototype.redo = function () {
    var undoRedo = this;

    undoRedo._do(WYMeditor.UndoRedo.RE);
};

/**
    WYMeditor.UndoRedo.undo
    =======================
*/
WYMeditor.UndoRedo.prototype.undo = function () {
    var undoRedo = this;

    undoRedo._do(WYMeditor.UndoRedo.UN);
};

/**
    WYMeditor.UndoRedo.reset
    ========================

    Forgets all changes.
*/
WYMeditor.UndoRedo.prototype.reset = function () {
    var undoRedo = this,
        wym = undoRedo.wym;

    wym.undoRedo = new WYMeditor.UndoRedo(wym);
};
