var Q = require('q'),
    path = require('path'),
    format = require('util').format,
    print = require('../../../../../../helper/print'),
    pathHelper = require('../../../../../../helper/path'),
    download = require('../../../../lib/nomad/provisioning/download'),
    install = require('../../../../lib/nomad/provisioning/install');

function fetch(t, r) {
    var downloadDest = pathHelper.resolve(r.path, format('%s_downloaded.mobileprovision', t));
    return download(
        r.apple_id,
        r.apple_developer_team,
        r.password,
        r[format('%s_provisioning_profile_name', t)],
        downloadDest,
        r.options.verbose
    ).then(function () {
        return install(
            downloadDest,
            false, // do not remove the downloaded.mobileprovision file after install
            r.options.verbose
        );
    }).then(function () {
        r[format('%s_provisioning_profile_path', t)] = downloadDest;
        return r;
    });
}

module.exports = function (response) {
    if (!response.adhoc_provisioning_profile_name && !response.store_provisioning_profile_name)
        return Q.resolve(response);
    return fetch('adhoc', response).then(function (resp) { return fetch('store', resp); });
};
