define(["matisse", "matisse.util"], function (matisse, util) {
    "use strict";
    var actionBar = {
        initialize: function () {
            var selfObj = this;

            //Attach events for the Actions         
            var bottomEle = $(".bottom");
            bottomEle.click(function (e) {
                selfObj.handleAction.call(selfObj, e);
            });

            $(this.popoverElements).popover({
                "placement": "left"
            });
            $(".user-image").popover({
                "placement": "bottom",
                content: function () {
                    return "<h1> Hello User, User Data is comming soon! </h1>";
                },
                "trigger": "manual"
            });

            //Attaching the Events for small user pic
            $("#userProfilePic").click(function (e) {
                selfObj.showUserInfoSection();
                return false;
            });
        },
        handleAction: function (e) {
            var ele = $(e.target).closest(".menu-holder");
            if (ele) {
                switch (ele.data().action) {
                case "save":
                    this.saveHandler();
                    break;
                case "edit":
                    break;
                case "discuss":
                    this.discussHandler();
                    break;
                case "report":
                    break;
                case "help":
                    break;
                case "view":
                    break;
                case "share":
                    break;
                }
            }
        },
        discussHandler: function () {
            //TODO Refactor with Bootstrap Dialog       
            $('#chatdialog').dialog({
                width: 250
            });
            var dialog_width = $("#chatdialog").dialog("option", "width");
            var win_width = $(window).width();
            var menu_width = $('div.bottom').width();
            $('#chatdialog').dialog({
                position: [win_width - dialog_width - menu_width - 6, 200]
            });

            $('#chatdialog').dialog('open');
            $('#chatdialog').dialog({
                resizable: false
            });
        },
        saveHandler: function () {
            //TODO Refactor with Bootstrap Dialog
            canvas.deactivateAll();
            var data = canvas.toDataURL('png', 0.1);
            popup('popUpDiv', 'closediv', 600, 600);
            $("#result").html('<img src=' + data + ' />');
        },
        showUserInfoSection: function () {
            $(".userInfoSec").fadeIn();
        },
        hideUserInfoSection: function () {
            if ($(".userInfoSec:visible")) {
                $(".userInfoSec").fadeOut();
            }
        },
        stateUpdated: function (obj, state) {
            if (state == "modified") {
                if (obj.length) {
                    var objGroup = [];
                    var originalObj;
                    for (var i = 0; i < obj.length; i++) {
                        originalObj = actionBar.getOriginalObj(obj[i]);
                        objGroup.push({
                            palette: obj[i].palette,
                            name: obj[i].name,
                            action: 'modified',
                            path: obj[i].path,
                            args: [{
                                uid: obj[i].uid,
                                object: originalObj
                            }]
                        });
                    }
                    matisse.undoStack.push(objGroup);
                } else {
                    var originalObj = actionBar.getOriginalObj(obj);
                    matisse.undoStack.push({
                        palette: obj.palette,
                        name: obj.name,
                        action: 'modified',
                        path: obj.path,
                        args: [{
                            uid: obj.uid,
                            object: originalObj
                        }]
                    });
                }
            } else if (state == "created") {
                if (obj) {
                    matisse.undoStack.push(obj);
                } else {
                    matisse.undoStack.push({
                        palette: matisse.paletteName,
                        action: matisse.action,
                        args: matisse.shapeArgs
                    });
                }
            } else if (state == "deleted") {
                var activeGroup = canvas.getActiveGroup();
                if (activeGroup) {
                    var objectsInGroup = activeGroup.getObjects();
                    var objGroup = [];
                    var originalObj;
                    for (var i = 0; i < objectsInGroup.length; i++) {
                        originalObj = actionBar.getOriginalObj(objectsInGroup[i]);
                        objGroup.push({
                            palette: objectsInGroup[i].palette,
                            action: objectsInGroup[i].name,
                            args: [objectsInGroup[i]]
                        });
                    }
                    matisse.undoStack.push(objGroup);
                    matisse.main.deleteObjects();
                } else {
                    var obj = canvas.getActiveObject();
                    if (obj) matisse.undoStack.push({
                        palette: obj.palette,
                        action: obj.name,
                        args: [obj]
                    });
                    matisse.main.deleteObjects();
                }
            }
            if (matisse.undoStack.length > 0) {
                $('#Undo').removeClass('disabled');
            } else {
                $('#Undo').addClass('disabled');
            }
        },
        handleUndoRedoAction: function (command) {
            var executeCommandStack, restoreCommandStack, executeCommandObj, restoreCommandObj;
            if (command == "undo") {
                executeCommandStack = matisse.undoStack;
                restoreCommandStack = matisse.redoStack;
                executeCommandObj = $('#Undo');
                restoreCommandObj = $('#Redo');
            } else if (command == "redo") {
                executeCommandStack = matisse.redoStack;
                restoreCommandStack = matisse.undoStack;
                executeCommandObj = $('#Redo');
                restoreCommandObj = $('#Undo');
            }
            var obj = executeCommandStack.pop();
            if (obj) {
                var actionPerformed = obj.action || obj[0].action;
                if (actionPerformed == "modified") {
                    if (obj.length) {
                        var objGroup = [];
                        var uidList = [];
                        for (var i = 0; i < obj.length; i++) {
                            uidList.push(obj[i].args[0].uid);
                        }
                        canvas.getObjects().forEach(function (item, index) {
                            var uidIndex = uidList.indexOf(item.uid);
                            if (uidIndex >= 0) {
                                var currentObj = actionBar.getCurrentObj(item);
                                var objInGroup = obj[uidIndex];
                                objGroup.push({
                                    action: "modified",
                                    name: objInGroup.name,
                                    palette: objInGroup.palette,
                                    path: objInGroup.path,
                                    args: [{
                                        uid: objInGroup.args[0].uid,
                                        object: currentObj
                                    }]
                                });
                                matisse.comm.sendDrawMsg({
                                    action: objInGroup.action,
                                    name: objInGroup.name,
                                    palette: objInGroup.palette,
                                    path: objInGroup.path,
                                    args: objInGroup.args
                                });
                                matisse.main.modifyObject(objInGroup.args);
                            }
                        });
                        restoreCommandStack.push(objGroup);
                    } else {
                        canvas.getObjects().forEach(function (item, index) {
                            if (item.uid == obj.args[0].uid) {
                                var currentObj = actionBar.getCurrentObj(item);
                                restoreCommandStack.push({
                                    action: "modified",
                                    name: obj.name,
                                    palette: obj.palette,
                                    path: obj.path,
                                    args: [{
                                        uid: obj.args[0].uid,
                                        object: currentObj
                                    }]
                                });
                                matisse.comm.sendDrawMsg({
                                    action: obj.action,
                                    name: obj.name,
                                    palette: obj.palette,
                                    path: obj.path,
                                    args: obj.args
                                });
                                matisse.main.modifyObject(obj.args);
                            }
                        });
                    }
                } else if (actionPerformed == "zindexchannge") {

                } else {
                    /* handle deletion and creation of shapes */
                    var created = true;
                    if (obj.length) {
                        var objGroup = [];
                        var uidList = [];
                        var itemGroup = [];
                        for (var i = 0; i < obj.length; i++) {
                            uidList.push(obj[i].args[0].uid);
                        }
                        canvas.getObjects().forEach(function (item, index) {
                            var uidIndex = uidList.indexOf(item.uid);
                            if (uidIndex >= 0) {
                                created = false;
                                itemGroup.push(item);

                            }
                        });

                        if (!created) {
                            restoreCommandStack.push(obj);
                            for (var i = 0; i < itemGroup.length; i++) {
                                canvas.setActiveObject(itemGroup[i]);
                                matisse.main.deleteObjects();
                            }
                        } else {
                            for (var i = 0; i < obj.length; i++) {
                                if (obj[i].args[0].stateProperties) {
                                    var currentObj = actionBar.getCurrentObj(obj[i].args[0]);
                                    currentObj.uid = obj[i].args[0].uid;
                                    currentObj.name = obj[i].action;
                                    currentObj.palette = obj[i].palette;
                                    currentObj.width = obj[i].args[0].width;
                                } else {
                                    var currentObj = obj[i].args[0];
                                }
                                matisse.comm.sendDrawMsg({
                                    palette: obj[i].palette,
                                    action: obj[i].action,
                                    path: obj[i].path,
                                    args: [currentObj]
                                });
                                matisse.palette[obj[i].palette].shapes[obj[i].action].toolAction.apply(null, obj[i].args);
                                objGroup.push({
                                    palette: obj[i].palette,
                                    action: obj[i].action,
                                    path: obj[i].path,
                                    args: [currentObj]
                                });
                            }
                            restoreCommandStack.push(objGroup);
                        }
                    } else {
                        canvas.getObjects().forEach(function (item, index) {
                            if (item.uid == obj.args[0].uid) {
                                created = false;
                                restoreCommandStack.push(obj);
                                canvas.setActiveObject(item);
                                matisse.main.deleteObjects();
                            }
                        });
                        if (created) {
                            if (obj.args[0].stateProperties) {
                                var currentObj = actionBar.getCurrentObj(obj.args[0]);
                                currentObj.uid = obj.args[0].uid;
                                currentObj.name = obj.action;
                                currentObj.palette = obj.palette;
                                currentObj.width = obj.args[0].width;
                            } else {
                                var currentObj = obj.args[0];
                            }
                            matisse.comm.sendDrawMsg({
                                palette: obj.palette,
                                action: obj.action,
                                path: obj.path,
                                args: [currentObj]
                            });
                            matisse.palette[obj.palette].shapes[obj.action].toolAction.apply(null, obj.args);
                            restoreCommandStack.push({
                                palette: obj.palette,
                                action: obj.action,
                                path: obj.path,
                                args: [currentObj]
                            });
                        }
                    }
                }
                restoreCommandObj.removeClass('disabled');
                if (executeCommandStack.length > 0) {
                    executeCommandObj.removeClass('disabled');
                } else {
                    executeCommandObj.addClass('disabled');
                }

            }
        },
        handleCopyAction: function () {
            $('#propdiv').dialog("close");
            canvas.isSelectMode = false;
            var objectToCopy = canvas.getActiveObject();
            matisse.drawShape = true;
            matisse.action = objectToCopy.name;
            matisse.paletteName = objectToCopy.palette;
            var obj = util.getPropertiesFromObject(matisse.palette[matisse.paletteName].shapes[matisse.action].properties, objectToCopy);
            obj.uid = util.uniqid();
            matisse.shapeArgs = [obj];
            $('div.m-quick-edit').fadeOut('fast', function () {
                canvas.discardActiveObject();
                canvas.renderAll();
            });
            $('div.copy-alert').slideDown(400).delay(2000).fadeOut(1000);
        },
        handleGroupCopyAction: function () {
            canvas.isSelectMode = false;
            matisse.drawShape = true;
            matisse.groupCopyMode = true;
            $('div.m-quick-edit-group').fadeOut('fast', function () {
                canvas.discardActiveObject();
                canvas.renderAll();
            });
            $('div.copy-alert').slideDown(400).delay(2000).fadeOut(1000);
        },
        handlealignLeftAction: function (selected_group, selected_group_obj_array) {
            // Align Left
            $.each(selected_group_obj_array, function (index, value) {
                var xpos = 0 - (selected_group.getWidth() / 2) + value.getWidth() / 2;
                value.set("left", xpos);
            });
            actionBar.stateUpdated(selected_group_obj_array, "modified");
        },
        handlealignRightAction: function (selected_group, selected_group_obj_array) {
            // Align Right
            $.each(selected_group_obj_array, function (index, value) {
                var xpos = 0 + (selected_group.getWidth() / 2) - value.getWidth() / 2;
                value.set("left", xpos);
            });
            actionBar.stateUpdated(selected_group_obj_array, "modified");
        },
        handlealignTopAction: function (selected_group, selected_group_obj_array) {
            // Align Top
            $.each(selected_group_obj_array, function (index, value) {
                var ypos = 0 - (selected_group.getHeight() / 2) + value.getHeight() / 2;
                value.set("top", ypos);
            });
            actionBar.stateUpdated(selected_group_obj_array, "modified");
        },
        handlealignBottomAction: function (selected_group, selected_group_obj_array) {
            // Align Bottom
            $.each(selected_group_obj_array, function (index, value) {
                var ypos = 0 + (selected_group.getHeight() / 2) - value.getHeight() / 2;
                value.set("top", ypos);
            });
            actionBar.stateUpdated(selected_group_obj_array, "modified");
        },
        handlealignCenterAction: function (selected_group, selected_group_obj_array) {
            // Align Center
            $.each(selected_group_obj_array, function (index, value) {
                value.set("top", 0);
                value.set("left", 0);
            });
            actionBar.stateUpdated(selected_group_obj_array, "modified");
        },
        handledistributeHorizontallyAction: function (selected_group, selected_group_obj_array) {
            //Distribut Horizontally
            var objRightVal = fabric.util.array.max(selected_group_obj_array, "left");
            var objLeftVal = fabric.util.array.min(selected_group_obj_array, "left");
            var spacing = (objRightVal - objLeftVal) / (selected_group_obj_array.length - 1);
            var spacingToAdd = spacing;
            selected_group_obj_array.sort(function (a, b) {
                return a.left - b.left
            });
            $.each(selected_group_obj_array, function (index, value) {
                if (value.left == objLeftVal || value.left == objRightVal) return;
                var xpos = objLeftVal + spacingToAdd;
                value.set("left", xpos);
                spacingToAdd += spacing;
            });
            actionBar.stateUpdated(selected_group_obj_array, "modified");
        },
        handledistributeVerticallyAction: function (selected_group, selected_group_obj_array) {
            //Distribut Vertically
            var objBottomVal = fabric.util.array.max(selected_group_obj_array, "top");
            var objTopVal = fabric.util.array.min(selected_group_obj_array, "top");
            var spacing = (objBottomVal - objTopVal) / (selected_group_obj_array.length - 1);
            var spacingToAdd = spacing;
            selected_group_obj_array.sort(function (a, b) {
                return a.top - b.top
            });
            $.each(selected_group_obj_array, function (index, value) {
                if (value.top == objBottomVal || value.top == objTopVal) return;
                var ypos = objTopVal + spacingToAdd;
                value.set("top", ypos);
                spacingToAdd += spacing;
            });
            actionBar.stateUpdated(selected_group_obj_array, "modified");
        },
        handlemakeSameWidthAction: function (group, items) {
            group.forEachObject(
                function(o) {
                    o.set({ width: items[0].width, scaleX: items[0].scaleX });
                });
        },
        handlemakeSameHeightAction: function (group, items) {
            group.forEachObject(
                function(o) {
                    o.set({ height: items[0].height, scaleY: items[0].scaleY });
                });
        },
        handleExportJsonAction: function () {
            var exportedJSON = JSON.stringify(canvas);
            popup('popUpDiv', 'closediv', 350, 150);
            $("#result").html("Please provide this exported canvas json while reporting the issue<br/><textarea class='json-export'>" + exportedJSON + "</textarea>");
        },
        handleImportJsonAction: function () {
            console.log("handle import called");
        },
        handleRawAction: function(){
        	if(util.checkForImage()){
        		alert("Show Image works only for whiteboards with no images!");
        		return;
        	}
        	//Canvas2Image.saveAsPNG(canvas, false); /* alernative method */
            canvas.deactivateAll();
            var data = canvas.toDataURL('png', 0.1)
            popup('popUpDiv', 'closediv', 600, 600);
            $('#device-container').hide();
            $("#result").html('<img src=' + data + ' />');
            
        },
        handleClipAction: function(){
            if(util.checkForImage()){
        		alert("Show Image works only for whiteboards with no images!");
        		return;
        	}
           var setClipCanvas = function(clipCanvas,xToAdd,yToAdd) {
            	$.each(clipCanvas.getObjects(),function(index,value) {
            		var left = value.get('left')+xToAdd;
            		var top = value.get('top')+yToAdd;
            		value.set("top", top);
    			    value.set("left", left);
    		    });
            };
            var clipImage = function() {
                var innerHeight = matisseContainer.innerHeight;
                var innerWidth = matisseContainer.innerWidth;
                var xmin = containerDiv.position().left;
                var xmax = innerWidth + containerDiv.offset().left;
                var ymin = containerDiv.position().top;
                var ymax = innerHeight + containerDiv.offset().top;
                clipCanvas.dispose();
                clipCanvas.setHeight(containerHeight);
                clipCanvas.setWidth(containerWidth);
                $.each(canvas.getObjects(),function(index,value) {
                    if(value.get('left')>xmin && value.get('left')<xmax && value.get('top')>ymin && value.get('top')<ymax) {
                        var obj = value.clone();
                        obj.set('left', obj.get('left')-containerDiv.position().left);
                        obj.set('top', obj.get('top')-containerDiv.position().top);
                        clipCanvas.add(obj);
                    }
                });
                setClipCanvas(clipCanvas,xToAdd,yToAdd);
                clipCanvas.setBackgroundImage("../images/" + matisseContainer.src, function() {
                    clipCanvas.sendToBack(matisse.vLine);
                    clipCanvas.sendToBack(matisse.hLine);
                    data = clipCanvas.toDataURL('png', 0.1);
                    $("#popUpDiv").slideUp("fast", function() {
                        $("#result").html('<img src=' + data + ' />');
                        $(this).slideDown("fast");
                    });
                    
                });
            };
            var clipCanvas = new fabric.Canvas('clip');
            var matisseContainer = matisse.containers[matisse.containerName];
            var containerHeight = matisseContainer.height;
            var containerWidth = matisseContainer.width;
            var containerImgSrc = "url(../images/" + matisseContainer.src + ")";
            var xToAdd = matisseContainer.viewportX;
            var yToAdd = matisseContainer.viewportY;
            clipCanvas.setHeight(canvas.height);
            clipCanvas.setWidth(canvas.width);
            $.each(canvas.getObjects(),function(index,value) { 
                clipCanvas.add(value.clone());
            });
            setClipCanvas(clipCanvas,xToAdd,yToAdd);
            canvas.deactivateAll();
            var data = clipCanvas.toDataURL('png', 0.1);
            popup('popUpDiv', 'closediv', 1024, 768);
            if(matisse.containerName=='browser') $('#popUpDiv').addClass('scale-container');
            $("#result").html('<img src=' + data + ' />');
            
            var containerDiv = $('#device-container');
            containerDiv.css({"height":containerHeight, "width":containerWidth, "background-image":containerImgSrc, "top":0, "left":0});
            containerDiv.draggable({ containment: "parent"}).show();
            setTimeout( function() {
                $('div.clip-alert').slideDown(400).delay(2000).fadeOut(1000);
            }, 500);
            $('#done').one('click',function(){
                clipImage(clipCanvas,xToAdd,yToAdd,containerDiv);
                containerDiv.hide().next('#done').hide();
            })
            
        },
        getOriginalObj: function(obj) {
            var originalObj = {};
            var j;
            for (j = 0; j < obj.stateProperties.length; j++) {
                originalObj[obj.stateProperties[j]] = obj.originalState[obj.stateProperties[j]];
            }
            originalObj["paths"] = obj["paths"];
            return originalObj;
        },
        getCurrentObj: function (obj) {
            var currentObj = {};
            var j;
            for (j = 0; j < obj.stateProperties.length; j++) {
                currentObj[obj.stateProperties[j]] = obj[obj.stateProperties[j]];
            }
            currentObj["paths"] = obj["paths"];
            return currentObj;
        }
    };
    return actionBar;
});
