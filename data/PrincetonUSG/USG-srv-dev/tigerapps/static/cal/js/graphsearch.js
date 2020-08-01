GS = {};

$.fn.graphsearch = function(opts) {
    GS.whole = this;
    this.append('<form><div class="evfilter-gs"></div><input title="Feature coming soon..." class="evfilter-gs" type="text" disabled="disabled"></form>');
    GS.div = this.find('div');
    GS.gs = this.find('input');
    GS.div.button().removeClass('ui-corner-all').addClass('ui-corner-left');
    GS.gs.button().removeClass('ui-corner-all').addClass('ui-corner-right');
    GS.divspan = this.find('div span');


    var showAutocomplete = function(inds) {
      console.log(inds);
        /* need to clear autocomplete first */
showActiveField(GS.rels[inds[0]], GS.search[inds[1]]);

/*
        for (var i in inds) {
            showAutocompleteField(GS.rels(inds[i]), GS.search(inds[i]));
        }
*/
    }

    var showAutocompleteField = function(field, name) {
        /*
this.click(showActiveField(....));
*/
    }

    /* given (field type, id to send back to server, image) */
    var showActiveField = function(field, name) {
        var type = field[0];
        var serverId = field[1];
        
        if (type == 0) {   /* all */
            GS.divspan.html('<img src="/static/cal/img/gs-allevents.png"/>');
            GS.activeType = null;
            GS.gs.val('All Events');
        }
        else if (type == 1) {   /* tag */
            GS.divspan.html('');
            GS.activeType = "tag";
            GS.gs.val('Events tagged ' + name);
        }
        else if (type == 2) {   /* feature */
            GS.divspan.html('<img src="/static/cal/'+field[2]+'"/>');
            GS.activeType = "feat";
            GS.gs.val('Events featuring ' + name);
        }
        else if (type == 3) {   /* creator */
            GS.divspan.html('');
            GS.activeType = "creator";
            GS.gs.val('Events created by ' + name);
        }
        
        GS.activeId = serverId;
    }

    var requestClickedField = function() {
    }



    showActiveField(opts.field, opts.name);
    
    /* click in + out effects */
    GS.gs.focusin(function() {
        var prev = GS.gs.val();
        GS.gs.val('');
        GS.gs.focusout(function() {
            GS.gs.val(prev);
        });
    });

    $.ajax({
      url:"/ajax/graphsearch/",
      dataType:"JSON",
      success: function (data) {
          GS.rels = data.rels;
          GS.search = data.search;
      }
    });
    
    GS.gs.keyup(function() {
      var results = getPrefMatch($(this).val(), GS.search);
      showAutocomplete(results);
    });
}



function getPrefMatch(prefix, list) {
    var new_list = [];
    var re = new RegExp("^" + prefix, "i");

    // get string matches
    for (var i = 0; i < list.length; i++) {
        if (re.test(list[i][0])) {
            new_list.push([i, list[i][1]]);
        }
    }
    
    // sort by count
    new_list.sort(function(a,b){
        return b[1] - a[1];
    });

    // extract 1st column
    var index_list = [];
    for (var i = 0; i < new_list.length; i++) {
        index_list.push(new_list[i][0]);
    }

    return index_list;
}

