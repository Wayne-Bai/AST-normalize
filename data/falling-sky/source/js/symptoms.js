/*global GIGO, jQuery, alert, Browser, $gt */
/*jslint browser: true */

/*jslint regexp: true */

/* Map equivalents of ASNs that arent really tunnels or distinct ISPS.
   First level: asn4
     Second level: asn6
        Third level: "1"  
        */

GIGO.asn_same = {
    "comcast": [7922, 7853, 7757, 7725, 7016, 7015, 6161, 53297, 393232, 36733, 36732, 36377, 36196, 33668, 33667, 33666, 33665, 33664, 33663, 33662, 33661, 33660, 33659, 33658, 33657, 33656, 33655, 33654, 33653, 33652, 33651, 33650, 33542, 33491, 33490, 33489, 33287, 23266, 23253, 22909, 22258, 21508, 20214, 16748, 14668, 13385, 13367, 11025],
    "surewest": [14051],
    "aarnet": [757, 56132],
    "tmobile-usa": [21928, 22140],
    "att": [7132, 7018, 6389]
};

GIGO.asn_native = {
    668: 1 /* DREN, native non-tunnel provider */
};


GIGO.ministates = function (which) {
    var s, i, key, v, tests;

    tests = GIGO.results.tests; // Convenience
    s = ""; // Build up return value
    for (i = 0; i < which.length; i = i + 1) {
        key = which[i];
        try {
            v = GIGO.results.tests["test_" + key].status.charAt(0);
        } catch (e) {
            v = "?";
        }
        s = s + v;
    }
    return s;
};

GIGO.find_evidence_of_noscript = function (tests, res) {
    var i, key_json, key_img, test_json, test_img, key, keys, blocked;
    keys = ["a", "aaaa", "ds", "ipv4", "ipv6", "v6mtu", "v6ns", "dsmtu"];
    for (i = 0; i < keys.length; i = i + 1) {
        key = keys[i];
        key_json = "test_" + key;
        key_img = "test_" + key + "_img";
        if (tests.hasOwnProperty(key_img)) {
            test_json = tests[key_json].status;
            test_img = tests[key_img].status;
            if (test_img.match(/^[os]/)) {
                if (test_json.match(/^[bt]/)) {
                    blocked = tests[key_json].url;
                    //alert("test " + key + "was blocked by a browser add-on.  Please configure your browser plugins (such as NoScript or AdBlock) to permit " + blocked + " and try this site again.");
                    res.push("webfilter:addons");
                    if (Browser.firefox) {
                        res.push("webfilter:firefox");
                    }
                    if (Browser.opera) {
                        res.push("opera");
                    }
                    res.push("webfilter:test_" + key);
                    blocked = blocked.replace(/fill=xxxx*/, "fill=xxx...xxx"); // Obscene to show a nearly 2k url
                    // Fake the gettext portion.  We need to insert text into that dynamically based on local conditions.
                    GIGO.messages["webfilter:test_" + key] = "[% 'Your browser blocked' | i18n | escape_quotes %]" + " " + blocked;

                    GIGO.scores["webfilter:test_" + key] = [10, 10, "ORANGE"];

                }
            }
        }
    }


};

GIGO.fallback_to_image_tests = function (tests, res) {
    // If the json was bad, but we have an image that worked, fudge it all.
    var keys, i, key, key_json, key_img, test_json, test_img;
    keys = ["a", "aaaa", "ds", "ipv4", "ipv6", "v6mtu", "v6ns", "dsmtu"];
    for (i = 0; i < keys.length; i = i + 1) {
        key = keys[i];
        key_json = "test_" + key;
        key_img = "test_" + key + "_img";
        if (tests.hasOwnProperty(key_img)) {

            test_json = tests[key_json].status;
            test_img = tests[key_img].status;
            if (test_img.match(/^[os]/)) {
                if (test_json.match(/^[bt]/)) {
                    // Copy the IMAGE result data.
                    tests["failed_" + key] = tests[key_json];
                    tests[key_json] = tests[key_img];
                    GIGO.update_status("test_" + key);
                    GIGO.update_url("test_" + key);
                    GIGO.show_debug();

                    if (key === "ds") {
                        tests.failed_test_ds4 = tests.test_ds4;
                        tests.failed_test_ds6 = tests.test_ds6;
                        tests.test_ds4 = tests.test_ds_img;
                        tests.test_ds6 = tests.test_ds_img;
                        GIGO.update_status("test_ds4");
                        GIGO.update_status("test_ds6");
                        GIGO.update_url("test_ds4");
                        GIGO.update_url("test_ds6");
                        GIGO.show_debug();
                    }


                }
            }
        }
    }


};

