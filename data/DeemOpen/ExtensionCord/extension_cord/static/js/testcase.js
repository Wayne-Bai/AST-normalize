/*
*
*   Copyright (c) 2013, Deem Inc. All Rights Reserved.
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*
*/
var state = {
    key:-100,
    disabled:false,
    search:false,
    page:1,
    elems:50,
    subfolder:false,

    nameordesc:"",
    asname:"",
    asdescription:"",
    aspriority:"",
    asauthor:"",
    asauto:"",
    asproduct:"",
    asstatus:[],
    bugid:"",
    addedversion:"",
    astype:[],
    asfolder:"",
    asdefaultassignee:"",
    asfeature:"",
    asid:"",
};
var tempstate = {
    teams:[],
};
var testcase = {
    submitTestCase:function ()
    {
        var node = $("#root").dynatree("getActiveNode");
        if (node != null){
            var folder_id = node.data.key;
            window.location.href="/create_test_case?folder_id="+encodeURI(folder_id);
        } else {
            var folder_id = -100;
            window.location.href="/create_test_case?folder_id="+encodeURI(folder_id);
        }
        return false;
    },
    enterSearch:function() {
        state.search = true;
        state.subfolder = $("#subfolder").is(':checked'); 
        state.page = 1;
        testcase.updateSearch();
        testcase.reload();
    },
    exitSearch:function() {
        state.search = false;
        state.page = 1;
        testcase.updateSearch();
        testcase.reload();
    },
    enterBulk:function() {
        $("td:nth-child(1),th:nth-child(1)").show();
        $("#bulkUpdate").hide();
        $("#bulkExit").show();
        $("#bulkNext").show();
        $("#folder_name").text(foldertree.folderName).css("font-size", "10pt");
        $("#folders").hide();
        $("#testcases").css("width","auto");
        $("#bulkNext").click( function() {
            var selected=testcase.getSelected();
            if (selected.length>0)
            {
                // posting test_case IDs with form POST
                var input = $("<input>", { type: "hidden", name: "tc-ids", value: selected }); 
                $('#bulkForm').append($(input));
                $("#form-div").dialog({
                    width: 'auto',
                    modal: true,
                });
            }
            else
            {
                $("#bulk-empty-error").dialog({
                    modal: true,
                    resizable: false,
                    buttons: {
                        OK: function() {
                            $( this ).dialog( "close" );
                        }
                    },
                });
            }
        }); 
    },
    getSelected:function() {
        var selected =[];
        $("input:checkbox:checked").each(function() {
            if ($(this).attr("checked"))
            {
                checked = ($(this).val());
                if (checked != "on")
                {
                    selected.push(checked);
                }
            }
        });
        return selected;
    },
    bulkSelectAll:function(status) {
        $(".checkbox").each(function() {
            $(this).attr("checked", status);
        });
    },
    bulkConfirm:function() {
    $("#dialog-confirm").dialog({
        resizable: false,
        height:'auto',
        modal: true,
        buttons: {
            "Update all items": function() {
                $.ajax({
                    type: "POST",
                    url: "/test_case/bulk/",
                    cache: false,
                    data: $("#bulkForm").serialize(),
                    success: function() {
                        $("#form-div").dialog("close")
                        $("#dialog-success").dialog({
                            modal: true,
                            buttons: {
                                "Back to Bulk Edit": function() {
                                    $(this).dialog("close");
                                },
                                "Exit Bulk Edit": function() {
                                    window.location.replace("/test_case/");
                                }
                            }
                        });
                    }
                });
                $(this).dialog("close");
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        }   
        });
    },
    foldertreeModal:function(title,position,select) {
        $("#root").dynatree("destroy");
        $("#root").empty();
        foldertree.initialize();
        $("#folders").dialog({
            modal: true,
            position: position,
            title: title,
            height: 675,
            width: 370,
            buttons: {
                "Select": function() {
                    var node = $("#root").dynatree("getActiveNode");
                    if (select) 
                    {
                        $("#folder-name").text(foldertree.folderName).css("font-size", "10pt");
                        $("#asfolder").val(node.data.key);
                    }
                    else
                    {
                        $("#folder_name").text(node.data.title + " (after submit)").css({"font-size":"10pt", "font-style":"italic", "color":"green"});
                        $("#id_folder").val(node.data.key);
                    }
                    $( this ).dialog( "close" );
                },
                Cancel: function() {
                    $( this ).dialog( "close" );
                }
            },
            close: function() {
            }
            });
    },
    selectFolder:function() {
        var position = { my: "left", at: "left", of: window };
        var title = "Select a Folder";
        var select = true;
        testcase.foldertreeModal(title,position,select);
    },
    changeFolder:function() {
        var position = { my: "left", at: "center", of: window }
        var title = "Change Folder";
        var select = false;
        testcase.foldertreeModal(title,position,select);
    },
    updateSearch:function() {
        if(state.search) {
            $("#enterSearch").hide();
            $("#exitSearch").show();
            $("#folders").hide();
            $("#advancedsearch").show();
            if( $("#searchFormText").val() )
                $(".testcase-list-title").text("Tests containing '" + $("#searchFormText").val() + "'");
            else
                $(".testcase-list-title").text("All Tests");
        } else {
            $("#exitSearch").hide();
            $("#enterSearch").show();
            $("#advancedsearch").hide();
            $("#folders").show();
            $("#searchFormText").val("");
        }
    },
    updateViewDisabled:function() {
        $("#viewDisabled").text(state.disabled?"View Enabled":"View Disabled")
    },
    setFieldsFromState:function() {
        $("#searchFormText").val(state.nameordesc);
        $("#asname").val(state.asname);
        $("#asdescription").val(state.asdescription);
        $("#aspriority").val(state.aspriority);
        $("#asauthor").val(state.asauthor);
        $("#bugid").val(state.bugid)
        $("#addedversion").val(state.addedversion)
        $("#astype").val(state.astype)
        $("#asfolder").val(state.asfolder)
        $("#asauto").val(state.asauto);
        $("#asstatus").val(state.asstatus);

        if(tempstate.teams.length) {
            $("#asproduct").empty();
            $("#asproduct").append($("<option>",{ value: "", text: "" }));
            $.each(tempstate.teams, function(index, value){
                $("#asproduct").append($("<option>",{
                    value: value.title.replace(" ","+"),
                    text: value.title
                }));
            }); 
        }
        $("#asproduct").val(state.asproduct);
        $("#asdefaultassignee").val(state.asdefaultassignee);
        $("#asfeature").val(state.asfeature);
        $("#asid").val(state.asid);

        testcase.updateSearch(); 
        testcase.updateViewDisabled();
    },
    setStateFromFields:function() {
        state.nameordesc = $("#searchFormText").val();
        state.asname = $("#asname").val();
        state.asdescription = $("#asdescription").val();
        state.aspriority = $("#aspriority").val();
        state.asauthor = $("#asauthor").val();
        state.bugid = $("#bugid").val();
        state.addedversion = $("#addedversion").val();
        state.astype = $("#astype").val();
        state.asfolder = $("#asfolder").val();
        state.asauto = $("#asauto").val();
        state.asproduct = $("#asproduct").val();
        state.asstatus = $("#asstatus").val();
        state.asdefaultassignee = $("#asdefaultassignee").val();
        state.asfeature = $("#asfeature").val();
        state.asid = $("#asid").val();
    },
    deserialize:function() {
        var allVars = $.getUrlVars();
        state.key = allVars['key']?allVars['key']:-100;
        state.disabled = 'true' === allVars['disabled'];
        state.search = 'true' === allVars['search'];
        state.subfolder = 'true' === allVars['subfolder'];
        state.page = allVars['page']?allVars['page']:1;
        state.elems = allVars['elems']?allVars['elems']:50;

        state.nameordesc = allVars['nameordesc'] || "";
        state.asname = allVars['asname'] || "";
        state.asdescription = allVars['asdescription'] || "";
        state.aspriority = allVars['aspriority'] || "";
        state.asauthor = allVars['asauthor'] || "";
        state.asauto = allVars['asauto'] || "";
        state.asproduct = allVars['asproduct'] || "";
        if (allVars['asstatus']) {
            state.asstatus = allVars['asstatus'].split(',');
        } else {
            state.asstatus = [];
        }
        state.bugid = allVars['bugid'] || "";
        state.addedversion = allVars['addedversion'] || "";
        if (allVars['astype']) {
            state.astype = allVars['astype'].split(',');
        } else {
            state.astype = [];
        }
        state.asfolder = allVars['asfolder'] || "";
        state.asdefaultassignee = allVars['asdefaultassignee'] || "";
        state.asfeature = allVars['asfeature'] || "";
        state.asid = allVars['asid'] || "";

        testcase.setFieldsFromState();
    },
    serialize:function() {
        var copystate = {};
        testcase.setStateFromFields();

        if(state.key!=-100) copystate.key = state.key;
        if(state.disabled) copystate.disabled = true;
        if(state.search) copystate.search = true;
        if(state.subfolder) copystate.subfolder = true;
        if(state.page != 1) copystate.page = state.page;
        copystate.elems = state.elems;

        if(state.nameordesc.length) copystate.nameordesc = state.nameordesc;
        if(state.asname.length) copystate.asname = state.asname;
        if(state.asdescription.length) copystate.asdescription = state.asdescription;
        if(state.aspriority.length) copystate.aspriority = state.aspriority;
        if(state.asauthor.length) copystate.asauthor = state.asauthor;
        if(state.asauto.length) copystate.asauto = state.asauto;
        if(state.asproduct.length) copystate.asproduct = state.asproduct;
        if(state.bugid.length) copystate.bugid = state.bugid;
        if(state.addedversion.length) copystate.addedversion = state.addedversion;
        if(state.astype) {
            copystate.astype = "";
            for (var i=0; i<state.astype.length; i++) {
                copystate.astype += state.astype[i];
                copystate.astype += ",";
            }
            if (copystate.astype.length) {
                copystate.astype = copystate.astype.slice(0,-1);
            }
        }
        if(state.asfolder.length) copystate.asfolder = state.asfolder;
        if(state.asdefaultassignee.length) copystate.asdefaultassignee = state.asdefaultassignee;
        if(state.asfeature.length) copystate.asfeature = state.asfeature;
        if(state.asstatus) { 
            copystate.asstatus = "";
            for (var i=0; i<state.asstatus.length; i++) {
                copystate.asstatus += state.asstatus[i];
                copystate.asstatus += ",";
            }
            if (copystate.asstatus.length) {
                copystate.asstatus = copystate.asstatus.slice(0,-1);
            }
        }
        if(state.asid.length) copystate.asid = state.asid;

        if(state.planid) copystate.planid = state.planid;
        if(state.add) copystate.add = true;

        return $.param(copystate)
    },
    onFolderChange:function() {
        state.key = $("#root").dynatree("getActiveNode").data.key;
        $(".testcase-list-title").text(foldertree.folderName);
        testcase.reload();
    },
    reload:function() {
        window.History.pushState(
                null, 
                state.search?"Tests: Search":"Tests: " + foldertree.folderName, 
                "?" + testcase.serialize() );
    },
    initialize:function() {

        $("#asForm").submit( function() { $("#searchFormText").val(""); testcase.enterSearch(); } );
        $("#searchForm").submit( function() { $('#asForm')[0].reset(); testcase.enterSearch();} );
        $("#enterSearch").click( function(event) { event.preventDefault(); testcase.enterSearch(); } );
        $("#exitSearch").click( function(event) { event.preventDefault(); testcase.exitSearch(); } );
        $("#bulkUpdate").click( function(event) { event.preventDefault(); testcase.enterBulk(); } );
        $("#change-folder-button").click(function(event) { event.preventDefault(); testcase.changeFolder(); });
        $("#select-folder-button").click(function(event) { event.preventDefault(); testcase.selectFolder(); });
        
        // when view disabled link is clicked, switch between displaying disabled cases
        $("#viewDisabled").click(function(event){ 
            event.preventDefault();
            state.disabled = !state.disabled; 
            testcase.updateViewDisabled(); 
            state.page = 1; 
            testcase.reload();
        });
        
        $(".ajaxPaginate").live('click',function(event){
            event.preventDefault();
            state.page = $(this).attr("value");
            testcase.reload();
        });

        $(".dropdown-menu a").live('click', function(event){
            event.preventDefault();
            state.elems = $(this).attr("value");
            testcase.reload();
        });

        $("#searchForm").show();
        testcase.deserialize();
    }
};
