/*
* graphs.js
*
* @author   Sam Liu <sam@ambushnetworks.com>
* @desc     Internal
* @depends  Jquery
* @notes    Results output to div id "result", graphs
*           draw to "container," all other messages
*           go to "error."
*
*/

function show_loading(){
    //Clear the display divs and show loading gif
    $('#result').html("<div id='loading' style='margin:0 auto; padding-top:20px;'><center><span style='font-weight:200; font-size:200%;'>Loading...</span><br/><img height='32' width='32' src='images/loading.gif' alt='' /></center></div>");
    $('#errors').html("");
    $('#container').html("");
}

function hide_loading(){
    //Hide loading div after page loads
    $('#loading').html("")
}

function sortPairs(a,b){
    //Sort function for array -- used in determining top mochitests
    if(a[0] > b[0]){
        return -1;
    }
    return 1;
}
function rmDupPairs(arr) {
    //Remove duplicates from sorted tuple array (specific to show_mochitests)
    var i;
    len=arr.length;
    out=[];
    obj={};

    //Mark hash table
    for (i=0;i<len;i++) {
        obj[arr[i][1]]=0;
    }

    //Skip over things that are marked duplicate in the hash table
    for (i in arr) {
        if (obj[arr[i][1]] == 0){
            obj[arr[i][1]] = 1;
            out.push(arr[i]);
        }
    }
    return out;
}

function ISODateString(d){
    //Get ISO Date from UTC Date
    function pad(n){return n<10 ? '0'+n : n}
    return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate());
}
function basename(path) {
    //Gets basename of a path
    return path.replace(/\\/g,'/').replace( /.*\//, '' );
}

function divide(dividend, divisor){
    //Division function that allows division by zero (returns zero)
    quotient = dividend/divisor;
    if(isFinite(quotient)){
        return quotient;
    }
    return 0;
}

function to_hours(value){
    //Convert a time from seconds to hours to two decimal places
    return Math.round(value * 100 / 60 / 60) / 100;
}

//Each function below represents a graph to be displayed

function show_turnaround(){
    //Build and Test Turnaround Dashboard
    show_loading(); //Show loading div to keep user happy

    //Request data from api/turnaround and do stuff
    $.getJSON('api/turnaround', function(data) {
        graph_data = [];

        //Group data by OS
        for (os in data){

            //Save each series into a set for display on the chart
            series = {};
            series.name = os;
            series.data = []
            for(x in data[os]){
                //Split apart timestamps for conversion into UTC time for chart
                parseDate = x.split("-");
                year = parseDate[0];
                month = parseDate[1] - 1; //Javascript months index from 0 instead of 1
                day = parseDate[2];

                //Calculate datapoint display value
                dbg_total = divide(data[os][x]["dbg_build"],data[os][x]["dbg_build_counter"]) + divide(data[os][x]["dbg_test"],data[os][x]["dbg_test_counter"]);
                opt_total = divide(data[os][x]["opt_build"],data[os][x]["opt_build_counter"]) + divide(data[os][x]["opt_test"],data[os][x]["opt_test_counter"]);
                value = Math.max(dbg_total,opt_total);

                if (!isNaN(value)){
                    //Convert from seconds to hours
                    value = to_hours(value);

                    //Form datapoint
                    datapoint = [Date.UTC(year, month, day), value];

                    //Push datapoint to the series
                    series['data'].push(datapoint);
                }else{
                    /*
                        DEBUG.
                        IT SHOULD NEVER GET HERE.
                    */
                    $("#errors").append("Datapoint Date: " + x+"<br/>=======================<br/>");
                    $("#errors").append("dbg build: " + data[os][x]["dbg_build"]+"<br/>");
                    $("#errors").append("" + data[os][x]["dbg_build_counter"]+"<br/>");
                    $("#errors").append("dbg test: " + data[os][x]["dbg_test"]+"<br/>");
                    $("#errors").append("" + data[os][x]["dbg_test_counter"]+"<br/>");
                    $("#errors").append("opt build: " + data[os][x]["opt_build"]+"<br/>");
                    $("#errors").append("" + data[os][x]["opt_build_counter"]+"<br/>");
                    $("#errors").append("opt test: " + data[os][x]["opt_test"]+"<br/>");
                    $("#errors").append("" + data[os][x]["opt_test_counter"]+"<br/><br/>");
                }

            }
            //Push each completed series to the overall dataset
            graph_data.push(series);
        }
        //Loading is complete!
        hide_loading();

        //Begin Line Chart
        var chart;
        jQuery(document).ready(function() {
            chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'container',
                    type: 'spline'
                },
                title: {
                    text: 'Go Faster! - Build and Test Turnaround'
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        month: '%b %e',
                        year: '%Y'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Average Turnaround Time (Hours)'
                    },
                    min: 0
                },
                tooltip: {
                    formatter: function() {
                            return '<b>'+ this.series.name +'</b><br/>'+
                            Highcharts.dateFormat('%b %e, %Y', this.x) +': '+ this.y +' hours';
                    }
                },
                series: graph_data
            });
        });
        //End Line Chart
    }); //End $.getJSON
}

