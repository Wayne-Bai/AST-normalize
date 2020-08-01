function main()
{
  Log.start();
  document.addEventListener("resume", function()
  {
    Log.start();
  });
  document.addEventListener("pause", function()
  {
    Log.stop();
  });

  var RootModel = Model.create(
  {
    account: Model.Property,
    current_list: Model.Property,
    lists: Model.Property,
    name: function()
    {
      return this.account().tweetLists.screenname.slice(1);
    },
    filter: Model.Property
  });

  var lgrid = grid.get();

  var account = new Account();

  models = new RootModel(
  {
    account: account,
    current_list: account.tweetLists.lists.models[0],
    lists: account.tweetLists.lists,
    filter: ""
  });

  account.on("screenNameChange", function()
  {
    models.emit("update");
  });

  var listCtrl = new ListController();

  var root = new RootView(
  {
    node: document.getElementById("root"),
    template: __resources.main,
    partials: __resources,
    model: models,
    properties:
    {
      open: true,
      include_children: true,
      include_tags: true,
      include_media: true,
      include_replies: true
    },
    controllers:
    [
      new TweetController(),
      listCtrl,
      new FilterController(),
      new GlobalController(),
      new AccountController()
    ]
  });

  listCtrl.open();
  
  Co.Forever(this,
    function()
    {
      var rel = {};
      var times = document.querySelectorAll("[data-timestamp]");
      for (var i = times.length - 1; i >= 0; i--)
      {
        var time = times[i];
        var since = Tweet.tweetTime(time.dataset.timestamp, rel);
        time.innerText = since;
        if (!rel.relative)
        {
          delete time.dataset.timestamp;
        }
      }
      return Co.Sleep(10);
    }
  );

  Co.Routine(this,
    function()
    {
      return lgrid.read("/accounts");
    },
    function(info)
    {
      if (info())
      {
        account.on("opened", splash);
        account.open();
      }
      else
      {
        // Welcome
        splash();
        new ModalView(
        {
          node: document.getElementById("root-dialog"),
          template: __resources.welcome,
          partials: __resources,
          model: {},
          clickToClose: false,
          controller:
          {
            onStart: function(m, v)
            {
              v.close();
              account.open();
            }
          }
        });
      }
    }
  );

  Co.Routine(this,
    function()
    {
      return Co.Sleep(5);
    },
    function()
    {
      splash();
    }
  );
}

function splash()
{
  navigator.splashscreen && navigator.splashscreen.hide();
}