GIGO.dedupe_res = function (res) {
    var ret, unique, i;
    ret = [];
    unique = {};
    if (res.length) {
        for (i = 0; i < res.length; i = i + 1) {
            if (!(unique).hasOwnProperty(res[i])) {
                ret.push(res[i]);
                unique[res[i]] = 1;
            }
        }
    }
    return ret;
};


GIGO.ipinfo_in_tests = function (tests, name) {
    var keys, key, i;
    keys = ["a", "aaaa", "ds", "ipv4", "ipv6", "v6mtu", "v6ns", "dsmtu"];
    for (i = 0; i < keys.length; i = i + 1) {
        key = "test_" + keys[i];
        if (tests.hasOwnProperty(key)) {
            if (tests[key].hasOwnProperty("ipinfo")) {
                if (tests[key].ipinfo.hasOwnProperty(name)) {
                    return tests[key].ipinfo[name];
                }
            }
        }
    }
    return null;
};

GIGO.check6RD = function (addr4, addr6) {
    var i, bytes, addr4Bits, addr6Bits, chunk, index;

    // Now process the IPv4 address by generating a string of 32 '0' or '1' based on the host address
    bytes = addr4.split('.');
    addr4Bits = '';
    for (i = 0; i < 4; i = i + 1) {
        chunk = parseInt(bytes[i], 10).toString(2);
        while (chunk.length < 8)
            chunk = '0' + chunk;
        addr4Bits = addr4Bits + chunk;
    }

    // Now process the IPv6 address by generating a string of 64 '0' or '1' based on the /64 prefix
    bytes = addr6.split(':');
    // We will however skip the first IPv6::/32 
    addr6Bits = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

    // And include instead only the second //32
    for (i = 2; i < 4; i = i + 1) {
        chunk = parseInt(bytes[i], 16).toString(2);
        while (chunk.length < 16)
            chunk = '0' + chunk;
        addr6Bits = addr6Bits + chunk;
    }

    // Now check whether full or at least 16 bits of the IPv4 is embedded into the IPv6 prefix
    while (addr4Bits.length >= 16) {
        index = addr6Bits.indexOf(addr4Bits); // Is part of the IPv4 address embedded in the /64 of IPv6?
        if (index >= 0)
            return addr4Bits.length + " bits of the IPv4 address are embedded in the IPv6 address starting at " + index;
        // Else, remove one leading bit of addr4
        addr4Bits = addr4Bits.substr(1, addr4Bits.length - 1);
    }
    return 0
}

