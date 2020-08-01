/*
 * Copyright (C) 2012-2013 CloudJee, Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */



dojo.provide("wm.studio.pages.AddPatch.AddPatch");


dojo.declare("AddPatch", wm.Page, {
    i18n: true,
    fileName: "",
    start: function() {
        this.fileName = wm.version.replace(/[^a-zA-Z0-9]/g, "") + "_patches.js";
        var text = String(loadDataSync(dojo.moduleUrl("wm.common").path + this.fileName));
        this.fullText = text;

        /*
	var matches = text.match(/\/\* START WAVEMAKER PATCH \*\/([\s\S]*)\/\* END WAVEMAKER PATCH \*\//);
	if (matches) {
	    this.patchText = matches[1];
	} else {
	    this.patchText = "";
	}
	*/
        this.editor.setDataValue(this.fullText);
    },
    
    patchUrl: studio.getDictionaryItem("URL_PATCHES", {
        studioVersionNumber: wm.studioConfig.studioVersion.replace(/^(\d+\.\d+)\..*/, "$1"),
        studioSubVersionNumber: wm.studioConfig.studioVersion.replace(/^(\d+)\.(\d+)\.(\d+)(\.[A-Z0-9]+)?.*/, "$1" + "_" + "$2" + "_" + "$3" + "$4").replace(/\./g,"")
    }),
    loadPatchesClick: function() {
        studio.studioService.requestAsync("getLatestPatches", [this.patchUrl],
        dojo.hitch(this, function(inData) {
            studio.endWait();
            if (inData == "Could not find patches") app.alert(this.getDictionaryItem("ALERT_LOAD_PATCH_FAILED"));
            else {
                inData = inData.replace(/\&\#91;/g, "[").replace(/\&\#36;/g, "$");
                inData = inData.replace(/\<p\/\>/g, "");
                this.editor.setDataValue(inData);
            }
        }),
        dojo.hitch(this, function() {
            studio.endWait();
            app.alert(this.getDictionaryItem("ALERT_LOAD_PATCH_FAILED"));
        }));
        studio.beginWait(this.getDictionaryItem("WAIT_LOAD_PATCHES"));
    },
    findCodeButtonClick: function() {
        wm.openUrl(this.patchUrl);
    },
    saveButtonClick: function() {
        var editorValue = this.editor.getDataValue();
        try {
            eval(editorValue);
        } catch (e) {
            alert(e);
            return;
        }
        //var patch = "/* START WAVEMAKER PATCH */\n" + this.editor.getDataValue() + "\n/* END WAVEMAKER PATCH */\n";
        var patch = this.editor.getDataValue();
        /*
	var text = this.fullText;
	if (text.match(/\/\* START WAVEMAKER PATCH[\s\S]*END WAVEMAKER PATCH \*\//)) {
	    text = text.replace(/\/\* START WAVEMAKER PATCH[\s\S]*END WAVEMAKER PATCH \*\//, patch);
	} else {
	    text += patch;
	}	
	this.fullText = text;
	*/
        this.fullText = patch;

        studio.resourceManagerService.requestSync("writeFile", ["/common/" + this.fileName, this.fullText]);
        app.toastSuccess(this.getDictionaryItem("SAVED"));
        this.owner.owner.hide();
    },
    cancelButtonClick: function() {
        this.owner.owner.hide();
    }
});