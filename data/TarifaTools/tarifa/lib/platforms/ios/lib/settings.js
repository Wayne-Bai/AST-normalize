module.exports = {
    main : {
        // default apple developer identity for release build
        default_apple_developer_identity: 'iPhone Distribution'
    },
    external: {
        ios: {
            name : 'ios',
            description : 'Needed to interact with apple provisioning portal',
            install : 'gem install nomad-cli',
            platform : 'ios',
            os_platforms: ['darwin'],
            print_version: 'ios -v'
        },
        xcrun: {
            name : 'xcrun',
            description: 'generate ipa files',
            platform : 'ios',
            os_platforms: ['darwin'],
            print_version: 'xcrun --version'
        }
    }
};
