var util = {};
(function () {

    var ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    var tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    var teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    var convert_hundreds = function(num) {
        if (num > 99) {
            return ones[Math.floor(num / 100)] + "hundred" + convert_tens(num % 100);
        }
        else {
            return convert_tens(num);
        }
    };
    var  convert_tens = function(num) {
        if (num < 10) return ones[num];
        else if (num >= 10 && num < 20) return teens[num - 10];
        else {
            return tens[Math.floor(num / 10)] + ones[num % 10];
        }
    };
    //single public function
    util.convert = function(num) {
        if (num == 0) return "zero";
        else return convert_hundreds(num);
    };
})();

(function ($) {

    var $errorList = $("#errorList"),
        $gridHolder = $("#demoGridholder"),
        $resultCss = $("#resultCss"),
        $ieCss = $("#IECss"),
        $exampleHtml = $("#exampleHtml"),
        addComments = true,
        addInsertedMargins = true,
        addOffset = true, 
        addSourceOrdering = true,        
        prefixInput = "",
        postfixInput = "",
        noMargineClass = "",
        noMargineRightClass = "",
        noMargineLeftClass = "",
        insertMargineClass = "",
        insertMargineRightClass = "",
        insertMargineLeftClass = "",
        centerClass = "",
        rowClass = "";

    function logError(msg) {
        $errorList.show();
        $errorList.append("<li>" + msg + "</li>");
    }

    //returns size in percentage
    function getRealtiveSizeFor(targetPx, contextPx) {
        return targetPx / contextPx * 100;
    }

    //calculates the pixel width of a column, taking into account context and margin
    function getColumnWidthPx(numberOfColumnsTotal, numberOfColumnsSize, contextPx, marginPx, hasMarginLeft, hasMarginRight) {
        var fullMarginPx = (hasMarginLeft ? marginPx / 2 : 0) + (hasMarginRight ? marginPx / 2 : 0);
        return ((contextPx / numberOfColumnsTotal) * numberOfColumnsSize) - fullMarginPx;
    }

    //calculates the percentual width of a column, taking into account context and margin
    function getColumnWidthPercent(numberOfColumnsTotal, numberOfColumnsSize, contextPx, marginPx, hasMarginLeft, hasMarginRight) {
        return getRealtiveSizeFor(getColumnWidthPx(numberOfColumnsTotal, numberOfColumnsSize, contextPx, marginPx, hasMarginLeft, hasMarginRight), contextPx);
    }

    function generateGrid() {        
        var nestedLevel = Number($("#nestedLevelInput").val()) || 0;
        var resultTxt = "/*fluid " + (nestedLevel > 1 ? "nested " : "") + "grid */\n";
        var resultTxtInnerMargin = ""; 
        var numCols = Number($("#numberColsInput").val()) || 0;
        var marginWidth = Number($("#marginInput").val()) || 0;
        var contextWidth = Number($("#contextWidthInput").val()) || 800;
        var exampleHtml = "";

        prefixInput = $.trim($("#prefixInput").val());
        postfixInput = $.trim($("#postfixInput").val());
        noMargineClass = prefixInput + "no-margin" + postfixInput;
        noMargineRightClass = prefixInput + "no-margin-right" + postfixInput;
        noMargineLeftClass = prefixInput + "no-margin-left" + postfixInput;
        insertMargineClass = prefixInput + "insert-margin" + postfixInput;
        insertMargineRightClass = prefixInput + "insert-margin-right" + postfixInput;
        insertMargineLeftClass = prefixInput + "insert-margin-left" + postfixInput;
        centeredClass = prefixInput + "centered" + postfixInput;
        rowClass = prefixInput + "row" + postfixInput;

        
        addComments = $("#addCommentsCheck").is(":checked");
        addInsertedMargins = $("#addInsertedMargins").is(":checked");
        addOffset = $("#addOffset").is(":checked");
        addSourceOrdering = $("#addSourceOrdering").is(":checked");

        if (!numCols && numCols < 1) {
            logError("Please specify the number of Columns (>0)");
            return;
        }

        $gridHolder.empty();
        $gridHolder.css("maxWidth", contextWidth);

        resultTxt += ".gridHolder { width:100%; max-width: " + contextWidth + "px; }\n";
        resultTxt += "." + rowClass + " {float:left; clear:both; width:100%; }\n";

        exampleHtml = "<div class=\"gridHolder\">\n\t<div class=\"" + rowClass + "\">";

        for (var i = 1; i <= numCols; i++) {
            resultTxt += "." + prefixInput + util.convert(i) + postfixInput + ((i < numCols) ? ", " : " ");

            if (i < numCols) {
                exampleHtml += "\n\t\t<div class=\"" + prefixInput + util.convert(i) + postfixInput + "\">" + util.convert(i) + " (of " + numCols + ")";
                exampleHtml += "</div> <div class=\"" + prefixInput + util.convert(numCols - i) + postfixInput + "\">" + util.convert(numCols - i) + " (of " + numCols + ")</div>";
            } else {
                if (nestedLevel > 1) {
                    exampleHtml += "\n\t\t<div class=\""+ prefixInput + util.convert(i) + postfixInput + "\">\n\t\t\t<div class=\"" + rowClass + "\">";
                    for (var j = 1; j <= numCols; j++) {
                        var classes =  prefixInput + util.convert(1) + postfixInput + (j === 1 ? " " + noMargineLeftClass : (j === numCols ? " " + noMargineRightClass : ""));
                        exampleHtml += "\n\t\t\t\t<div class=\"" + prefixInput + classes + postfixInput + "\">Level Two: "+util.convert(1) +" (of " + numCols + ")</div>";
                    }

                    exampleHtml += "\n\t\t\t</div>";
                    exampleHtml += "\n\t\t</div>";
                    exampleHtml += "\n\t\t<div class=\"" + prefixInput + util.convert(i) + postfixInput + "\">\n\t\t\t<div class=\"" + rowClass + "\">";
                    for (var j = 1; j <= numCols; j++) {
                        var classes = prefixInput + util.convert(1) + postfixInput + (j === 1 ? " " + noMargineLeftClass : (j === numCols ? " " + noMargineRightClass : ""));

                        if (j == 2) {
                            classes += " " + insertMargineRightClass;
                        } else if (j > 2 && j < numCols - 2) {
                            classes += " " + insertMargineClass;
                        } else if (j > 2 && j < numCols - 1) {
                            classes += " " + insertMargineLeftClass;
                        }
                        exampleHtml += "\n\t\t\t\t<div class=\"" + classes + "\">Level Two: " + util.convert(1) + " (of " + numCols + ")</div>";

                    }

                    exampleHtml += "\n\t\t\t</div>";
                } else {
                    exampleHtml += "\n\t\t<div class=\"" + prefixInput + util.convert(i) + postfixInput + "\">" + util.convert(i) + " (of " + numCols + ")</div>";
                }
                exampleHtml += "\n\t\t</div>";
            }
        }
        exampleHtml += "\n\t</div>\n</div>";

        resultTxt += "{" + (addSourceOrdering ? "position:relative; " : "") + "box-sizing: border-box; -moz-box-sizing:border-box; -webkit-box-sizing:border-box;}\n\n";
            

        resultTxtInnerMargin += "\n";

        for (var j = 1; j <= nestedLevel; j++) {
            var rowsSelector = "";
            for (var k = 1; k <= j; k++) {
                rowsSelector += "." + rowClass + " ";
            }            
            resultTxt += rowsSelector + "." + centeredClass + " { float: none; margin: 0 auto; }\n";    
            resultTxt += rowsSelector + "." + noMargineLeftClass + ", " + rowsSelector + "." + noMargineClass + " {margin-left:0;}\n";
            resultTxt += rowsSelector + "." + noMargineRightClass + ", " + rowsSelector + "." + noMargineClass + " {margin-right:0;}\n";
            resultTxtInnerMargin += rowsSelector + "." + insertMargineLeftClass + ", " + rowsSelector + "." + insertMargineClass + " {margin-left:0;}\n";
            resultTxtInnerMargin += rowsSelector + "." + insertMargineRightClass + ", " + rowsSelector + "." + insertMargineClass + " {margin-right:0;}\n";            
        }
       
        if(addInsertedMargins) {
            resultTxt += resultTxtInnerMargin;
        }

        var singleColumnPxWidth = (contextWidth - (numCols * marginWidth)) / numCols;
        //recursively create styles and demo elements
        resultTxt = "\n" + generateNestedGrid(1, nestedLevel, numCols, numCols, resultTxt, contextWidth, singleColumnPxWidth, marginWidth, null, null);


        $resultCss.val($.trim(resultTxt));
        $exampleHtml.val($.trim(exampleHtml));

        //        var ieTxt = "<!--[if lt IE 8]>\n"
        //        + "<style type=\"text/css\">\n"
        //        + "\t/* Border Box fix IE6+7 */\n"
        //        + "\t#gridHolder div {behavior: url(/boxsizing.htc); display:inline; }\n"
        //        + "\t.gridHolder {width:" + contextWidth + "px; }\n"
        //        + "</style>\n"
        //        + "<![endif]-->";


        //        $ieCss.val(ieTxt);
    }






    //recursively create child grids
    function generateNestedGrid(level, numLevels, numberColumnsToCalculate, numberColumnsTotal, resultTxt, contextWidth, singleColumnPxWidth, marginWidth, parentClass, parentDemoElement) {
        parentClass = parentClass || "";
        var $holderRow;
        var currColumnWidthPerc;
        var currOffsetWidthPerc;
        var currPushWidthPerc;
        var currPullWidthPerc;
        var subMarginWidthPerc;
        var currColumnWidthNoMarginPerc;
        var currColumnWidthSingleMarginPerc;
        var currColumnWidthFirstLastPerc;
        var currColumnWidthPx;
        var resultTxtSingleMargin = "";
        var resultTxtInsertMargins = "";
        var resultTxtOffset = "";
        var resultTxtSourceOrderingPush = "";
        var resultTxtSourceOrderingPull = "";
        var currColumnFullClassName = "";

        if (addComments) {
            if (parentClass === "") {
                resultTxt += "\n\n/*level" + level + "*/\n";
            } else {
                resultTxt += "\n\n/*level" + level + " under " + parentClass.replace(/\t/g, "").replace(/ +/g, " ") + "*/\n";
            }
        }


        //direct children - css text and render demo nodes
        for (var i = 1; i <= numberColumnsToCalculate; i++) {
            currColumnWidthPerc = getRealtiveSizeFor(singleColumnPxWidth * i + marginWidth * (i - 1), contextWidth);
            currColumnWidthNoMarginPerc = getRealtiveSizeFor((singleColumnPxWidth * i) + ((i) * marginWidth), contextWidth);
            currColumnWidthSingleMarginPerc = getRealtiveSizeFor((singleColumnPxWidth * i) + ((i - 0.5) * marginWidth), contextWidth);
            currColumnMarginWidthPerc = getRealtiveSizeFor(marginWidth / 2, contextWidth);
            currColumnFullClassName = parentClass + "." + prefixInput + util.convert(i) + postfixInput;

            //TODO: check do do the test with CSS selectors
            //CSS3 [class^="+noMargineRightClass+"],   [class^="+noMargineLeftClass+"],   [class^=" + noMargineClass + "]

            resultTxt += currColumnFullClassName + " { " + (level === 1 ? "float:left; " : "") + "width:" + currColumnWidthPerc + "%; margin-right:" + currColumnMarginWidthPerc + "%; margin-left:" + currColumnMarginWidthPerc + "%; }" + "\n";
            if(addInsertedMargins){
                resultTxtSingleMargin += currColumnFullClassName + "." + insertMargineRightClass + " { width:" + currColumnWidthSingleMarginPerc + "%;" + (level === 1 ? "  margin-right:0;" : "") + " padding-right:" + currColumnMarginWidthPerc + "%; }" + "\n";
                resultTxtSingleMargin += currColumnFullClassName + "." + insertMargineLeftClass + " { width:" + currColumnWidthSingleMarginPerc + "%;" + (level === 1 ? "  margin-left:0;" : "") + " padding-left:" + currColumnMarginWidthPerc + "%; }" + "\n";
                resultTxtInsertMargins += currColumnFullClassName + "." + insertMargineClass + " { width:" + currColumnWidthNoMarginPerc + "%;" + (level === 1 ? " margin-right:0; margin-left:0;" : "") + " padding-left:" + currColumnMarginWidthPerc + "%;  padding-right:" + currColumnMarginWidthPerc + "%;}" + "\n";
            }
            if (!parentDemoElement) {
                $holderRow = ($("<div />", { "class": rowClass + " level1" }))
                        .append($("<div />", { "class": " column " + prefixInput +  util.convert(i) + postfixInput })
                                           .css({ "width": currColumnWidthPerc + "%", "marginRight": currColumnMarginWidthPerc + "%", "marginLeft": currColumnMarginWidthPerc + "%" })
                                           .text(util.convert(i) + " (of " + numberColumnsTotal+")")
                               );
                //append a full row for the single item
                if (i === 1) {
                    for (var j = 2; j <= numberColumnsTotal; j++) {
                        $holderRow.append($("<div />", { "class": " column " + prefixInput + util.convert(i) + postfixInput })
                                           .css({ "width": currColumnWidthPerc + "%", "marginRight": currColumnMarginWidthPerc + "%", "marginLeft": currColumnMarginWidthPerc + "%" })
                                           .text(util.convert(i) + " (of " + numberColumnsTotal + ")"));

                    }

                }
                $holderRow.appendTo($gridHolder);
            } else {
                if (i < numberColumnsToCalculate && numberColumnsToCalculate > 1) {
                    $holderRow = $("<div />", { "class": rowClass + " level" + level.toString() });

                    var divLeft = $("<div>", { "class": "column " + prefixInput + util.convert(i) + postfixInput + " " + noMargineLeftClass })
                        .css({ "width": currColumnWidthPerc + "%", "marginRight": currColumnMarginWidthPerc + "%" })
                        .text(util.convert(i) + " (of " + numberColumnsTotal + ")");

                    var reveseColumnWidth = getRealtiveSizeFor((singleColumnPxWidth * (numberColumnsToCalculate - i)) + (((numberColumnsToCalculate - i) - 1) * marginWidth), contextWidth);
                    var divRight = $("<div>", { "class": "column " + prefixInput + util.convert(numberColumnsToCalculate - i) + postfixInput + " " + noMargineRightClass })
                        .css({ "width": reveseColumnWidth + "%", "marginLeft": currColumnMarginWidthPerc + "%" })
                        .text(util.convert(numberColumnsToCalculate - i) + " (of " + numberColumnsTotal + ")");


                    $holderRow.append(divLeft)
                              .append(divRight)
                              .appendTo(parentClass);
                } else {
                    $holderRow = $("<div />", { "class": rowClass + " level" + level })
                    .append($("<div />", { "class": "column " + prefixInput + util.convert(i) + postfixInput + " " + noMargineClass })
                                        .css({ "width": currColumnWidthPerc + "%" })
                                        .text(util.convert(i) + " (of " + numberColumnsTotal + ")")
                           )
                    .appendTo(parentClass);
                }
            }

        }

        //offset and source ordering        
        for (var i = 1; i <= numberColumnsTotal-1; i++) {
            if(addOffset){
                currOffsetWidthPerc = getRealtiveSizeFor(singleColumnPxWidth * i + marginWidth * i + (level === 1 ? marginWidth / 2 : 0), contextWidth);
                resultTxtOffset += parentClass + "." + prefixInput + "offset-by-" + util.convert(i) + postfixInput + " { margin-left:" + currOffsetWidthPerc + "%;}" + "\n";
            }
            if(addSourceOrdering){
                currPushWidthPerc = getRealtiveSizeFor(singleColumnPxWidth * i + marginWidth * i - (level > 1 ? marginWidth / 2 : 0), contextWidth);
                currPullWidthPerc = getRealtiveSizeFor(singleColumnPxWidth * i + marginWidth * i + (level > 1 ? marginWidth / 2 : 0), contextWidth);
                resultTxtSourceOrderingPush += parentClass + "." + prefixInput + "push-" + util.convert(i) + postfixInput  + " { left:" + currPushWidthPerc + "%;}" + "\n";
                resultTxtSourceOrderingPull += parentClass + "." + prefixInput + "pull-" + util.convert(i) + postfixInput  + " { right:" + currPullWidthPerc + "%;}" + "\n";
            }
        }
        

        if(addInsertedMargins) {
            resultTxt += (addComments ? "/*both margins inserted*/\n" : "") + resultTxtInsertMargins;        
            resultTxt += (addComments ? "/*single-margin*/\n" : "") + resultTxtSingleMargin;
        }
        if(addOffset){
            resultTxt += (addComments ? "/*offset*/\n" : "") + resultTxtOffset;
        }
        if(addSourceOrdering){
            resultTxt += (addComments ? "/*source ordering - push*/\n" : "") + resultTxtSourceOrderingPush;
            resultTxt += (addComments ? "/*source ordering - pull*/\n" : "") + resultTxtSourceOrderingPull;
            
        }

        //nested children - recursive call
        for (var i = 1; i <= numberColumnsToCalculate; i++) {
            var subparentClass = parentClass + (parentClass === "" ? "" : " ") + "." + prefixInput + util.convert(i) + postfixInput  + " ";
            //currColumnWidthPx = getColumnWidthPx(numberColumnsToCalculate, i, contextWidth, marginWidth, (level === 1), (level === 1));
            currColumnWidthPx = ((singleColumnPxWidth) * i) + ((i - 1) * marginWidth);
            if (level < numLevels) {
                resultTxt = generateNestedGrid(level + 1, numLevels, i, numberColumnsTotal, resultTxt, currColumnWidthPx, singleColumnPxWidth, marginWidth, subparentClass, $holderRow);
            }
        }
        return resultTxt;

    }


    //init stuff
    $("#generateBtn").click(generateGrid).trigger("click");


})(jQuery)