function show_executiontime(params_type){
    //Build and Test Execution Dashboard
    show_loading(); //Show loading div to keep user happy

    //Request data from api/turnaround and do stuff
    if(params_type){
        resourceURL = 'api/executiontime?type='+params_type;
        graph_title = "Average execution times for "+params_type;
    }else{
        resourceURL = 'api/waittime';
        graph_title = "Combined average execution times for build and test";
    }
    $.getJSON(resourceURL, function(data) {
        graph_data = [];

        //Group data by OS
        for (os in data){
            //Save each series into a set for display on the chart
            series = {};
            series.name = os;
            series.data = []
            for(x in data[os]){
                //Split apart timestamps for conversion into UTC time for chart
                parseDate = x.split("-");
                year = parseDate[0];
                month = parseDate[1] - 1; //Javascript months index from 0 instead of 1
                day = parseDate[2];

                //Calculate datapoint display value
                dbg_total = divide(data[os][x]["dbg_build"],data[os][x]["dbg_build_counter"]) + divide(data[os][x]["dbg_test"],data[os][x]["dbg_test_counter"]);
                opt_total = divide(data[os][x]["opt_build"],data[os][x]["opt_build_counter"]) + divide(data[os][x]["opt_test"],data[os][x]["opt_test_counter"]);
                value = Math.max(dbg_total,opt_total);

                if (!isNaN(value)){
                    //Convert from seconds to hours
                    value = to_hours(value);

                    //Form datapoint
                    datapoint = [Date.UTC(year, month, day), value];

                    //Push datapoint to the series
                    series['data'].push(datapoint);
                }else{
                    /*
                        DEBUG.
                        IT SHOULD NEVER GET HERE.
                    */
                    $("#errors").append("Datapoint Date: " + x+"<br/>=======================<br/>");
                    $("#errors").append("dbg build: " + data[os][x]["dbg_build"]+"<br/>");
                    $("#errors").append("" + data[os][x]["dbg_build_counter"]+"<br/>");
                    $("#errors").append("dbg test: " + data[os][x]["dbg_test"]+"<br/>");
                    $("#errors").append("" + data[os][x]["dbg_test_counter"]+"<br/>");
                    $("#errors").append("opt build: " + data[os][x]["opt_build"]+"<br/>");
                    $("#errors").append("" + data[os][x]["opt_build_counter"]+"<br/>");
                    $("#errors").append("opt test: " + data[os][x]["opt_test"]+"<br/>");
                    $("#errors").append("" + data[os][x]["opt_test_counter"]+"<br/><br/>");
                }

            }
            //Push each completed series to the overall dataset
            graph_data.push(series);
        }
        //Loading is complete!
        hide_loading();

        //Begin Line Chart
        var chart;
        jQuery(document).ready(function() {
            chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'container',
                    type: 'spline'
                },
                title: {
                    text: 'Go Faster! - '+graph_title
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        month: '%b %e',
                        year: '%Y'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Average Execution Time (Hours)'
                    },
                    min: 0
                },
                tooltip: {
                    formatter: function() {
                            return '<b>'+ this.series.name +'</b><br/>'+
                            Highcharts.dateFormat('%b %e, %Y', this.x) +': '+ this.y +' hours';
                    }
                },
                series: graph_data
            });
        });
        //End Line Chart
    }); //End $.getJSON
}

