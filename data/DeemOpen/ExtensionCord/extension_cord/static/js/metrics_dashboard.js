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
var resultsPlot = {
    XAXIS_TICK_INTERVAL: '1 week',
    options : {
            title:{
                text:"Total Executions"
            },
            // uncomment next line for some pretty animations!
            // animate: !$.jqplot.use_excanvas,
            series:[
                { label:"Total Tests Executed", color:"#00ff01", markerOptions:{style:'filledSquare'} },
            ],

            axes:{
                xaxis:{
                    renderer:$.jqplot.DateAxisRenderer,
                    tickOptions:{formatString:'%b %#d, %y'},
                },
                yaxis:{
                    label:'Count',
                    min:0,
                 },
            },

            legend:{
                show:true,
                placement:'outside',
            },

            highlighter:{
                show:true,
                sizeAdjust:7.5,
                formatString:'%s: %2$d'
            },
            cursor:{
                show:false
            }
    },
    createGraph: function (total_results) {
        if (total_results.length === 0){
            total_results = [[null]];
        }

        //this.setJqplotOptions(total_results);
        $.jqplot("plot", [total_results], this.options);
    },
    setJqplotOptions: function(total_results){

        this.options.axes.xaxis.tickInterval = this.XAXIS_TICK_INTERVAL;

    },
    setYAxisTickInterval: function(elementCount){

        if (elementCount < 10){
            this.options.axes.yaxis.tickInterval = 1;

        } else if (elementCount > 10 && elementCount < 100){
            this.options.axes.yaxis.tickInterval = 10;

        } else if (elementCount > 100 && elementCount < 1000){
            this.options.axes.yaxis.tickInterval = 50;

        } else if (elementCount > 1000){
            this.options.axes.yaxis.tickInterval = 500;
        }
    }
}

$(document).ready(function () {
    var plot = Object.create(resultsPlot);
    plot.createGraph(total_results);
})
