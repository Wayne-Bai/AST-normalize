﻿var countdownTimer = function (endingTime) {
    "use strict";

    var endTime = new Date(
        endingTime.year,
        endingTime.month,
        endingTime.day,
        endingTime.hour,
        endingTime.minute,
        endingTime.second
    );

    var ts = countdown(null, endTime, countdown.HOURS | countdown.MINUTES | countdown.SECONDS);

    var hoursContainer = $('#hours-remaining');
    var minutesContainer = $('#minutes-remaining');
    var secondsContainer = $('#seconds-remaining');
    var countdownTimer = $('#countdown-timer');

    var start = function () {
        updateCountdown();

        var timerId = window.setInterval(function () {
            if (ts.hours === 0 && ts.minutes <= 4) {
                if (!countdownTimer.hasClass('countdown-warning')) {
                    countdownTimer.addClass('countdown-warning');
                }

                if (ts.start > ts.end) {
                    window.clearInterval(timerId);
                    // TODO: Handle contest over.
                }
            }

            updateCountdown();
            ts = countdown(null, endTime, countdown.HOURS | countdown.MINUTES | countdown.SECONDS);
        }, 1000);
    };

    function updateCountdown() {
        hoursContainer.text(ts.hours);
        minutesContainer.text(ts.minutes);
        secondsContainer.text(ts.seconds);
        countdownTimer.show();
    }

    return {
        start: start
    };
};

function Notifier() {
    function showMessage(data) {
        var container = $("div[id^='notify-container']").filter(':visible');

        var notification = $('<div/>', {
            text: data.message,
            "class": data.cssClass,
            style: "display: none"
        }).appendTo(container);

        notification.show({
            duration: 500
        });

        if (data.response) {
            var grid = $('#Submissions_' + data.response).getKendoGrid();
            if (grid) {
                grid.dataSource.read();
            }
        }

        setTimeout(function () {
            var dropdown = $("[id^=SubmissionsTabStrip-]").filter(':visible').find('input[id^="dropdown_"]').getKendoDropDownList();
            dropdown.close();
            notification.hide(500, function () {
                notification.remove();
            });
        }, 3500);
    }

    function notifySuccess(response) {
        var codeMirrorInstance = getCodeMirrorInstance();
        codeMirrorInstance.setValue("");

        showMessage({
            message: "Успешно изпратено!",
            response: response,
            cssClass: "alert alert-success"
        });
    }

    function notifyFailure(error) {
        showMessage({
            message: error.statusText,
            cssClass: "alert alert-danger"
        });
    }

    function notifyWarning(warning) {
        showMessage({
            message: warning.statusText,
            cssClass: "alert alert-warning"
        });
    }

    return {
        showMessage: showMessage,
        notifySuccess: notifySuccess,
        notifyFailure: notifyFailure,
        notifyWarning: notifyWarning
    };
}

//  update the code mirror textarea to display the submission content - not used
//  $("#SubmissionsTabStrip").on("click", ".view-source-button", function () {
//      var submissionId = $(this).data("submission-id");
//
//      $.get("/Contests/Compete/GetSubmissionContent/" + submissionId, function (response) {
//          var codeMirrorInstance = getCodeMirrorInstance();
//          codeMirrorInstance.setValue(response);
//      }).fail(function (err) {
//          notifyFailure(err);
//      });
//  });

function getCodeMirrorInstance() {
    var codeMirrorContainer = $(".CodeMirror:visible").siblings('textarea')[0];
    var codeMirrorInstance = $.data(codeMirrorContainer, 'CodeMirrorInstance');
    return codeMirrorInstance;
}

var displayMaximumValues = function(maxMemory, maxTime, memoryString, timeString) {
    var memoryInMb = (maxMemory / 1024 / 1024).toFixed(2);
    var maxTimeInSeconds = (maxTime / 1000).toFixed(3);
    var result = memoryString + ": " + memoryInMb + " MB <br />" + timeString + ": " + maxTimeInSeconds + " s";
    return result;
};

function validateSubmissionContent() {
    var codeMirrorInstance = getCodeMirrorInstance();
    var codeMirrorText = codeMirrorInstance.getValue();

    if (!codeMirrorText || codeMirrorText.length < 5) {
        messageNotifier.showMessage({
            message: "Решението трябва да съдържа поне 5 символа!",
            cssClass: "alert alert-warning"
        });

        return false;
    }

    return true;
}

