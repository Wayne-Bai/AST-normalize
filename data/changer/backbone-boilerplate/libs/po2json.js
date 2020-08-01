define([], function() {

  var context_glue = '\004',
      deqoute = function(str) {
        return str.replace(/^"(.*)"/, '$1').replace(/\\"/g, '"').replace(/\\n/g, '\n');
      };

  return function(data) {
    var match,
        msg_ctxt_id,
        msgid_plural,
        trans,
        str,
        rv = {},
        buffer = {};
        lastbuffer = '';
        errors = [];
        lines = data.split('\n');

    for (var i=0; i<lines.length; i++) {
      // chomp
      lines[i] = lines[i].replace(/(\n|\r)+$/, '');

      // Empty line / End of an entry.
      if (/^$/.test(lines[i])) {
        if (typeof(buffer['msgid']) != 'undefined') {
          msg_ctxt_id = (typeof(buffer['msgctxt']) != 'undefined' &&
                          buffer['msgctxt'].length) ?
                            buffer['msgctxt']+context_glue+buffer['msgid'] :
                            buffer['msgid'];
          msgid_plural = (typeof(buffer['msgid_plural']) != 'undefined' &&
                          buffer['msgid_plural'].length) ?
                            buffer['msgid_plural'] :
                            null;

          // find msgstr_* translations and push them on
          trans = [];
          for (str in buffer) {
            match = str.match(/^msgstr_(\d+)/);
            if (match)
              trans[parseInt(match[1], 10)] = buffer[str];
          }
          trans.unshift(msgid_plural);

          // only add it if we've got a translation
          // NOTE: this doesn't conform to msgfmt specs
          if (trans.length > 1) rv[msg_ctxt_id] = trans;

          buffer = {};
          lastbuffer = '';
        }

      // comments
      } else if (/^(#[^~]|#$)/.test(lines[i])) {
        continue;

      // msgctxt
      } else if (!!(match = lines[i].match(/^(?:#~ )?msgctxt\s+(.*)/))) {
        lastbuffer = 'msgctxt';
        buffer[lastbuffer] = deqoute(match[1]);

      // msgid
      } else if (!!(match = lines[i].match(/^(?:#~ )?msgid\s+(.*)/))) {
        lastbuffer = 'msgid';
        buffer[lastbuffer] = deqoute(match[1]);

      // msgid_plural
      } else if (!!(match = lines[i].match(/^(?:#~ )?msgid_plural\s+(.*)/))) {
        lastbuffer = 'msgid_plural';
        buffer[lastbuffer] = deqoute(match[1]);

      // msgstr
      } else if (!!(match = lines[i].match(/^(?:#~ )?msgstr\s+(.*)/))) {
        lastbuffer = 'msgstr_0';
        buffer[lastbuffer] = deqoute(match[1]);

      // msgstr[0] (treak like msgstr)
      } else if (!!(match = lines[i].match(/^(?:#~ )?msgstr\[0\]\s+(.*)/))) {
        lastbuffer = 'msgstr_0';
        buffer[lastbuffer] = deqoute(match[1]);

      // msgstr[n]
      } else if (!!(match = lines[i].match(/^(?:#~ )?msgstr\[(\d+)\]\s+(.*)/))) {
        lastbuffer = 'msgstr_'+match[1];
        buffer[lastbuffer] = deqoute(match[2]);

      // continued string
      } else if (/^(?:#~ )?"/.test(lines[i])) {
        buffer[lastbuffer] += deqoute(lines[i]);

      // something strange
      } else {
        errors.push('Strange line [' + i + '] : ' + lines[i]);
      }
    }


    // handle the final entry
    if (typeof(buffer['msgid']) != 'undefined') {
      msg_ctxt_id = (typeof(buffer['msgctxt']) != 'undefined' &&
                        buffer['msgctxt'].length) ?
                          buffer['msgctxt']+context_glue+buffer['msgid'] :
                          buffer['msgid'];
      msgid_plural = (typeof(buffer['msgid_plural']) != 'undefined' &&
                         buffer['msgid_plural'].length) ?
                           buffer['msgid_plural'] :
                           null;

      // find msgstr_* translations and push them on
      trans = [];
      for (str in buffer) {
        if (!!(match = str.match(/^msgstr_(\d+)/)))
          trans[parseInt(match[1], 10)] = buffer[str];
      }
      trans.unshift(msgid_plural);

      // only add it if we've got a translation
      // NOTE: this doesn't conform to msgfmt specs
      if (trans.length > 1) rv[msg_ctxt_id] = trans;

      buffer = {};
      lastbuffer = '';
    }

    // parse out the header
    if (rv[''] && rv[''][1]) {
      var cur = {};
      var hlines = rv[''][1].split(/\n/);
      for (var j=0; j<hlines.length; j++) {
        if (! hlines[j].length) continue;

        var pos = hlines[j].indexOf(':', 0);
        if (pos != -1) {
          var key = hlines[j].substring(0, pos);
          var val = hlines[j].substring(pos +1);

          if (cur[key] && cur[key].length) {
            errors.push('SKIPPING DUPLICATE HEADER LINE: ' + hlines[j]);
          } else if (/#-#-#-#-#/.test(key)) {
            errors.push('SKIPPING ERROR MARKER IN HEADER: ' + hlines[j]);
          } else {
            cur[key] = val.trim(); // strip leading and trailing space
          }

        } else {
          errors.push('PROBLEM LINE IN HEADER: ' + hlines[j]);
          cur[hlines[j]] = '';
        }
      }

      // replace header string with assoc array
      rv[''] = cur;
    } else {
      rv[''] = {};
    }

    // TODO: XXX: if there are errors parsing, what do we want to do?
    // GNU Gettext silently ignores errors. So will we.
    // alert( "Errors parsing po file:\n" + errors.join("\n") );
    if (errors.length) console.warn(errors.join('\n'));

    return rv;
  };

});