function show_waittime(params_type){
    //Build Wait Dashboard
    show_loading(); //Show loading div to keep user happy

    //Request data from api/turnaround and do stuff
    if(params_type){
        resourceURL = 'api/waittime?type='+params_type;
        graph_title = "Average wait times for "+params_type;
    }else{
        resourceURL = 'api/waittime';
        graph_title = "Combined average wait times for build and test";
    }
    $.getJSON(resourceURL, function(data) {
        graph_data = [];

        //Group data by OS
        for (os in data){
            //Save each series into a set for display on the chart
            series = {};
            series.name = os;
            series.data = []
            for(x in data[os]){
                //Split apart timestamps for conversion into UTC time for chart
                parseDate = x.split("-");
                year = parseDate[0];
                month = parseDate[1] - 1; //Javascript months index from 0 instead of 1
                day = parseDate[2];

                //Calculate datapoint display value
                dbg_total = divide(data[os][x]["dbg_build"],data[os][x]["dbg_build_counter"]) + divide(data[os][x]["dbg_test"],data[os][x]["dbg_test_counter"]);
                opt_total = divide(data[os][x]["opt_build"],data[os][x]["opt_build_counter"]) + divide(data[os][x]["opt_test"],data[os][x]["opt_test_counter"]);
                value = Math.max(dbg_total,opt_total);

                if (!isNaN(value)){
                    //Convert from seconds to hours
                    value = to_hours(value);

                    //Form datapoint
                    datapoint = [Date.UTC(year, month, day), value];

                    //Push datapoint to the series
                    series['data'].push(datapoint);
                }else{
                    /*
                        DEBUG.
                        IT SHOULD NEVER GET HERE.
                    */
                    $("#errors").append("Datapoint Date: " + x+"<br/>=======================<br/>");
                    $("#errors").append("dbg build: " + data[os][x]["dbg_build"]+"<br/>");
                    $("#errors").append("" + data[os][x]["dbg_build_counter"]+"<br/>");
                    $("#errors").append("dbg test: " + data[os][x]["dbg_test"]+"<br/>");
                    $("#errors").append("" + data[os][x]["dbg_test_counter"]+"<br/>");
                    $("#errors").append("opt build: " + data[os][x]["opt_build"]+"<br/>");
                    $("#errors").append("" + data[os][x]["opt_build_counter"]+"<br/>");
                    $("#errors").append("opt test: " + data[os][x]["opt_test"]+"<br/>");
                    $("#errors").append("" + data[os][x]["opt_test_counter"]+"<br/><br/>");
                }

            }
            //Push each completed series to the overall dataset
            graph_data.push(series);
        }
        //Loading is complete!
        hide_loading();

        //Begin Line Chart
        var chart;
        jQuery(document).ready(function() {
            chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'container',
                    type: 'spline'
                },
                title: {
                    text: 'Go Faster! - '+graph_title
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        month: '%b %e',
                        year: '%Y'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Average Wait Time (Hours)'
                    },
                    min: 0
                },
                tooltip: {
                    formatter: function() {
                            return '<b>'+ this.series.name +'</b><br/>'+
                            Highcharts.dateFormat('%b %e, %Y', this.x) +': '+ this.y +' hours';
                    }
                },
                series: graph_data
            });
        });
        //End Line Chart
    }); //End $.getJSON
}

