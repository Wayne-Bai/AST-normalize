var path = require('path'),
    root = __dirname,
    questions = [
        'deploy/apple_id',
        'deploy/apple_password',
        'deploy/has_apple_developer_team',
        'deploy/apple_developer_team',
        'deploy/adhoc_apple_developer_identity',
        'deploy/adhoc_provisioning_profile_name',
        'deploy/store_apple_developer_identity',
        'deploy/store_provisioning_profile_name'
    ];

module.exports = questions.map(function (question) {
    return path.resolve(root, question);
});
