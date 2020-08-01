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

QueryEditor.widgets = {
	smallToolbarImageList: ["wm.ImageList", {width: 16, height: 16, colCount: 32, url: "images/smallToolbarBtns.png"}, {}],
	layoutBox1: ["wm.Layout", {height: "100%", imageList: "smallToolbarImageList"}, {}, {
	    editorToolbar: ["wm.Panel", {_classes: {domNode:["StudioToolBar"]}, border: "0", height: "29px", width: "100%", layoutKind: "left-to-right", border: "0,0,1,0", borderColor: "#959DAB"}, {}, {
			toolbarBtnHolder: ["wm.Panel", {border: "0", height: "100%", layoutKind: "left-to-right", width: "100%", padding: "0,4"}, {}, {
				saveQueryBtn: ["wm.studio.ToolbarButton", {imageIndex: 8,  disabled: true, hint: "Save Query"}, {onclick: "saveQuery"}],
				toolbarspacer1: ["wm.studio.ToolbarSpacer", {}, {}],
				newQueryBtn: ["wm.studio.ToolbarButton", {imageIndex: 25, hint: "New Query"}, {onclick: "newQuery"}],
				delQueryBtn: ["wm.studio.ToolbarButton", {imageIndex: 0,  disabled: true, hint: "Delete Query"}, {onclick: "removeQuery"}]
			}],
			logoBtmHolder: ["wm.Panel", {border: "0", width: "221px"}, {}]
		}],
		editorContainer: ["wm.Panel", {border: "0", height: "100%", layoutKind: "left-to-right", width: "100%"}, {}, {
			panel6a: ["wm.Panel", {border: "0", height: "100%", width: "100%"}, {}, {
			    panel1: ["wm.Panel", {border: "0", height: "100%", width: "100%", minWidth: "400", verticalAlign: "top", horizontalAlign: "left"}, {}, {
				    panelTopLayout: ["wm.Panel", {height: "100px", width: "100%", layoutKind: "left-to-right"}, {}, {
					    queryPropsPanel: ["wm.Panel", {border: "1,0,0,0", borderColor: "#000000", height: "100%", width: "400px", padding: "4", verticalAlign: "top", horizontalAlign: "left"}, {}, {
						queryDataModelInput: ["wm.Editor", {_classes: {domNode: ["StudioLabel", "StudioEditor"]}, layoutKind: "left-to-right", caption: "Data Model", display: "Select", width: "100%", height: "24px", disabled: true,emptyValue: "emptyString"}, {onchange: "queryDataModelInputChange"}, {
							    editor: ["wm._SelectEditor", {}, {}]
							}],
						queryNameInput: ["wm.Editor", {_classes: {domNode: ["StudioLabel", "StudioEditor"]},layoutKind: "left-to-right", caption: "Name", width: "100%", height: "24px",emptyValue: "emptyString"}, {onchange: "queryNameChanged"}, {
							    editor: ["wm._TextEditor", {changeOnKey: true}, {}]
							}],
						    queryCommentInput: ["wm.Editor", {_classes: {domNode: ["StudioLabel", "StudioEditor"]},layoutKind: "left-to-right", caption: "Comment", width: "100%", height: "24px",emptyValue: "emptyString"}, {onchange: "queryCommentChanged"}, {
							    editor: ["wm._TextEditor", {changeOnKey: true}, {}]
							}]
						}],
					    helpContainer: ["wm.Panel", {border: "0,0,1,1", borderColor: "#959DAB", width: "100%", height: "100%", layoutKind: "top-to-bottom", margin: "0,0,0,30"}, {}, {
						/*helpSectionLabel: ["wm.Label", {caption: "Usage Notes", border: "0", height: "18px", width: "100%", padding: "0,0,0,5"}],*/
						helpPanel: ["wm.Panel", { width: "100%", height: "100%", margin: "0,5,0,0", layoutKind: "top-to-bottom"}, {}, {
						    helpHtml: ["wm.Html", {width: "100%", height: "100%", html: "<ol><li>To use this query, insert a new wm.ServiceVariable</li><li>Use of LIMIT and OFFSET are not supported in HQL; Use your ServiceVariable's maxResults and firstRow properties</li><li>Upgraded projects read this: <a href='http://dev.wavemaker.com/wiki/bin/wmdoc_6.4/WM64RelNotes#HSupportforLIMITandOFFSET' target='Doc'>6.4 Release Notes</a></li><li><a href='${wmdoc}HqlTutorial' target='Doc'>Details on query syntax</a></li></ol>"}]

							}]
						}]
					}],
					queryTopHalfPanel: ["wm.Panel", {border: "0", height: "100%", width: "100%"}, {}, {
					    queryDefSpacing: ["wm.Panel", {border: "0", height: "100%", width: "100%", padding: "4"}, {}, {
						queryDefLabel: ["wm.Label", {_classes: {domNode: ["StudioLabel"]}, caption: "Query Definition", border: "0", height: "18px", width: "100%"}, {}, {
								format: ["wm.DataFormatter", {}, {}]
							}],
						queryPanel: ["wm.Panel", {border: "0", height: "100%",width:"100%", padding: "4"}, {}, {
						    queryInputPanel: ["wm.Panel", {border: "0", height: "100%", width: "100%", layoutKind: "left-to-right"}, {}, {
								    queryTextArea: ["wm.LargeTextArea", {readOnly: false, border: "0", width: "100%", height: "100%", changeOnKey: true, emptyValue: "emptyString"}, {onchange: "queryTextAreaChanged"}]
								}],
						    queryOptionsPanel: ["wm.Panel", {border: "0", height: "22px", width: "100%", layoutKind: "left-to-right"}, {}, {
									returnsSingleResultCheckBox: ["wm.Editor", {_classes: {domNode: ["StudioLabel"]},layoutKind: "left-to-right", caption: "Returns single result", display: "CheckBox", captionSize: "150px", width: "200px"}, {onchange: "singleResultChanged"}, {
										editor: ["wm._CheckBoxEditor", {}, {}]
									}],
								    joinWarningLabel: ["wm.Label", {_classes: {domNode: ["StudioLabel"]}, width: "100%", height: "100%", caption: "TIP: JOIN queries should specify fields to select: 'SELECT field1,field2 FROM...'"}]
								}]
							}]
						}],

					    queryParamsLabel: ["wm.Label", {_classes: {domNode: ["StudioLabel"]}, caption: "Query Parameters", border: "0", height: "18px", width: "100%"}, {}, {
								format: ["wm.DataFormatter", {}, {}]
							}],
		                            /*editorToolbar2: ["wm.Panel", {border: "0", height: "29px", width:"100%",layoutKind: "left-to-right", margin:"4,0,0"}, {}, {
			                            toolbarBtnHolder2: ["wm.Panel", {border: "0", height: "100%", layoutKind: "left-to-right", width: "100%", padding: "0,4"}, {}, {
							addInputBtn: ["wm.ToolButton", {imageIndex: 25, width: "24px", height: "24px", margin: "0", border: "0"}, {onclick: "addBindParam"}],
							deleteParamBtn: ["wm.ToolButton", {imageIndex: 0, width: "24px", height: "24px",  margin: "0", border: "0"}, {onclick: "removeBindParam"}]
                                                    }]
                                                }],*/

					    paramsPanel: ["wm.Panel", { border: "0", height: "100%", width:"100%", padding: "4"}, {}, {
						queryInputsList: ["wm.List", {renderVisibleRowsOnly:false,_classes: {domNode: ["StudioList"]}, height: "100%", width: "100%", border: "0"}, {onselect: "parmSelected"}],

						addNewParamPanel: ["wm.Panel", {border: "0", height: "28px", width:"100%", layoutKind: "left-to-right", padding: "0", verticalAlign: "center", horizontalAlign: "left"}, {}, {
								addBindParamLabel: ["wm.Label", {_classes: {domNode: ["StudioLabel"]}, caption: "Add bind parameter:", border: "0", height: "100%", width: "125px"}, {}, {
								    format: ["wm.DataFormatter", {}, {}]
								}],
								bindNameInput: ["wm.Text", {_classes: {domNode: ["StudioEditor"]}, layoutKind: "left-to-right", caption: "Name", padding: "", captionSize: "50px", width: "150px", height: "20px"}, {onchange: "parameterPropEdit"}, {
                                                                    binding: ["wm.Binding", {}, {}, {
					                                wire: ["wm.Wire", {"targetProperty":"disabled","source":"queryInputsList.emptySelection"}, {}]
				                                    }]
								}],
						    bindTypeInput: ["wm.Editor", {_classes: {domNode: ["StudioLabel", "StudioEditor"]},layoutKind: "left-to-right", caption: "Type", display: "Select", padding: "", captionSize: "50px", width: "150px", height: "20px"}, {onchange: "parameterPropEdit"}, {
                                                                    binding: ["wm.Binding", {}, {}, {
					                                wire: ["wm.Wire", {"targetProperty":"disabled","source":"queryInputsList.emptySelection"}, {}]
				                                    }],
								    editor: ["wm._SelectEditor", {}, {}]
								}],
								isInputListCheckBox: ["wm.Checkbox", {_classes: {domNode: ["StudioEditor"]}, caption: "List", padding: "2,0,0,0", captionSize: "60px", width: "80px", height: "20px"}, {onchange: "parameterPropEdit"}, {
                                                                    binding: ["wm.Binding", {}, {}, {
					                                wire: ["wm.Wire", {"targetProperty":"disabled","source":"queryInputsList.emptySelection"}, {}]
				                                    }]
								}],
						                bindParamInput: ["wm.Text", {_classes: {domNode: ["StudioEditor"]}, caption: "Test Value:", width: "100%", minWidth: "180", captionSize: "100px"}, {onchange: "parameterPropEdit"}, {
                                                                    binding: ["wm.Binding", {}, {}, {
					                                wire: ["wm.Wire", {"targetProperty":"disabled","source":"queryInputsList.emptySelection"}, {}]
				                                    }]
						                }]
							    }]
							}]
					}]
				}],
			    splitter2: ["wm.Splitter", {_classes: {domNode: ["StudioSplitter"]}, border: "0"}, {}],
			    queryTestPanel: ["wm.Panel", {border: "1,0,0,0", borderColor: "#000000", height: "120px", width:"100%",padding: "2", width: "100%"}, {}, {
				panel1a: ["wm.Panel", {border: "0", height: "26px", width:"100%", layoutKind: "left-to-right"}, {}, {
					    testLabel: ["wm.Label", {_classes: {domNode: ["StudioLabel"]}, caption: "Test Query", border: "0", height: "26px", width: "100px"}, {}, {
					        format: ["wm.DataFormatter", {}, {}]
					    }],
				    maxResultsInput: ["wm.Editor", {_classes: {domNode: ["StudioLabel", "StudioEditor"]},layoutKind: "left-to-right", caption: "Max Results:", captionSize: "140px", width: "200px", displayValue: "10", emptyValue: "null"}, {}, {
						editor: ["wm._NumberEditor", {}, {}]
					    }],
					    spacer15: ["wm.Spacer", {width: "30px"}, {}],
                        runQueryBtn: ["wm.studio.ToolbarButton", {caption: "", iconUrl: "images/flash_16.png",
					    /*runQueryBtn: ["wm.Button", {caption: "<img src=\"images/flash_16.png\"/>", margin: "0", width: "24px", border: "0", */
								        disabled: true, hint: "Test Query"}, {onclick: "runQuery"}]
					}],
					emptyResultSetLabel: ["wm.Label", {_classes: {domNode: ["StudioLabel"]}, caption: "Empty Result Set", border: "0", width: "200px", showing: false}, {}, {
						format: ["wm.DataFormatter", {}, {}]
					}],
				        queryOutputListPanel: ["wm.Panel", {width: "100%", height: "100%", layoutKind: "top-to-bottom", autoScroll: true, horizontalAlign: "left"}, {}, {
				            queryOutputList: ["wm.List", {_classes: {domNode: ["StudioList"]}, height: "100%", width: "100%", border: "0"}, {}]
					}]
				}]
			}],
			splitter1: ["wm.Splitter", {_classes: {domNode: ["StudioSplitter"]}, border: "0", layout: "right", showing: false}, {}],
			panel5a: ["wm.Panel", {border: "0", width: "200px", showing: false}, {}, {
				typeRefTree: ["wm.Tree", {height: "100%", border: "0"}, {}]
			}]
		}]
	}]
}