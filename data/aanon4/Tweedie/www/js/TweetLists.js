var TweetLists = Class(
{
  constructor: function(account)
  {
    account.tweetLists = this;
    this._account = account;
    this.screenname = account.userInfo ? "@" + account.userInfo.screen_name : "@...";
    this.createDefaultList();
    this._lgrid = grid.get();

    this._types =
    {
      tweets: new IndexedModelSet({ key: "id", limit: 2000 }),
      mentions: new IndexedModelSet({ key: "id", limit: 200 }),
      dms: new IndexedModelSet({ key: "id", limit: 500 }),
      favs: new IndexedModelSet({ key: "id", limit: 500 }),
      retweeted: new IndexedModelSet({ key: "id", limit: 200 }),
      searches: new IndexedModelSet({ key: "id", limit: 2000 }),
    };
  },

  createDefaultList: function()
  {
    var main = new FilteredTweetsModel({ account: this._account, title: "Main", canRemove: false, name: "main", uuid: "00000000-0000-0000-0000-000000000001" });
    var photos = new FilteredTweetsModel({ account: this._account, title: "Media", canRemove: false, uuid: "00000000-0000-0000-0000-000000000002", viz: "media" });
    var fav = new FilteredTweetsModel({ account: this._account, title: "Favorites", canRemoved: false, uuid: "00000000-0000-0000-0000-000000000003" });
    var dms = new FilteredTweetsModel({ account: this._account, title: "Messages", canRemoved: false, uuid: "00000000-0000-0000-0000-000000000004", viz: "stack" });
    var mentions = new FilteredTweetsModel({ account: this._account, title: "Mentions", canRemoved: false, uuid: "00000000-0000-0000-0000-000000000005" });
    var retweeteds = new FilteredTweetsModel({ account: this._account, title: "Retweeted", canRemoved: false, uuid: "00000000-0000-0000-0000-000000000006" });

    main.addIncludeTag(Tweet.TweetTag);
    main.addIncludeTag(Tweet.RetweetTag);
    main.addExcludeTag(Tweet.FavoriteTag);
    photos.addIncludeTag(Tweet.PhotoTag);
    photos.addIncludeTag(Tweet.VideoTag);
    fav.addIncludeTag(Tweet.FavoriteTag);
    dms.addIncludeTag(Tweet.DMTag);
    mentions.addIncludeTag(Tweet.MentionTag);
    retweeteds.addIncludeTag(Tweet.RetweetedTag);

    this.lists = new ModelSet({
      models:
      [
        main,
        mentions,
        retweeteds,
        fav,
        dms,
        photos,
      ]
    });
  },

  getAllTweets: function(includeSearch)
  {
    var tweets = [];
    for (var type in this._types)
    {
      if (includeSearch || type !== "searches")
      {
        tweets = tweets.concat(this._types[type].models);
      }
    }
    tweets.sort(Tweet.compareTweets);
    return tweets;
  },

  createList: function(name, refilter)
  {
    var list = new FilteredTweetsModel({ account: this._account, title: name, uuid: xo.Uuid.create(), canEdit: true, canRemove: true });
    if (refilter)
    {
      this._refilter(list);
    }
    var last = list.tweets().models[0];
    list.lastRead(last && last.id());
    this.lists.append(list);
    this._save();
    list.restore(true);
    return list;
  },

  removeList: function(list)
  {
    if (list.canRemove())
    {
      this.lists.remove(list);
      list.remove();
      this._save();
    }
  },

  renameList: function(list, newName)
  {
    if (this.hasList(newName))
    {
      return false;
    }
    if (list.title() === newName)
    {
      return true;
    }
    list.title(newName);
    list._save();
    this._save();
  },

  hasList: function(name)
  {
    this.lists.forEach(function(list)
    {
      if (list.title() === name)
      {
        return true;
      }
    });
    return false;
  },

  addIncludeTag: function(list, tag)
  {
    list.addIncludeTag(tag);
    this._refilter(list);
  },

  addExcludeTag: function(list, tag)
  {
    list.addExcludeTag(tag)
  },

  removeIncludeTag: function(list, tag)
  {
    list.removeIncludeTag(tag);
    if (list.includeTags()[0].tag.key === "all")
    {
      this._refilter(list);
    }
  },

  removeExcludeTag: function(list, tag)
  {
    list.removeExcludeTag(tag);
    this._refilter(list);
  },

  changeType: function(list, type)
  {
    if (list.type(type) !== type)
    {
      this._refilter(list);
    }
  },

  changeViz: function(list, type)
  {
    list.viz(type);
  },

  _refilter: function(list)
  {
    Log.time("_refilter");
    var listtweets = list.tweets();
    listtweets.removeAll();
    if (!list.isSearch())
    {
      listtweets.append(this.getAllTweets(false));
    }
    Log.timeEnd("_refilter");
  },

  _separateTweets: function(tweets)
  {
    var all = [];
    var include = [];
    var exclude = [];
    var urls = [];
    var tweet = null;
    tweets.forEach(function(twt)
    {
      var id = twt.id_str;
      var ntweet = this.getTweet(id);
      if (!ntweet)
      {
        if (tweet && id === tweet.id())
        {
          if (twt.retweeted_of_me)
          {
            tweet.retweeted_of_me(true);
          }
        }
        else
        {
          tweet = new Tweet(twt, this._account, true);
          lasttweet = tweet;
          if (tweet.is_retweet())
          {
            var retweet = tweet.retweet();
            urls = urls.concat(retweet.urls());
            if (retweet.is_my_tweet())
            {
              tweet.retweeted_of_me(true);
            }
          }
          else
          {
            urls = urls.concat(tweet.urls());
          }
          include.push(tweet);
          all.push(tweet);
        }
      }
      else
      {
        tweet = ntweet;
        if (twt.retweeted_of_me)
        {
          tweet.retweeted_of_me(true);
        }
        exclude.push(tweet);
        all.push(tweet);
      }
    }, this);
    return { all: all, include: include, exclude: exclude, urls: urls };
  },

  _expandTweets: function(tweets)
  {
    var include = tweets.include;
    if (!include.length)
    {
      return 0;
    }
    return Co.Routine(this,
      function()
      {
        return this._account.expandUrls(tweets.urls);
      },
      function(oembeds)
      {
        oembeds = oembeds();
        include.forEach(function(tweet)
        {
          if (tweet.is_retweet())
          {
            tweet.retweet().oembeds(oembeds);
          }
          else
          {
            tweet.oembeds(oembeds);
          }
        });
        return include.length;
      }
    );
  },

  _addTweets: function(tweets)
  {
    var include = tweets.include;
    if (!include.length)
    {
      return 0;
    }
    return Co.Routine(this,
      function()
      {
        return this._expandTweets(tweets);
      },
      function()
      {
        var tweetb = [];
        var mentionb = [];
        var dmb = [];
        var favb = [];
        var retweetedb = [];

        include.forEach(function(tweet)
        {
          if (tweet.isDM())
          {
            dmb.push(tweet);
          }
          else if (tweet.favorited())
          {
            favb.push(tweet);
          }
          else if (tweet.isMention())
          {
            mentionb.push(tweet);
          }
          else if (tweet.retweeted_of_me())
          {
            retweetedb.push(tweet);
          }
          else
          {
            tweetb.push(tweet);
          }
        });

        tweetb.length && this._types.tweets.prepend(tweetb);
        mentionb.length && this._types.mentions.prepend(mentionb);
        dmb.length && this._types.dms.prepend(dmb);
        favb.length && this._types.favs.prepend(favb);
        retweetedb.length && this._types.retweeted.prepend(retweetedb);
        this._save();

        var o = this._getVelocity();
        this.lists.forEach(function(list)
        {
          if (!list.isSearch())
          {
            list.addTweets(include);
            list.recalcVelocity(o);
          }
        });

        return include.length;
      }
    );
  },

  addTweets: function(tweets)
  {
    return this._addTweets(this._separateTweets(tweets));
  },

  removeTweets: function(ids)
  {
    var o = this._getVelocity();
    this.lists.forEach(function(list)
    {
      if (!list.isSearch())
      {
        list.removeTweets(ids);
        list.recalcVelocity(o);
      }
    });
  },

  addSearch: function(tweets)
  {
    tweets = this._separateTweets(tweets);
    var include = tweets.include;
    if (include.length)
    {
      return Co.Routine(this,
        function()
        {
          return this._expandTweets(tweets);
        },
        function()
        {
          this._types.searches.prepend(include);

          var o = this._getVelocity();
          this.lists.forEach(function(list)
          {
            if (list.isSearch())
            {
              list.addTweets(include);
              list.recalcVelocity(o);
            }
          });

          return include.length;
        }
      );
    }
    else
    {
      return 0;
    }
  },

  favTweets: function(tweets)
  {
    var tweets = this._separateTweets(tweets);
    tweets.include.forEach(function(tweet)
    {
      tweet.favorited(true);
    });
    tweets.exclude.forEach(function(tweet)
    {
      tweet.favorited(true);
      tweets.include.push(tweet);
    });
    return this._addTweets(tweets);
  },

  unfavTweets: function(tweets)
  {
    var tweets = this._separateTweets(tweets);
    tweets.exclude.forEach(function(tweet)
    {
      tweet.favorited(false);
    });
  },

  _getVelocity: function()
  {
    return {
      maxLength: 1000
    }
  },

  getTweet: function(id)
  {
    for (var type in this._types)
    {
      var tweet = this._types[type].findByProperty("id", id);
      if (tweet)
      {
        return tweet;
      }
    }
    return null;
  },

  _save: function()
  {
    var lists = [];
    this.lists.forEach(function(list)
    {
      if (list.canRemove())
      {
        lists.push({ title: list.title(), uuid: list.uuid() });
      }
    });
    var saves =
    {
      lists: lists
    };
    for (var type in this._types)
    {
      saves[type] = this._types[type].serialize();
    }

    return this._account.preferences.setAccountSet(saves);
  },

  restore: function()
  {
    var all;
    return Co.Routine(this,
      function(r)
      {
        return this._account.preferences.getAccountSet();
      },
      function(r)
      {
        all = r();
        all.lists && all.lists.forEach(function(listinfo)
        {
          this.lists.append(new FilteredTweetsModel({ account: this._account, title: listinfo.title, uuid: listinfo.uuid, canRemove: true }));
        }, this);

        Co.Yield(); // Let it paint
      },
      function()
      {
        var seen = {};
        for (var type in this._types)
        {
          (all[type] || []).forEach(function(tweet)
          {
            var id = tweet.id_str;
            this._types[type].append(seen[id] || (seen[id] = new Tweet(tweet, this._account, false)));
          }, this);
        }

        return Co.Foreach(this, this.lists.models,
          function(list)
          {
            list = list();
            return Co.Routine(this,
              function()
              {
                return list.restore();
              },
              function(refresh)
              {
                if (refresh())
                {
                  Log.info("refresh: " + list.uuid());
                  this._refilter(list);
                  list.updateUnreadAndVelocity();
                  list._save();
                }
                return true;
              }
            );
          }
        );
      },
      function()
      {
        this._account.preferences.on("listsChange", function()
        {
          this._refresh();
        }, this);
        this._account.preferences.on("listChange", function(evt, info)
        {
          var lists = this.lists.models;
          for (var i = lists.length - 1; i >= 0; i--)
          {
            var list = lists[i];
            if (list.uuid() === info.uuid)
            {
              Co.Routine(this,
                function()
                {
                  return list.refresh();
                },
                function()
                {
                  this._refilter(list);
                  list.updateUnreadAndVelocity();
                }
              );
              break;
            }
          }
        }, this);
        return true;
      }
    );
  },

  _refresh: function()
  {
    var oldLists = this.lists.models;
    var newLists;
    return Co.Routine(this,
      function(r)
      {
        return this._account.preferences.getAccountSet();
      },
      function(r)
      {
        newLists = r().lists;

        var diff =
        {
          add: [],
          remove: []
        };
        newLists.forEach(function(listinfo)
        {
          for (var i = oldLists.length - 1; i >= 0; i--)
          {
            if (oldLists[i].uuid() === listinfo.uuid)
            {
              return;
            }
          }
          diff.add.push(new FilteredTweetsModel({ account: this._account, title: listinfo.title, uuid: listinfo.uuid, canRemove: true }));
        }, this);
        oldLists.forEach(function(list)
        {
          for (var i = newLists.length - 1; i >= 0; i--)
          {
            if (newLists[i].uuid === list.uuid() || !list.canRemove())
            {
              return;
            }
          }
          diff.remove.push(list);
        }, this);
        diff.add.forEach(function(list)
        {
          this.lists.append(list);
          list.refresh();
          if (!list.isSearch())
          {
            this._refilter(list);
          }
        }, this);
        diff.remove.forEach(function(list)
        {
          this.lists.remove(list);
          list.remove();
        }, this);
        return true;
      }
    );
  }
});
