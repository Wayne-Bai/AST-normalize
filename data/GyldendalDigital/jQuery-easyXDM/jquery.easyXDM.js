/*
 * https://github.com/GyldendalDigital/jQuery-easyXDM
 */

(function ($) {
  var jquery_easyXDM = {};
  var global = this;
  // Used pattern from http://backtothefront.net/2012/asynchronous-singleton-api/
  // for thread safe single instance easyXDM instantiation.
  var state = "before";
  var callbackQueue = [];
  var easyXDM_connection = null;
  var error = null;
  // Allow forced usage and debugging of easyXDM by adding jquery.easyXDM.debug=true as parameter
  // to the page that uses this plugin.
  var easyXDM_debug = false;
  if (/jquery\.easyXDM\.debug=true/.test(String(window.location))) {
    easyXDM_debug = true;
  }
  if (easyXDM_debug) {
    if ($("#log").length == 0)
       $("body").append("<div id=\"log\"></div>");
  }

  var doRequests = function (provider_base_url,callbacks) {
    if (!$.support.cors || easyXDM_debug) {
      var easyXDM_url = provider_base_url + "/easyXDM/easyXDM.min.js";
      if (easyXDM_debug) {
        easyXDM_url = provider_base_url + "/easyXDM/easyXDM.debug.js"
      }
      function continue_after_easyXDM_load() {
        // Use noConflict to release any global state, to avoid conflict with
        // other easyXDM instances in the window of this page.
        var scoped_easyXDM = easyXDM.noConflict("jquery_easyXDM");
        // Make the scoped easyXDM available as a unique global name, that can
        // be found from the easyXDM provider, and must match the noConflict
        // name in the provider.
        jquery_easyXDM.easyXDM = scoped_easyXDM;
        var remote_url = provider_base_url + "/javascripts/jquery.easyXDM.provider.html";
        var container = $("#jquery_easyXDM_provider_container")[0] || null;
        if (easyXDM_debug) {
          remote_url += "?jquery.easyXDM.debug=true"
          if (!container)
            container = $("<div id=\"jquery_easyXDM_provider_container\"></div>").appendTo($("body"))[0];
        }
        easyXDM_connection = new scoped_easyXDM.Rpc(
          {
            remote:remote_url,
            swf:provider_base_url + "/easyXDM/easyxdm.swf",
            container: container,
            onReady:function() { callbacks.success(easyXDM_connection); }
          },
          { remote:{ jquery_proxy:{} } });
      }

      $.getScript(easyXDM_url, function () {
        // Load a json implementation if needed by old browsers
        // Avoid easyXDM helper that returns before the script is loaded.
        if (!(typeof(window["JSON"]) == 'object' && window["JSON"])) {
          $.getScript(provider_base_url + "/easyXDM/json2.js", continue_after_easyXDM_load);
        } else {
          continue_after_easyXDM_load();
        }
      });
    }
  };

  jquery_easyXDM.getConnection = function (provider_base_url,callbacks) {
    switch (state) {
      case "before":
        state = "working";
        callbackQueue.push(callbacks);
        doRequests(provider_base_url,{
          success:function (singletonInstance) {
            state = "success";
            easyXDM_connection = singletonInstance;
            for (var i = 0; i < callbackQueue.length; i++) {
              callbackQueue[i].success(easyXDM_connection);
            }
            callbackQueue = [];
          },
          failure:function (errorObj) {
            state = "failure";
            error = errorObj;
            for (var i = 0; i < callbackQueue.length; i++) {
              callbackQueue[i].failure(error);
            }
            callbackQueue = [];
          }
        });
        break;
      case "working":
        callbackQueue.push(callbacks);
        break;
      case "success":
        callbacks.success(easyXDM_connection);
        break;
      case "failure":
        callbacks.failure(error);
        break;
      default:
        throw new Error("Invalid state: " + state)
    }
  };

  $.ajaxTransport("+*",function (options, originalOptions, jqXHR) {
    if ( options.crossDomain && (!$.support.cors || easyXDM_debug) ) {
      // Assume a relative url as fallback, even if it is senseless, it may be used for testing.
      var provider_base_url = "";
      // Each CORS enabled provider must have a unique connection, therefore
      // generate a name from the provider_base_url as an index.
      var regexp_results = options.url.match(/^(https?:\/\/[^\/]*)\/?.*/);
      if(regexp_results){
       provider_base_url = regexp_results[1];
      };
      return {
        send :function (headers, completeCallback) {
          jquery_easyXDM.getConnection(provider_base_url,{
            success:function (easyXDM_connection) {
              function continuation_proxy(results) {
                completeCallback(results.status, results.statusText, results.responses, results.headers);
              }
              originalOptions.context = null;
              easyXDM_connection.jquery_proxy(originalOptions, continuation_proxy);
            },
            error:function () {
              // Unable to get easyXDM connection
            }
          });
        },
        abort:function () {
        }
      };
    }
  });

  global.jquery_easyXDM = jquery_easyXDM;
})(jQuery);