function show_overhead(params_type){
    //Setup and Teardown Averages Dashboard
    show_loading(); //Show loading div to keep user happy

    //Request data from api/turnaround and do stuff
    if(params_type){
        resourceURL = 'api/overhead?type='+params_type;
        graph_title = "Average setup/teardown times for "+params_type;
    }else{
        resourceURL = 'api/overhead';
        graph_title = "Combined average setup/teardown times for test and build";
    }
    $.getJSON(resourceURL, function(data) {
        graph_data = [];

        //Group data by OS
        for (os in data){
            //Save each series into a set for display on the chart
            series = {};
            series.name = os;
            series.data = []
            for(x in data[os]){
                //Split apart timestamps for conversion into UTC time for chart
                parseDate = x.split("-");
                year = parseDate[0];
                month = parseDate[1] - 1; //Javascript months index from 0 instead of 1
                day = parseDate[2];

                //Calculate datapoint display value
                dbg_total = divide(data[os][x]["dbg_build"],data[os][x]["dbg_build_counter"]) + divide(data[os][x]["dbg_test"],data[os][x]["dbg_test_counter"]);
                opt_total = divide(data[os][x]["opt_build"],data[os][x]["opt_build_counter"]) + divide(data[os][x]["opt_test"],data[os][x]["opt_test_counter"]);
                value = Math.max(dbg_total,opt_total);

                if (!isNaN(value)){
                    //Convert from seconds to hours
                    value = to_hours(value);

                    //Form datapoint
                    datapoint = [Date.UTC(year, month, day), value];

                    //Push datapoint to the series
                    series['data'].push(datapoint);
                }else{
                    /*
                        DEBUG.
                        IT SHOULD NEVER GET HERE.
                    */
                    $("#errors").append("Datapoint Date: " + x+"<br/>=======================<br/>");
                    $("#errors").append("dbg build: " + data[os][x]["dbg_build"]+"<br/>");
                    $("#errors").append("" + data[os][x]["dbg_build_counter"]+"<br/>");
                    $("#errors").append("dbg test: " + data[os][x]["dbg_test"]+"<br/>");
                    $("#errors").append("" + data[os][x]["dbg_test_counter"]+"<br/>");
                    $("#errors").append("opt build: " + data[os][x]["opt_build"]+"<br/>");
                    $("#errors").append("" + data[os][x]["opt_build_counter"]+"<br/>");
                    $("#errors").append("opt test: " + data[os][x]["opt_test"]+"<br/>");
                    $("#errors").append("" + data[os][x]["opt_test_counter"]+"<br/><br/>");
                }

            }
            //Push each completed series to the overall dataset
            graph_data.push(series);
        }
        //Loading is complete!
        hide_loading();

        //Begin Line Chart
        var chart;
        jQuery(document).ready(function() {
            chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'container',
                    type: 'spline'
                },
                title: {
                    text: 'Go Faster! - '+graph_title
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        month: '%b %e',
                        year: '%Y'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Average Setup+Teardown Time (Hours)'
                    },
                    min: 0
                },
                tooltip: {
                    formatter: function() {
                            return '<b>'+ this.series.name +'</b><br/>'+
                            Highcharts.dateFormat('%b %e, %Y', this.x) +': '+ this.y +' hours';
                    }
                },
                series: graph_data
            });
        });
        //End Line Chart
    }); //End $.getJSON
}

