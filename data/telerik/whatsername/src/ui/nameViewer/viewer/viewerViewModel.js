(function(wrn){

      'use strict';

      //below you place anything private you don't want exposed in the viewModel

      //below we create the viewModel

      wrn.viewer = {//create viewModel namespace in global i.e. namespace.[viewModel Name], to expose to global
            viewModel: kendo.observable({
                  //the actual model
                  modelData: wrn.viewerModel,
                  //other properties or functions you want to observe and expose to html
                  init:function(e){
                        this.scroller = e.view.element.find('#scrollview');
                  },
                  show:function(e){//set data on scrollview
                        this.currentId = e.view.params.id;

                        this.set('groupNameBanner',wrn.groupModel.get(this.currentId).group + ' group');

                        if(this.modelData.get(this.currentId) === undefined){
                              this.set('noPhotosNames',false);
                              this.set('yesPhotosNames',true);
                              return false;
                        }else{
                              this.set('noPhotosNames',true);
                              this.set('yesPhotosNames',false);
                        }

                        var that = this;
                        //construct scrollview
                        this.scroller.kendoMobileScrollView({
                              template: $('#scrollerTemplate').html(),
                              dataSource: new kendo.data.DataSource({
                                    data: this.modelData.get(this.currentId).imagesAndName,
                              }),
                              change:function(){
                                     //run bindings
                                    kendo.unbind($('#scrollViewBindings'));
                                    kendo.bind($('#scrollViewBindings'), that);
                              }
                        });
                  },
                  hide:function(){//remove data from scrollView
                        if(this.scroller.data('kendoMobileScrollView') !== undefined){
                              kendo.unbind($('#scrollViewBindings'));
                              this.scroller.data('kendoMobileScrollView').destroy();
                              this.scroller.empty();
                        }
                  },
                  removePhotoName:function(e){
                        var id = $(e.currentTarget).data('id');
                        var index1 = _.findIndex(this.modelData.get(this.currentId).imagesAndName, function(obj){
                              return obj.id === id;
                        });
                        this.modelData.get(this.currentId).imagesAndName.splice(index1,1);

                        if(this.modelData.get(this.currentId).imagesAndName.length === 0){
                              this.modelData.remove(this.modelData.get(this.currentId));
                        }

                        this.modelData.sync();
                        wrn.removeDestroyed('viewerModel');

                        if(this.modelData.get(this.currentId) === undefined){
                              this.set('noPhotosNames',false);
                              this.set('yesPhotosNames',true);
                              this.set('editButtonText', 'edit');
                              this.set('notEditMode',true);
                              this.hide(); //run hide because we remove all photos
                        }else{
                              //run bindings, again because the data changed
                              kendo.bind($("#scrollViewBindings"), this);
                              this.set('noPhotosNames',true);
                              this.set('yesPhotosNames',false);
                        }
                  },
                  addImageUi:function(){//go add an image to this group
                        wrn.app.navigate('#addNameView?id='+this.currentId);
                        this.set('editButtonText', 'edit');
                        this.set('notEditMode',true);
                  },
                  goBackToList:function(){
                        this.set('editButtonText', 'edit');
                        this.set('notEditMode',true);
                        wrn.app.navigate('#groupListView');
                  },
                  editModeToggle:function(){//show edit mode i.e. the delete icon
                        if(this.notEditMode === false){//go into edit mode
                              this.set('editButtonText', 'edit');
                              this.set('notEditMode',true);
                        }else{//stop edit mode
                              this.set('editButtonText', 'done');
                              this.set('notEditMode',false);
                        }
                  },
                  noPhotosNames:true,
                  editButtonText:'edit',
                  groupNameBanner:'',
                  notEditMode:true,
                  yesPhotosNames:false,
                  currentId:'',
                  currentGroup:'',
                  scroller:null
            })
      };

})(wrn); //pass in global namespace