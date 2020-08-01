module.exports = {
    encore: {
        options: {
            report: 'gzip'
        },
        dest: '<%= config.dist %>/<%= config.fileName %>.min.css',
        src: '<%= config.dist %>/<%= config.fileName %>.css'
    }
};