function validateBinaryFileExists(fileInput) {
    if (!fileInput.files[0]) {
        messageNotifier.notifyWarning({
            statusText: 'Моля изберете файл, който да изпратите.'
        });
        return false;
    }

    return true;
}

function validateBinaryFileSize(fileInput, size) {
    if (!size) {
        return true;
    }

    var file = fileInput.files[0];
    if (file && file.size > size) {
        messageNotifier.notifyWarning({
            statusText: 'Избраният файл е твърде голям. Моля, изберете файл с по-малък размер.'
        });

        return false;
    }

    return true;
}

function validateBinaryFileAllowedExtensions(fileInput, extensions) {
    var fileName = fileInput.files[0].name;
    var fileExtension = fileName.split('.')[fileName.split('.').length - 1].toLowerCase();

    if (!extensions || extensions.length == 0) {
        return true;
    }

    if ($.inArray(fileExtension, extensions) < 0) {
        messageNotifier.notifyWarning({
            statusText: 'Избраният тип файл не е позволен. Разрешените формати са: ' + extensions.join(',') + '.'
        });

        return false;
    }

    return true;
}

var messageNotifier = new Notifier();

// validate the submission time
var submissionTimeValidator = function() {
    var lastSubmissionTime;
    var currentServerTime;

    function validate(lastSubmit, limitBetweenSubmissions, serverTime) {
        if (!lastSubmissionTime) {
            lastSubmissionTime = lastSubmit;
        }

        if (!currentServerTime) {
            currentServerTime = serverTime;
            setInterval(function() {
                currentServerTime = new Date(currentServerTime.getTime() + 1000);
            }, 1000);
        }

        var currentTime = currentServerTime;
        var secondsForLastSubmission = (currentTime - lastSubmissionTime) / 1000;

        if (!lastSubmissionTime) {
            lastSubmissionTime = currentServerTime;
            return true;
        }

        var differenceBetweenSubmissionAndLimit = parseInt(limitBetweenSubmissions - secondsForLastSubmission);

        if (differenceBetweenSubmissionAndLimit > 0) {
            messageNotifier.showMessage({
                message: "Моля изчакайте още " + differenceBetweenSubmissionAndLimit + " секунди преди да изпратите решение.",
                cssClass: "alert alert-warning"
            });

            return false;
        }

        lastSubmissionTime = currentServerTime;
        return true;
    }

    return {
        validate: validate
    };
};

var tabStripManager = new TabStripManager();

function TabStripManager() {
    var tabStrip;
    var index = 0;

    var self;

    function init(tabstrip) {
        self = this;
        tabStrip = tabstrip;

        tabStrip = $("#SubmissionsTabStrip").data("kendoTabStrip");
        if (tabstrip) {
            var hashIndex = getSelectedIndexFromHashtag();
            if (!hashIndex) {
                hashIndex = 0;
            }

            selectTabWithIndex(hashIndex);
        }
    }

    function selectTabWithIndex(ind) {
        tabStrip.select(ind);
        index = ind;
    }

    function tabSelected() {
        if (tabStrip) {
            var selectedIndex = tabStrip.select().index();
            window.location.hash = selectedIndex;
        }
    }

    function onContentLoad() {
        createCodeMirrorForTextBox();
        var hashTag = getSelectedIndexFromHashtag();
        selectTabWithIndex(hashTag);
    };

    function createCodeMirrorForTextBox() {
        var element = $('.code-for-problem:visible')[0];

        if (!$(element).data('CodeMirrorInstance')) {
            var editor = new CodeMirror.fromTextArea(element, {
                lineNumbers: true,
                matchBrackets: true,
                mode: "text/x-csharp",
                theme: "the-matrix",
                showCursorWhenSelecting: true,
                undoDepth: 100,
                lineWrapping: true,
            });

            $.data(element, 'CodeMirrorInstance', editor);
        }
    };

    function currentIndex() {
        return index;
    }

    return {
        selectTabWithIndex: selectTabWithIndex,
        tabSelected: tabSelected,
        onContentLoad: onContentLoad,
        currentIndex: currentIndex,
        init: init
    };
}

function getSelectedIndexFromHashtag() {
    return parseInt(window.location.hash.substr(1));
}

$(document).ready(function() {
    $(window).on("hashchange", function() {
        var hashIndex = getSelectedIndexFromHashtag();
        if (hashIndex !== tabStripManager.currentIndex()) {
            tabStripManager.selectTabWithIndex(hashIndex);
        }
    });

    var tabStrip = $("#SubmissionsTabStrip").data("kendoTabStrip");
    tabStripManager.init(tabStrip);
});
