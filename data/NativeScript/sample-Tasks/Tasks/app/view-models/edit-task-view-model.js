var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var cameraModule = require("camera");
var localSettings = require("local-settings");
var imageSourceModule = require("image-source");
var observableModule = require("data/observable");

var everliveModule = require("../lib/everlive");

var taskViewModelBaseModule = require("./task-view-model-base");

var EditTaskViewModel = (function (_super) {
    __extends(EditTaskViewModel, _super);
    function EditTaskViewModel(task) {
        _super.call(this, task);

        this._everlive = new everliveModule({ apiKey: TELERIK_BAAS_KEY, token: localSettings.getString(TOKEN_DATA_KEY) });
    }
    Object.defineProperty(EditTaskViewModel.prototype, "picture", {
        get: function () {
            return this._picture;
        },
        set: function (value) {
            if (this._picture !== value) {
                this._picture = value;
                this.notify({ object: this, eventName: observableModule.knownEvents.propertyChange, propertyName: "picture", value: value });
            }
        },
        enumerable: true,
        configurable: true
    });


    EditTaskViewModel.prototype.save = function () {
        if (this.validate()) {
            if (this.picture) {
                var that = this;
                that.beginLoading();
                var file = {
                    "Filename": "NativeScriptIsAwesome.jpeg",
                    "ContentType": "image/jpeg",
                    "base64": that.picture.toBase64String(imageSourceModule.ImageFormat.JPEG, 100)
                };

                that._everlive.Files.create(file, function (data) {
                    that.task.Photo = data.result.Id;
                    that.saveTaskData();
                    that.endLoading();
                }, function (error) {
                    that.endLoading();
                    alert("Error uploading image[" + error.message + "]");
                });
            } else {
                this.saveTaskData();
            }
        }
    };

    EditTaskViewModel.prototype.cancel = function () {
        this.goBack();
    };

    EditTaskViewModel.prototype.takePicture = function () {
        var that = this;
        cameraModule.takePicture().then(function (result) {
            that.picture = result;
        });
    };

    EditTaskViewModel.prototype.saveTaskData = function () {
        if (this.task.Id) {
            this.updateTask();
        } else {
            this.createTask();
        }
    };

    EditTaskViewModel.prototype.createTask = function () {
        var that = this;
        that.beginLoading();
        that._everlive.data('Task').create(that.task, function (data) {
            that.endLoading();
            that.navigateTo("app/views/main");
        }, function (error) {
            that.endLoading();
            alert("Error creating task [" + error.message + "]");
        });
    };

    EditTaskViewModel.prototype.updateTask = function () {
        var that = this;
        that.beginLoading();
        that._everlive.data('Task').updateSingle(that.task, function (data) {
            that.endLoading();
            that.navigateTo("app/views/main");
        }, function (error) {
            that.endLoading();
            alert("Error updating task [" + error.message + "]");
        });
    };

    EditTaskViewModel.prototype.validate = function () {
        if (this.task.Name === "") {
            alert("Please enter task name.");
            return false;
        }

        return true;
    };
    return EditTaskViewModel;
})(taskViewModelBaseModule.TaskViewModelBase);
exports.EditTaskViewModel = EditTaskViewModel;
//# sourceMappingURL=edit-task-view-model.js.map