GIGO.identify_symptoms = function () {
    var a, aaaa, ds4, ds6, ipv4, ipv6, v6mtu, v6ns, tunnel, tunnel_6rd, teredo, sixfour, mini_primary, mini_secondary, res, failed_pmtud, x, x_array, i, tests, via, dsmtu, a, b, ia, ib, a4, a6, k, i, r, f4, f6;

    res = [];
    tests = GIGO.results.tests; // Convenience
    GIGO.find_evidence_of_noscript(tests, res);
    GIGO.fallback_to_image_tests(tests, res); // Hmm, we might use image connection data instead.
    a = tests.test_a.status;
    aaaa = tests.test_aaaa.status;
    ds4 = tests.test_ds4.status;
    ds6 = tests.test_ds6.status;
    ipv4 = tests.test_ipv4.status;
    ipv6 = tests.test_ipv6.status;
    v6mtu = tests.test_v6mtu.status;
    v6ns = tests.test_v6ns.status;
    dsmtu = tests.test_dsmtu.status;

    // HTTP proxies?
    via = GIGO.ipinfo_in_tests(tests, "via");

    // Tunnels?
    tunnel = (GIGO.results.ipv4.asn !== GIGO.results.ipv6.asn) && GIGO.results.ipv4.asn && GIGO.results.ipv6.asn;
    teredo = (GIGO.results.ipv6.subtype === "Teredo");
    sixfour = (GIGO.results.ipv6.subtype === "6to4");
    if (GIGO.results.ipv4.ip && GIGO.results.ipv6.ip)
        tunnel_6rd = GIGO.check6RD(GIGO.results.ipv4.ip, GIGO.results.ipv6.ip);
    else
        tunnel_6rd = 0;





    // ASN similarities?  Based on mod_ip ASN list
    if ((GIGO.results.ipv4.asnlist) && (GIGO.results.ipv6.asnlist)) {
        a = GIGO.results.ipv4.asnlist.split(";");
        b = GIGO.results.ipv6.asnlist.split(";");
        for (ia = 0; ia < a.length; ia = ia + 1) {
            for (ib = 0; ib < b.length; ib = ib + 1) {
                if (a[ia] === b[ib]) {
                    //alert("No tunnel. asn match found with asn" + a[ia]);
                    tunnel = 0;
                }
            }
        }
    }

    // ASN equivalents?  Based on static GIGO.asn_same table  (yuck!)
    if ((GIGO.results.ipv4.asn) && (GIGO.results.ipv6.asn)) {
        a4 = parseInt(GIGO.results.ipv4.asn, 10);
        a6 = parseInt(GIGO.results.ipv6.asn, 10);
        for (k in GIGO.asn_same) {
            if (GIGO.asn_same.hasOwnProperty(k)) {
                r = GIGO.asn_same[k];
                for (i = 0; i < r.length; i = i + 1) {
                    if (r[i] === a4) f4 = 1;
                    if (r[i] === a6) f6 = 1;
                }
                if (f4 && f6) tunnel = 0;
            }
        }
    }

    // Sometimes we know that there is an IPv6 provider that is not a tunnel.
    // DREN for example.
    if (GIGO.results.ipv6.ip) {
        a6 = parseInt(GIGO.results.ipv6.asn, 10);
        if (GIGO.asn_native[a6]) {
            tunnel = 0;
        }
    }
    GIGO.helpdesk.tunnel = tunnel; // Save for later.
    GIGO.helpdesk.teredo = teredo; // save for later
    GIGO.helpdesk.sixfour = sixfour; // save for later




    mini_primary = GIGO.ministates(["a", "aaaa", "ds4", "ds6"]);
    mini_secondary = GIGO.ministates(["ipv4", "ipv6", "v6mtu", "v6ns"]);

    GIGO.helpdesk.mini_primary = mini_primary;
    GIGO.helpdesk.mini_secondary = mini_secondary;


    //    alert("mini_primary " + mini_primary + " secondary " + mini_secondary);


    // Convert the JSON table entry to a series of initial elements
    x = GIGO.sym_primary[mini_primary];
    x_array = x.split(",");

    for (i = 0; i < x_array.length; i = i + 1) {
        res.push(x_array[i]);
    }



    // IPv6 Flag Day  - does DUAL STACK choke?
    // Only do this, if IPv4 appears to work, or IPv6 appears to work.
    // (Otherwise, some Firefox plugin is screwing us again.)
    if (dsmtu === "ok") {
        res.unshift("dualstack:safe");
    } else {
        res.unshift("dualstack:unsafe");
    }

    if ((!teredo) && (!sixfour)) {
        if (tunnel) {
            res.unshift("tunnel_dumb");
        } else if (tunnel_6rd) {
            res.unshift("tunnel_6rd_dumb");
        }
    }

    if (via) {
        res.unshift("proxy_via_dumb");
    }


    // Do we have IP addresses?
    if ((!GIGO.results.ipv4.ip) && (!GIGO.results.ipv6.ip)) {
        res.unshift("no_address");
    } else if (!GIGO.results.ipv4.ip) {
        res.unshift("ipv4:no_address");
    } else if (!GIGO.results.ipv6.ip) {
        res.unshift("ipv6:no_address");
    }


    // IPv4 preferred despite dual stack (and not teredo or fixfour)
    if ((!teredo) && (!sixfour)) {
        if ((GIGO.results.ipv4.ip) && (GIGO.results.ipv6.ip)) {
            if (mini_primary.match(/^[os][os][os][bt]/)) {
                res.unshift("avoids_ipv6");
            }
        }
    }


    // Do we have direct IP access?
    if (mini_secondary.match(/^[bst][bst]/)) {
        res.push("No Direct IP"); // Not at all!     
    } else if ((mini_secondary.match(/^[bt]./)) && (mini_primary.match(/^[os]./))) {
        0; // res.push("No Direct IPv4");  // Leave this for the NAT64 messaging
    } else if ((mini_secondary.match(/^.[bt]/)) && (mini_primary.match(/^.[os]/))) {
        res.push("No Direct IPv6");
    }

    if ((mini_primary.match(/o/)) && (mini_secondary.match(/^ttt/))) {
        // If at least a single name-based lookup worked, but all IP based ones were timeouts
        // both IPv4 and IPv6, then we more strongly suspect a filtering plugin.
        //  RequestPolicy follows this pattern.
        if (Browser.Engine.gecko) {
            res.push("ip_timeout:firefox");
        }
        // Specifically, those were TIMEOUTS
    }

    // NAT64?
    if ((mini_primary.match(/^[os][os]/)) && (mini_secondary.match(/^[bt][os]/))) {
        res.push("NAT64");
    }

    // Other transition technologies
    if (teredo) {
        if (aaaa === "bad") {
            res.push("teredo-minimum");
        } else if (mini_primary.match(/^..[os]b/)) {
            // a aaaa ds4 ds6
            // If IPv4 is preferred, don't penalize the scores so hard.
            res.unshift("teredo-v4pref");
        } else {
            res.push("teredo");
        }
    }
    if (sixfour) {
        res.push("6to4");
    }
    if ((!teredo) && (aaaa === "bad") && (ipv6 === "ok")) {
        // Sort of like teredo-minimum.  But with a global address.
        res.push("ipv6:nodns");
    }

    // What about IPv6 only DNS server
    if ((ds4 === "ok") || (ds4 === "slow") || (ds6 === "ok") || (ds6 === "slow")) {
        if ((v6ns === "ok") || (v6ns === "slow")) {
            res.push("v6ns:ok");
        } else {
            res.push("v6ns:bad");
        }
    }


    // Buggy DNS server, mangling first AAAA 32 bits into A?
    if (tests.hasOwnProperty("test_buggydns1")) {
        if (tests.test_buggydns1.status === "affected") {
            res.push("buggydns1");
        }
    }

    // Did our larger request work ok?
    if (Browser.opera) {
        // Opera always fails the 1600 byte test.  WTF?
        if ((aaaa === "ok") && ((v6mtu === "timeout") || (v6mtu === "slow"))) {
            res.push("IPv6 MTU"); // Uh oh, MTU problems.
            failed_pmtud = 1;
        }
    } else {
        if ((aaaa === "ok") && ((v6mtu === "bad") || (v6mtu === "timeout") || (v6mtu === "slow") || (dsmtu === "bad") || (dsmtu === "timeout") || (dsmtu === "slow"))) {
            res.push("IPv6 MTU"); // Uh oh, MTU problems.
            failed_pmtud = 1;
        }
    }
    GIGO.helpdesk.failed_pmtud = failed_pmtud;


    for (i = 0; i < res.length; i += 1) {

        if (failed_pmtud) {
            if (res[i] === "dualstack:safe") {
                res[i] = "dualstack:mtu";
            }
            if (res[i] === "dualstack:unsafe") {
                res[i] = "dualstack:mtu";
            }
        }

        // Apple DNS bug.  "A" record was fine.
        // Dual stack , for some reason, is bad.
        if (Browser.Platform.mac || Browser.Platform.ios) {
            if (res[i] === 'confused:obbo') {
                res[i] = "apple:dnsbug_aaaa"; // Failed to connect to AAAA but dual stack says it shoulda
            }
            if (res[i] === 'confused:ASK') {
                if (mini_primary.match(/^obb[sob]/)) {
                    res[i] = "apple:dnsbug_aaaa"; // Failed to connect to AAAA but dual stack says it shoulda
                }
            }
        }
        if (res[i] === 'confused:ASK') {
            if ((mini_primary.match(/^ottt/)) && (mini_secondary.match(/^ottt/))) {
                res[i] = "broken_ipv6";
            }
        }
    }

    if (res.length === 0) {
        res.push("Unknown");
    }
    res = GIGO.dedupe_res(res);
    return res;

};
