var path = require('path'),
    cordovaDeployPath = path.resolve(
        __dirname,
        '..', '..', '..', '..',
        'node_modules',
        'cordova-deploy-windows-phone',
        'CordovaDeploy',
        'bin',
        'Release',
        'CordovaDeploy.exe'
    ),
    xapSignToolPath = path.resolve(
        '/',
        'Program Files\ (x86)',
        'Microsoft\ SDKs',
        'Windows\ Phone',
        'v8.0',
        'Tools',
        'XapSignTool',
        'XapSignTool.exe'
    );

module.exports = {
    external: {
        cordovadeploy : {
            name : cordovaDeployPath,
            description: 'deploy app to device',
            os_platforms: ['win32']
        },
        xapsigntool : {
            name : xapSignToolPath,
            description: 'sign app',
            os_platforms: ['win32']
        }
    }
};
