var Sphinx = {
    'port':9312
};

(function() {
    var bits = require('./bits');
    var tcp = require('net');
    var sys = require('sys');

    Sphinx.queries = [];

    // All search modes
    Sphinx.searchMode = {
        "ALL":0,
        "ANY":1,
        "PHRASE":2,
        "BOOLEAN":3,
        "EXTENDED":4,
        "FULLSCAN":5,
        "EXTENDED2":6    // extended engine V2 (TEMPORARY, WILL BE REMOVED)
    };

    // All ranking modes
    Sphinx.rankingMode = {
        "PROXIMITY_BM25": 0,    ///< default mode, phrase proximity major factor and BM25 minor one
        "BM25": 1,    ///< statistical mode, BM25 ranking only (faster but worse quality)
        "NONE": 2,    ///< no ranking, all matches get a weight of 1
        "WORDCOUNT":3,    ///< simple word-count weighting, rank is a weighted sum of per-field keyword occurence counts
        "PROXIMITY":4,
        "MATCHANY" :5,
        "FIELDMASK":6
    };

    Sphinx.sortMode = {
        "RELEVANCE": 0,
        "ATTR_DESC": 1,
        "ATTR_ASC": 2,
        "TIME_SEGMENTS": 3,
        "EXTENDED": 4,
        "EXPR": 5
    };

    Sphinx.groupMode = {
        "DAY": 0,
        "WEEK": 1,
        "MONTH": 2,
        "YEAR": 3,
        "ATTR": 4,
        "ATTRPAIR": 5
    };

    // Commands
    Sphinx.command = {
        "SEARCH"  : 0,
        "EXCERPT" : 1,
        "UPDATE"  : 2,
        "KEYWORDS": 3,
        "PERSIST" : 4,
        "STATUS"  : 5,
        "QUERY"   : 6
    };

    // Current version client commands
    Sphinx.clientCommand = {
        "SEARCH": 278,
        "EXCERPT": 256,
        "UPDATE": 258,
        "KEYWORDS": 256,
        "STATUS": 256,
        "QUERY": 256
    };

    Sphinx.statusCode = {
        "OK":      0,
        "ERROR":   1,
        "RETRY":   2,
        "WARNING": 3
    };

    Sphinx.attribute = {
        "INTEGER":        1,
        "TIMESTAMP":      2,
        "ORDINAL":        3,
        "BOOL":           4,
        "FLOAT":          5,
        "BIGINT":         6,
        "MULTI":          1073741824 // 0x40000000
    };

    var server_conn;
    var connection_status;


    // Connect to Sphinx server
    Sphinx.connect = function(port, callback) {

        server_conn = tcp.createConnection(port || Sphinx.port);
        // disable Nagle algorithm
        server_conn.setNoDelay(true);
        server_conn.setEncoding('binary');

        //var promise = new process.Promise();

        server_conn.addListener('connect', function () {

            // sys.puts('Connected, sending protocol version... State is ' + server_conn.readyState);
            // Sending protocol version
            // sys.puts('Sending version number...');
            // Here we must send 4 bytes, '0x00000001'
            if (server_conn.readyState == 'open') {
                server_conn.write((new bits.Encoder()).push_int32(1).toRawString(), 'binary');

                // Waiting for answer
                server_conn.addListener('data', function(data) {
                    // sys.puts('Data received from server');

                    // var data_unpacked = binary.unpack('N*', data);
                    var receive_listeners = server_conn.listeners('data');
                    var i;
                    for (i = 0; i < receive_listeners.length; i++) {
                        server_conn.removeListener('data', receive_listeners[i]);
                    }
                    var protocol_version = (new bits.Decoder(data)).shift_int32();
                    var data_unpacked = {'': 1};

                    if (data_unpacked[""] >= 1) {

                        // Remove listener after handshaking
                        var listener;
                        for (listener in server_conn.listeners('data')) {
                            server_conn.removeListener('data', listener);
                        }

                        // Simple connection status inducator
                        connection_status = 1;

                        // Use callback
                        // promise.emitSuccess();
                        callback(null);

                    } else {
                        callback(new Error('Wrong protocol version: ' + protocol_version));
                    }

                });
            } else {
                callback(new Error('Connection is ' + server_conn.readyState + ' in OnConnect'));
            }
        });

    }

    // sys.puts('Connecting to searchd...');



    Sphinx.query = function(query_raw, callback) {
        var query;

        var query_parameters = {
            groupmode: Sphinx.groupMode.DAY,
            groupsort: "@group desc",
            groupdistinct: "",
            indices: '*',
            groupby: '',
            maxmatches: 1000,
            selectlist: '*',
            weights: [],
            comment: ''
        };

        if (query_raw.groupmode) {
            query_parameters.groupmode = query_raw.groupmode;
        }

        if (query_raw.groupby) {
            query_parameters.groupby = query_raw.groupby;
        }

        if (query_raw.groupsort) {
            query_parameters.groupsort = query_raw.groupsort;
        }

        if (query_raw.groupdistinct) {
            query_parameters.groupdistinct = query_raw.groupdistinct;
        }

        if (query_raw.indices) {
            query_parameters.indices = query_raw.indices;
        }

        if (query_raw.maxmatches) {
            query_parameters.maxmatches = query_raw.maxmatches;
        }

        if (query_raw.selectlist) {
            query_parameters.selectlist = query_raw.selectlist;
        }

        if (query_raw.weights) {
            query_parameters.weights = query_raw.weights;
        }

        if (query_raw.comment) {
            query_parameters.comment = query_raw.comment;
        }

        if (query_raw.query) {
            query = query_raw.query;
        } else {
            query = query_raw.toString();
        }

        /* if (connection_status != 1) {
            sys.puts("You must connect to server before issuing queries");
            return false;

        }  */

        var request = (new bits.Encoder(Sphinx.command.SEARCH, Sphinx.clientCommand.SEARCH)).push_int32(0).push_int32(20).push_int32(Sphinx.searchMode.ALL).push_int32(Sphinx.rankingMode.BM25).push_int32(Sphinx.sortMode.RELEVANCE);

        request.push_int32(0); // "sort by" is not supported yet

        request.push_lstring(query); // Query text

        request.push_int32(query_parameters.weights.length); // weights is not supported yet
        for (var weight in query_parameters.weights) {
            request.push_int32(parseInt(weight));
        }

        request.push_lstring(query_parameters.indices); // Indices used

        request.push_int32(1); // id64 range marker

        request.push_int32(0).push_int32(0).push_int32(0).push_int32(0); // No limits for range

        request.push_int32(0); // filters is not supported yet

        request.push_int32(query_parameters.groupmode);
        request.push_lstring(query_parameters.groupby); // Groupby length

        request.push_int32(query_parameters.maxmatches); // Maxmatches, default to 1000

        request.push_lstring(query_parameters.groupsort); // Groupsort

        request.push_int32(0); // Cutoff
        request.push_int32(0); // Retrycount
        request.push_int32(0); // Retrydelay

        request.push_lstring(query_parameters.groupdistinct); // Group distinct

        request.push_int32(0); // anchor is not supported yet

        request.push_int32(0); // Per-index weights is not supported yet

        request.push_int32(0); // Max query time is set to 0

        request.push_int32(0); // Per-field weights is not supported yet

        request.push_lstring(query_parameters.comment); // Comments is not supported yet

        request.push_int32(0); // Atribute overrides is not supported yet

        request.push_lstring(query_parameters.selectlist); // Select-list

            server_conn.write(request.toString(), 'binary');

        server_conn.addListener('data', function(data) {
            // Got response!
            // Command must match the one used in query
            var response = getResponse(data, Sphinx.clientCommand.SEARCH);

            var answer = parseSearchResponse(response);

            callback(null, answer);

        });

    };

    Sphinx.disconnect = function() {
        server_conn.end();
    }

    var getResponse = function(data, search_command) {
        var output = {};
        var response = new bits.Decoder(data);

        output.status = response.shift_int16();
        output.version = response.shift_int16();

        output.length = response.shift_int32();

        if (output.length != data.length - 8) {
            sys.puts("Failed to read searchd response (status=" + output.status + ", ver=" + output.version + ", len=" + output.length + ", read=" + (data.length - 8) + ")");
        }

        if (output.version < search_command) {
            sys.puts("Searchd command older than client's version, some options might not work");
        }

        if (output.status == Sphinx.statusCode.WARNING) {
            sys.puts("Server issued WARNING: " + data.substring(8));
        }

        if (output.status == Sphinx.statusCode.ERROR) {
            sys.puts("Server issued ERROR: " + data.substring(8));
        }

        return data.substring(8);
    }

    var parseSearchResponse = function (data) {
        var output = {};
        var response = new bits.Decoder(data);
        var i;

        output.status = response.shift_int32();
        output.num_fields = response.shift_int32();

        output.fields = [];
        output.attributes = [];
        output.matches = [];

        // Get fields
        for (i = 0; i < output.num_fields; i++) {
            var field = {};

            field.name = response.shift_lstring();

            output.fields.push(field);
        }

        output.num_attrs = response.shift_int32();

        // Get attributes
        for (i = 0; i < output.num_attrs; i++) {
            var attribute = {};

            attribute.name = response.shift_lstring();
            attribute.type = response.shift_int32();

            output.attributes.push(attribute);
        }

        output.match_count = response.shift_int32();
        output.id64 = response.shift_int32();

        // Get matches
        for (i = 0; i < output.match_count; i++) {
            var match = {};

            // Here server tells us which format for document IDs
            // it uses: int64 or int32
            if (output.id64 == 1) {
                // here we must fetch int64 document id
                // and immediately throw half of it away :)
                var id64 = response.shift_int32();
                match.doc = response.shift_int32();
                match.weight = response.shift_int32();
            } else {
                // Good news: document id fits our integers size :)
                match.doc = response.shift_int32();
                match.weight = response.shift_int32();
            }

            match.attrs = {};

            //
            var attr_value;
            // var attribute;

            for (attribute in output.attributes) {
                // BIGINT size attributes (64 bits)
                if (attribute.type == Sphinx.attribute.BIGINT) {
                    attr_value = response.shift_int32();
                    attr_value = response.shift_int32();
                    match.attrs[output.attributes[attribute].name] = attr_value;
                    continue;
                }

                // FLOAT size attributes (32 bits)
                if (output.attributes[attribute].type == Sphinx.attribute.FLOAT) {
                    attr = response.shift_int32();
                    match.attrs[output.attributes[attribute].name] = attr_value;
                    continue;
                }

                // We don't need this branch right now,
                // as it is covered by previous `if`
                // @todo: implement MULTI attribute type
                attr_value = response.shift_int32();
                match.attrs[output.attributes[attribute].name] = attr_value;
            }

            output.matches.push(match);

        }

        output.total = response.shift_int32();
        output.total_found = response.shift_int32();
        output.msecs = response.shift_int32();
        output.words_count = response.shift_int32();
        output.words = [];
        for (i = 0; i <=output.words; i++) {
            output.words.push(response.shift_lstring());
        }
        // sys.puts('Unused data:' + response.length + ' bytes');

        // @todo: implement words

        return output;
    }

    Sphinx.buildExcerpts = function (matches, index, words, options, callback) {

        if (typeof words == 'Array') {
            words = words.join(',');
        }
        index = index || "*";

        options = {
            beforeMatch : options.beforeMatch || '<b>',
            afterMatch : options.afterMatch || '</b>',
            chunkSeparator : options.chunkSeparator || '...',
            limit : options.limit || 256,
            around : options.around || 5,
            exactPhrase : options.exactPhrase || false,
            singlePassage : options.singlePassage || false,
            useBoundaries : options.useBoundaries || false,
            weightOrder : options.weightOrder || false
        }

        var request = (new bits.Encoder(Sphinx.command.EXCERPT, Sphinx.clientCommand.EXCERPT));

        // Start of actual request
        
        request.push_int32(0); // mode

        var flag = 1;

        if (options.exactPhrase) flag = flag | 2;
        if (options.singlePassage) flag = flag | 4;
        if (options.useBoundaries) flag = flag | 8;
        if (options.weightOrder) flag = flag | 16;

        request.push_int32(parseInt(flag));

        request.push_lstring(index);
        request.push_lstring(words);

        // options

        request.push_lstring(options.beforeMatch);
        request.push_lstring(options.afterMatch);
        request.push_lstring(options.chunkSeparator);
        request.push_int32(options.limit);
        request.push_int32(options.around);

        // Documents

        request.push_int32(matches.count);

        for (doc in matches) {
            request.push_lstring(matches[doc].toString());
        }

        server_conn.write(request.toString(true), 'binary');

        server_conn.addListener('data', function(data) {
            // Got response!
            // Command must match the one used in query
            var response = getResponse(data, Sphinx.clientCommand.EXCERPT);

            // var answer = parseSearchResponse(response);
            response = new bits.Decoder(response);

            var answer = [];

            for (doc in matches) {
                response.shift_int32(); // leading 0

                var excerpt = response.shift_lstring();

                if (excerpt.length > 0) {
                    answer[matches[doc]] = excerpt; // Excerpt string
                }
            }

            callback(null, answer);

        });

    }

})();

// process.mixin(exports, Sphinx);
for (var i in Sphinx) { exports[i] = Sphinx[i] };
