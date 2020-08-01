var ListController = xo.Controller.create(
{
  constructor: function(__super)
  {
    __super();
    var self = this;
    document.addEventListener("click", function()
    {
      self._editList(null, null);
    });
  },

  metrics:
  {
    category: "lists"
  },

  open: function()
  {
    this._selectedListView = RootView.getViewByName("main");
    this._selectedListView.property("selected", true);
  },

  onSelectList: function(m, v, _, models)
  {
    if (models.current_list() === m)
    {
      RootView.getViewByName("tweets").scrollToTop();
    }

    models.filter("");
    document.getElementById("filter").value = "";
    RootView.getViewByName("tweets").filterText("");

    models.current_list(m);
    m.markAllAsRead();
    this._editList(null, null);
    if (this._selectedListView)
    {
      this._selectedListView.property("selected", false);
      this._selectedListView = null;
    }
    this._selectedListView = v;
    this._selectedListView.property("selected", true);

    this.metric(m.isSearch() ? "select:search" : "select:list");
  },

  onDropToList: function(m, v, _, models)
  {
    this.metric("include:add_to_other")
    models.account().tweetLists.addIncludeTag(m, v.dropped());
  },

  onDropToNewList: function(m, v, _, models)
  {
    this.metric("new:drop");
    var listName = v.dropped().title;
    switch (v.dropped().type)
    {
      case "hashtag":
      case "somewhere":
        listName += "?";
        break;
      default:
        break;
    }
    var list = models.account().tweetLists.createList(listName, false);
    if (list && !list.isSearch())
    {
      models.account().tweetLists.addIncludeTag(list, v.dropped());
    }
  },

  onNewList: function(m, v, e, models)
  {
    this.metric("new:type");
    var listName = e.target.value;
    if (listName)
    {
      models.account().tweetLists.createList(listName, true);
    }
    e.target.value = "";
  },

  onEditList: function(_, v, _, models)
  {
    this.metric("edit");
    this._editList(v, models);
  },

  onRemoveList: function(_, _, _, models)
  {
    this.metric("remove");
    models.account().tweetLists.removeList(models.current_list());
    this._editList(null, null);
    models.current_list(models.account().tweetLists.lists.models[0]);
    this._selectedListView = RootView.getViewByName("main");
    this._selectedListView.property("selected", true);
  },

  onDropInclude: function(_, v, _, models)
  {
    this.metric("include:add");
    models.account().tweetLists.addIncludeTag(models.current_list(), v.dropped());
  },

  onDropExclude: function(_, v, _, models)
  {
    this.metric("exclude:add");
    models.account().tweetLists.addExcludeTag(models.current_list(), v.dropped());
  },

  onKillInclude: function(m, _, _, models)
  {
    if (this._editView && this._editView.property("editMode"))
    {
      this.metric("include:remove");
      models.account().tweetLists.removeIncludeTag(models.current_list(), m);
    }
  },

  onKillExclude: function(m, _, _, models)
  {
    if (this._editView && this._editView.property("editMode"))
    {
      this.metric("exclude:remove");
      models.account().tweetLists.removeExcludeTag(models.current_list(), m);
    }
  },

  onChangeViz: function(_, _, e, models)
  {
    this.metric("viz:change");
    models.account().tweetLists.changeViz(models.current_list(), e.target.value);
  },

  _editList: function(v, models)
  {
    if (this._editView)
    {
      this._editModels.account().tweetLists._save();
      this._editModels.current_list()._save();
      this._editView.property("editMode", false);
      this._editView = null;
      this._editModels = null;
    }
    if (v)
    {
      this._editView = v;
      this._editView.property("editMode", true);
      this._editModels = models;
    }
  }
});