function show_mochitests(params_os, params_buildtype){
    //Slow Mochitests Dashboard
    show_loading(); //Show loading div to keep user happy

    $.getJSON('api/mochitest', function(data) {

        topSlowest = [];
        graph_data = [];
        for (x in data){
            for(y in data[x]["tests"]){
                //y is the name of the test
                //data[x]["tests"][y] is the value
                //$('#result').append(y);
                testRunTime=parseInt(data[x]["tests"][y], 10);
                topSlowest.push([testRunTime,y]);
                testRunTime = testRunTime.toString();
            }
        }

        //Write results out to div
        $('#result').append("<h1>Top 10 Slowest MochiTests</h1>");

        //Sort and print the top 10
        topSlowest.sort(sortPairs);
        topSlowest = rmDupPairs(topSlowest);

        //Generate zebra-striped list, also create defaults for the series array
        $('#result').append("<ol>");
        series = []
        for(i=1;i<11;i++){
            $('#result ol').append("<li>" + topSlowest[i][1] + " (" + topSlowest[i][0]+"ms)</li>");
            series[i] = {}
            series[i].name = basename(topSlowest[i][1]);
            series[i].data = []
        }
        $('#result').append("</ol>");


        //Calculate Dates for second data query
        var myDate = new Date();
        myDate.setDate(myDate.getDate()-14);
        startdate = ISODateString(myDate);//calculate a week ago
        enddate = ISODateString(new Date());//calculate today

        //Tack on extra params if supplied
        resourceURL = 'api/mochitest?startdate='+startdate+'&enddate='+enddate;
        if(params_buildtype){
            resourceURL += "&buildtype=" + params_buildtype;
        }
        if(params_os){
            resourceURL += "&os=" + params_os;
        }

        //This time get a timespan worth of data
        $.getJSON(resourceURL, function(moredata) {

            //Calculate Data Points
            for (x in moredata){
                for(j=1;j<11;j++){
                    var value;
                    try{
                        //Ensure that the speed of the test is a valid number
                        value = moredata[x]["tests"][topSlowest[j][1]];
                        if (value==undefined){
                            continue; //Skip undefined values in data traversal
                        }
                    }catch(err){
                        //Should not happen but continue if it does
                        continue;
                    }

                    date = moredata[x]["date"]; //contains the day this happened
                    parseDate = date.split("-");
                    year = parseDate[0];
                    month = parseDate[1] - 1; //Javascript months index from 0 instead of 1
                    day = parseDate[2];
                    datapoint = [Date.UTC(year, month, day), value];

                    /*
                        Insert datapoint into list if it's a unique date,
                        otherwise replace value with the max execution time.
                        This ensures that our graph displays the slowest
                        runtime of each point.
                    */
                    if(series[j].data[0]==undefined){
                        series[j].data.push(datapoint);
                    }else{
                        var exists = 0;
                        for(k in series[j].data){
                            if(series[j].data[k][0]==datapoint[0]){ //If new point's date is the same as someone else
                                series[j].data[k][1] = Math.max(datapoint[1],series[j].data[k][1]);
                                exists = 1;
                            }
                        }
                        if(exists==0){
                            series[j].data.push(datapoint);
                        }
                    }
                }
            }

            //Push each series onto the graph as a separate line
            //10 series, one for each top-ten slowest tests.
            for(i=1;i<11;i++){
                graph_data.push(series[i]);
            }

            hide_loading(); //Hide loading screen on successful fetch
            //Begin Line Chart
            var chart;
            jQuery(document).ready(function() {
                chart = new Highcharts.Chart({
                    chart: {
                        renderTo: 'container',
                        type: 'spline'
                    },
                    title: {
                        text: 'Go Faster! - Slowest Mochitests'
                    },
                    subtitle: {
                        text: ''
                    },
                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: { // don't display the dummy year
                            month: '%b %e',
                            year: '%Y'
                        }
                    },
                    yAxis: {
                        title: {
                            text: 'mochitest runtime (ms)'
                        },
                        min: 0
                    },
                    tooltip: {
                        formatter: function() {
                                return '<b>'+ this.series.name +'</b><br/>'+
                                Highcharts.dateFormat('%b %e, %Y', this.x) +': '+ this.y +' ms';
                        }
                    },
                    series: graph_data
                });
            });//End Line Chart
        }); //End .getJSON

    }); //End $.getJSON()
} //End show_mochitests
