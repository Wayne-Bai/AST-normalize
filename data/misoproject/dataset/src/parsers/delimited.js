/*jshint -W082 */
(function(global, _) {

  var Dataset = global.Miso.Dataset;

  /**
   * Handles CSV and other delimited data.
   *
   * **Note:** The delimited parser will assign custom column names in case the
   * header row exists, but has missing values. They will be of the form XN
   * where N starts at 0.
   *
   * @constructor
   * @name Delimited
   * @memberof Miso.Dataset.Parsers
   * @augments Miso.Dataset.Parsers
   *
   * @param {Object} [options]
   * @param {String} options.delimiter. Default: ","
   */
  Dataset.Parsers.Delimited = function(options) {
    options = options || {};

    this.delimiter = options.delimiter || ",";

    this.skipRows = options.skipRows || 0;

    this.emptyValue = options.emptyValue || null;

    this.__delimiterPatterns = new RegExp(
      (
        // Delimiters.
        "(\\" + this.delimiter + "|\\r?\\n|\\r|^)" +

        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

        // Standard fields.
        "([^\"\\" + this.delimiter + "\\r\\n]*))"
      ),
      "gi"
    );
  };

  // Ie is not aware of trim method...
  if(typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, ''); 
    };
  }

  _.extend(Dataset.Parsers.Delimited.prototype, Dataset.Parsers.prototype,
    /** @lends Dataset.Parsers.Delimited */
    {

    parse : function(data) {
      var columns = [],
          columnData = {},
          uniqueSequence = {};
      
      var uniqueId = function(str) {
        if ( !uniqueSequence[str] ) {
          uniqueSequence[str] = 0;
        }
        var id = str + uniqueSequence[str];
        uniqueSequence[str] += 1;
        return id;
      };


      var parseCSV = function(delimiterPattern, strData, strDelimiter, skipRows, emptyValue) {

        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;

        // track how many columns we have. Once we reach a new line
        // mark a flag that we're done calculating that.
        var columnCount = 0;
        var columnCountComputed = false;

        // track which column we're on. Start with -1 because we increment it before
        // we actually save the value.
        var columnIndex = -1;

        // track which row we're on
        var rowIndex = 0;

        try {

          // trim any empty lines at the end
          strData = strData//.trim();
            .replace(/\s+$/,"")
            .replace(/^[\r|\n|\s]+[\r|\n]/,"\n");

          // do we have any rows to skip? if so, remove them from the string
          if (skipRows > 0) {
            var rowsSeen = 0,
                charIndex = 0,
                strLen = strData.length;

            while (rowsSeen < skipRows && charIndex < strLen) {
              if (/\n|\r|\r\n/.test(strData.charAt(charIndex))) {
                rowsSeen++;
              } 
              charIndex++;
            }

            strData = strData.slice(charIndex, strLen);
          }

          // Keep looping over the regular expression matches
          // until we can no longer find a match.
          function matchHandler(arrMatches) {
            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if ( strMatchedDelimiter.length &&
              ( strMatchedDelimiter !== strDelimiter )){

            // we have reached a new row.
            rowIndex++;

            // if we caught less items than we expected, throw an error
            if (columnIndex < columnCount-1) {
              rowIndex--;
              throw new Error("Not enough items in row");
            }

            // We are clearly done computing columns.
            columnCountComputed = true;

            // when we're done with a row, reset the row index to 0
            columnIndex = 0;

          } else {

            // Find the number of columns we're fetching and
            // create placeholders for them.
            if (!columnCountComputed) {
              columnCount++;
            }

            columnIndex++;
          }


          // Now that we have our delimiter out of the way,
          // let's check to see which kind of value we
          // captured (quoted or unquoted).
          var strMatchedValue = null;
          if (arrMatches[ 2 ]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[ 2 ].replace(
              new RegExp( "\"\"", "g" ),
              "\""
            );

          } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[ 3 ];
          }


          // Now that we have our value string, let's add
          // it to the data array.

          if (columnCountComputed) {

            if (strMatchedValue === '') {
              strMatchedValue = emptyValue;
            }

            if (typeof columnData[columns[columnIndex]] === "undefined") {
              throw new Error("Too many items in row"); 
            }

            columnData[columns[columnIndex]].push(strMatchedValue);  

          } else {

            var createColumnName = function(start) {
              var newName = uniqueId(start);
              while ( columns.indexOf(newName) !== -1 ) {
                newName = uniqueId(start);
              }
              return newName;
            };

            //No column name? Create one starting with X
            if ( _.isUndefined(strMatchedValue) || strMatchedValue === '' ) {
              strMatchedValue = 'X';
            }

            //Duplicate column name? Create a new one starting with the name
            if (columns.indexOf(strMatchedValue) !== -1) {
              strMatchedValue = createColumnName(strMatchedValue);
            }

            // we are building the column names here
            columns.push(strMatchedValue);
            columnData[strMatchedValue] = [];
          }
          }        

        //missing column header at start
        if ( new RegExp('^' + strDelimiter).test(strData) ) {
          matchHandler(['','',undefined,'']);
        }
        while (arrMatches = delimiterPattern.exec(strData)) {
          matchHandler(arrMatches);
        } // end while
        } catch (e) {
          throw new Error("Error while parsing delimited data on row " + rowIndex + ". Message: " + e.message);
        }

      

        // Return the parsed data.
        return {
          columns : columns,
          data : columnData
        };
      };

      return parseCSV(
        this.__delimiterPatterns, 
        data, 
        this.delimiter,
        this.skipRows,
        this.emptyValue);
    }

  });


}(this, _));
