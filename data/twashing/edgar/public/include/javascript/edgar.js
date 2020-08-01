goog.provide('edgar');
goog.require('cljs.core');
goog.require('jayq.core');
goog.require('ui.components');
goog.require('ui.graph');
goog.require('server.handler');
goog.require('cljs.reader');
goog.require('jayq.core');
goog.require('jayq.core');
edgar.live_graph_not_empty_QMARK_ = (function live_graph_not_empty_QMARK_(){
var and__3949__auto__ = !((jayq.core.$.call(null,"#live-stock-graph").highcharts("StockChart") == null));
if(and__3949__auto__)
{return !((jayq.core.$.call(null,"#live-stock-graph").highcharts("StockChart").title == null));
} else
{return and__3949__auto__;
}
});
edgar.live_graph_has_stock_QMARK_ = (function live_graph_has_stock_QMARK_(stock_name){
return cljs.core._EQ_.call(null,stock_name,jayq.core.$.call(null,"#live-stock-graph").highcharts("StockChart").title.text);
});
edgar.livesource = (new window.EventSource("/get-streaming-stock-data"));
edgar.livesource.addEventListener("stream-live",(function (e){
var result_data = cljs.reader.read_string.call(null,e.data);
var parsed_result_map = server.handler.parse_result_data.call(null,result_data);
var increment_QMARK_ = (function (){var and__3949__auto__ = edgar.live_graph_not_empty_QMARK_.call(null);
if(cljs.core.truth_(and__3949__auto__))
{return edgar.live_graph_has_stock_QMARK_.call(null,(new cljs.core.Keyword("\uFDD0'stock-name")).call(null,parsed_result_map));
} else
{return and__3949__auto__;
}
})();
if(cljs.core.truth_((function (){var and__3949__auto__ = edgar.live_graph_not_empty_QMARK_.call(null);
if(cljs.core.truth_(and__3949__auto__))
{return cljs.core.not.call(null,edgar.live_graph_has_stock_QMARK_.call(null,(new cljs.core.Keyword("\uFDD0'stock-name")).call(null,parsed_result_map)));
} else
{return and__3949__auto__;
}
})()))
{return null;
} else
{return ui.graph.render_stock_graph.call(null,"#live-stock-graph",cljs.core.PersistentVector.fromArray([(new cljs.core.Keyword("\uFDD0'bollinger-band")).call(null,parsed_result_map),(new cljs.core.Keyword("\uFDD0'local-list")).call(null,parsed_result_map),(new cljs.core.Keyword("\uFDD0'sma-list")).call(null,parsed_result_map),(new cljs.core.Keyword("\uFDD0'ema-list")).call(null,parsed_result_map),(new cljs.core.Keyword("\uFDD0'macd-price-list")).call(null,parsed_result_map),(new cljs.core.Keyword("\uFDD0'macd-signal-list")).call(null,parsed_result_map),(new cljs.core.Keyword("\uFDD0'macd-histogram-list")).call(null,parsed_result_map),(new cljs.core.Keyword("\uFDD0'stochastic-k")).call(null,parsed_result_map),(new cljs.core.Keyword("\uFDD0'stochastic-d")).call(null,parsed_result_map),(new cljs.core.Keyword("\uFDD0'obv")).call(null,parsed_result_map)], true),(new cljs.core.Keyword("\uFDD0'signals")).call(null,parsed_result_map),(new cljs.core.Keyword("\uFDD0'strategies")).call(null,parsed_result_map),(new cljs.core.Keyword("\uFDD0'stock-name")).call(null,parsed_result_map),increment_QMARK_);
}
}));
jayq.core.$.call(null,"#freeform-live").click((function (eventObj){
var input_val = jayq.core.$.call(null,"#freeform-live-input").val();
console.log("... here[",eventObj,"] / input[",input_val,"]");
if(!(cljs.core.empty_QMARK_.call(null,input_val)))
{return $.post.call(null,[cljs.core.str("/get-streaming-stock-data?stock-selection="),cljs.core.str(input_val),cljs.core.str("&stock-name="),cljs.core.str(input_val)].join(''),(function (data){
return console.log([cljs.core.str("POST:: get-streaming-stock-data > data["),cljs.core.str(data),cljs.core.str("]")].join(''));
}));
} else
{return null;
}
}));
