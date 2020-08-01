window.jermaine.util.namespace("window.ide", function (ns) {
    var Project = ns.models.Project,
        IDEView = ns.views.IDEView;

    var DirectoryView = new window.jermaine.View (function () {
        this.hasA("url").which.isA("string");
        this.hasAn("ideView").which.validatesWith(function (v) {
            return v instanceof ns.views.IDEView;
        });

        this.isBuiltWith("url", "ideView", function () {
            var instance = this.ideView().instance(),
                that = this;

            $.getJSON(this.url(), function (result) {
                var directoryTemplate = Handlebars.compile($("#directory-template").html());
                Handlebars.registerPartial("directory-entry", $("#directory-entry-partial").html());
                for (i = 0; i < result.length; ++i) {
                    result[i].name = result[i].url.match(/(.*).json/)[1];
                }
                $("#IDE-directory").append(directoryTemplate({project:result}));

                $(".directory_listing").each(function (i, elt) {
                    $(elt).click(function () {
                        that.setActiveMenuItem(this);
                        return false;
                    });
                });

                $("#IDE-editor_button").click(function () {
                    that.ideView().toggleEditorAndDirectory();
                });

                $(".edit_sketch_button").click(function () {
                    that.ideView().toggleEditorAndDirectory();
                });



                if ($("#ide").hasClass("server")) {
                    $("#new_sketch_button").click(function () {
                        if ($("#new_sketch_div").is(":visible")) {
                            $("#new_sketch_div").slideUp(function () {
                                $("#new_sketch_input").val("");
                            });
                        } else {
                            $("#new_sketch_div").slideDown();
                        }
                    });



                    $("#new_sketch_input").keypress(function (e) {
                        if (e.keyCode === 13 && $(this).val() !== "" ) {
                            if ($(this).val().length > 30) {
                                that.ideView().instance().messages().add("sketch title can't be more than 30 characters");
                            } else {
                                that.createNewSketch($(this).val());                                
                            }
                        }
                    });

                    $(".delete_sketch_button").click(function () {
                        that.deleteSketch($(this).parent("div").attr("id"));
                        return false;
                    });
                }


                if (result.length > 0) {
                    instance.project(new Project("sketches/" + result[0].url));
                } else {
                    //show directory
                    that.ideView().toggleEditorAndDirectory();
                    that.setUpEmptyDirectory();
                }
            });
        });

        this.respondsTo("deleteSketch", function (name) {
            var that = this;
            var instance = this.instance();
            if (confirm("Are you sure you want to delete '"+name+"'?"))  {
                $.post("sketches/"+name+"/delete", function (response) {
                    if ($("#"+name).hasClass("active")) {
                        if ($("#"+name).next("div.directory_listing").size() > 0) {
                            $("#"+name).next("div.directory_listing").trigger("click");
                        } else if ($("#"+name).prev("div.directory_listing").size() > 0) {
                            $("#"+name).prev("div.inactive").trigger("click");
                        } else {
                            that.setUpEmptyDirectory();
                        }
                    }
                    $("#"+name).fadeOut(function () {
                        $("#"+name).remove();
                    });
                });
            }
        });

        this.respondsTo("createNewSketch", function (name) {
            var that = this,
                instance = this.instance(),
                directoryEntryTemplate = Handlebars.compile($("#directory-entry-partial").html());

            $.post("sketches/new", {"title":name}, function (sketch) {
                var p = {"title":sketch.title,"name":sketch.slug,"url":sketch.slug+".json"};

                //because this is returning strings on error :(
                if (typeof (sketch) === "object") {
                    var menuEntry = $($.trim(directoryEntryTemplate(p)));
                    menuEntry.hide();
                    menuEntry.insertAfter("#new_sketch_div");
                    
                    if ($("#empty_directory").size() > 0) {
                        $("#empty_directory").remove();
                        $("#IDE-editor_button").click(function () {
                            that.ideView().toggleEditorAndDirectory();
                        });
                    }

                    menuEntry.children(".delete_sketch_button").click(function () {
                        that.deleteSketch($(this).parent("div").attr("id"));
                        return false;
                    });

                    menuEntry.children(".edit_sketch_button").click(function () {
                        that.ideView().toggleEditorAndDirectory();
                        return false;
                    });

                    menuEntry.click(function () {
                        that.setActiveMenuItem(this);
                        return false;
                    });

                    $("#new_sketch_div").fadeOut(function () {
                        $("#new_sketch_input").val("");
                        menuEntry.fadeIn(function () {
                            menuEntry.trigger("click");
                        });
                    });

                    //if there is only one element in the list,
                    //we need to re-enable the editor button
                    if ($(".directory_listing").size() === 1) {
                        $("#IDE-editor_button").click(function () {
                            that.ideView().toggleEditorAndDirectory();
                        });
                    }


                } else {
                    that.ideView().instance().messages().add(sketch);
                }
            });
        });

        this.respondsTo("setActiveMenuItem", function (elt) {
            var project = this.ideView().instance().project();
            if (project !== undefined) {
                $("#"+project.url().match(/\/(.*)\.json/)[1])
                    .removeClass("active")
                    .addClass("inactive");
            }
            $(elt).addClass("active").removeClass("inactive");
            this.ideView().instance().project(new Project($(elt).find("a").attr("href")));
            //this.ideView().toggleEditorAndDirectory();
        });

        this.respondsTo("setUpEmptyDirectory", function () {
            $("#IDE-editor_button").unbind("click");
            $("#IDE-title").html("&nbsp;");
            if (!$("#new_sketch_input").is(":visible")) {
                $("#new_sketch_button").trigger("click");
            }
        });
    });

    ns.views.DirectoryView = DirectoryView;
});
