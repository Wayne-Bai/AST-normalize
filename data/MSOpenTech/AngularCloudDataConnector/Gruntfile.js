/*
 * If you are using Visual Studio, there is an experimental plugin for managing grunt files from Visual Studio,
 * Go grab it here : https://visualstudiogallery.msdn.microsoft.com/8e1b4368-4afb-467a-bc13-9650572db708
 * 
 * More details about this plugin here : http://www.hanselman.com/blog/IntroducingGulpGruntBowerAndNpmSupportForVisualStudio.aspx
 */

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
    // Project configuration.
    grunt.initConfig({
         typescript: {
            core: {
                src: ['lib/angularjs/*.d.ts', 'lib/jquery/*.d.ts','src/core/*.ts'],
                dest :'dist/angular-cdc.js',
                options: {
                    declaration: true,
                    module: 'amd',
                    
                    sourcemap: true,
                    target: 'ES5',				
                },				
            },		 
            azure: {
                src: ['src/providers/AzureMobileServices/azureDataService.ts'],
                dest: 'dist/angular-cdc-azuremobileservices.js',	
                options: {
                    declaration: true,
                    module: 'amd',
                    sourcemap: true,
                    target: 'ES5',
                    
                },				
            },
				azuretableapi: {
                 src: ['src/providers/AzureTableStorageServices/azureStorageTableApi.ts'],
                 dest: 'dist/azureStorageTableApi.js',	
                 options: {
                     declaration: true,
                     module: 'amd',
                     sourcemap: true,
                     target: 'ES5',
                    
                 },				
            },
			azuretable: {
                src: ['src/providers/AzureTableStorageServices/azureTableStorageServices.ts'],
                dest: 'dist/angular-cdc-azureTableStorageServices.js',	
                options: {
                    declaration: true,
                    module: 'amd',
                    sourcemap: true,
                    target: 'ES5',
                    
                },				
            },
		azurequeueapi: {
                src: ['src/providers/AzureQueueStorageServices/azureStorageQueueApi.ts'],
                dest: 'dist/azureStorageQueueApi.js',	
                options: {
                    declaration: true,
                    module: 'amd',
                    sourcemap: true,
                    target: 'ES5',
                    
                },				
            },	
			azurequeue: {
                src: ['src/providers/AzureQueueStorageServices/AzureQueueStorageServices.ts'],
                dest: 'dist/angular-cdc-azureQueueStorageServices.js',	
                options: {
                    declaration: true,
                    module: 'amd',
                    sourcemap: true,
                    target: 'ES5',
                    
                },				
            },
				
			couchdb: {
                src: ['src/providers/CouchDB/CouchDB.ts'],
                dest: 'dist/angular-cdc-couchDB.js',	
                options: {
                    declaration: true,
                    module: 'amd',
                    sourcemap: true,
                    target: 'ES5',
                    
                },				
            },		
			restfull: {
                src: ['src/providers/ResetfulWebService/restfulDataService.ts'],
                dest: 'dist/angular-cdc-restfulDataService.js',	
                options: {
                    declaration: true,
                    module: 'amd',
                    sourcemap: true,
                    target: 'ES5',
                    
                },				
            },			
			amazon: {
                src: ['src/providers/AmazonWebServices/amazonDataService.ts'],
                dest: 'dist/angular-cdc-amazonDataService.js',	
                options: {
                    declaration: true,
                    module: 'amd',
                    sourcemap: true,
                    target: 'ES5',
                    
                },				
            },
            facebook: {
                src: ['lib/angularjs/*.d.ts', 'lib/jquery/*.d.ts','src/providers/FacebookServices/facebookDataService.ts'],
                dest: 'dist/experimental/angular-cdc-facebook.js',	
                options: {
                    declaration: true,
                    module: 'amd',
                    sourcemap: true,
                    target: 'ES5',
                    
                },				
            },
            /*
            //TODO : fix nitrogen provider
            nitrogen: {
                src: [ 'lib/jquery/*.d.ts','lib/angularjs/*.d.ts','http://api.nitrogen.io/client/nitrogen.js','src/providers/NitrogenServices/nitrogenDataService.ts'],
                dest: 'dist/experimental/NitrogenService.js',	
                options: {
                    declaration: false,
                    module: 'amd',
                    sourcemap: true,
                    target: 'ES5',
                    
                },				
            },*/
            ordrin: {
                src: ['lib/angularjs/*.d.ts', 'lib/jquery/*.d.ts','src/providers/OrdrinServices/ordrinDataService.ts'],
                dest: 'dist/experimental/angular-cdc-ordrin.js',	
                options: {
                    declaration: true,
                    module: 'amd',
                    sourcemap: true,
                    target: 'ES5',
                    
                },				
            },
            twitter: {
                src: ['lib/angularjs/*.d.ts', 'lib/jquery/*.d.ts','src/providers/OrdrinServices/twitterDataService.ts'],
                dest: 'dist/experimental/angular-cdc-twitter.js',
                options: {
                    declaration: true,
                    module: 'amd',
                    sourcemap: true,
                    target: 'ES5',
                        
                },				
            },			
    
        },
	
		copy: {
			main: {
			src: 'src/providers/CouchDB/jquery.couch.js',
			dest: 'dist/jquery.couch.js',
			},
			},		
        watch: {
            core: {
                files: ['src/core/*.ts'],
                tasks: ['typescript:core'],
                options: {
                    spawn: false,
                },
            },
            azure: {
                files: ['src/providers/AzureMobileServices/*.ts'],
                tasks: ['typescript:azure'],
                options: {
                    spawn: false,
                },
            },
			azuretableapi: {
                files: ['src/providers/AzureTableStorageServices/azureStorageTableApi.ts'],
                tasks: ['typescript:azuretableapi'],
                options: {
                    spawn: false,
                },
            },
			azuretable: {
                files: ['src/providers/AzureMobileServices/AzureTableStorageServices.ts'],
                tasks: ['typescript:azuretable'],
                options: {
                    spawn: false,
                },
            },
			azurequeue: {
                files: ['src/providers/AzureQueueStorageServices/AzureQueueStorageServices.ts'],
                tasks: ['typescript:azurequeue'],
                options: {
                    spawn: false,
                },
            },
			azurequeueapi: {
                src: ['src/providers/AzureQueueStorageServices/azureStorageQueueApi.ts'],
                tasks: ['typescript:azurequeueapi'],
                options: {
                    spawn: false,
                },
            },
			couchdb: {
                files: ['src/providers/CouchDB/CouchDB.ts'],
                tasks: ['typescript:couchdb'],
                options: {
                    spawn: false,
                },
            },
			restfull: {
                files: ['src/providers/ResetfulWebService/*.ts'],
                tasks: ['typescript:restfull'],
                options: {
                    spawn: false,
                },
            },
            amazon:{
                files: ['src/providers/AmazonWebServices/*.ts'],
                tasks: ['typescript:amazon'],
                options: {
                    spawn: false,
                },
            },
            facebook: {
                files: ['src/providers/FacebookServices/*.ts'],
                tasks: ['typescript:facebook'],
                options: {
                    spawn: false,
                },
            },
            nitrogen: {
                files: ['src/providers/NitrogenServices/*.ts'],
                tasks: ['typescript:nitrogen'],
                options: {
                    spawn: false,
                },
            },
            ordrin: {
                files: ['src/providers/OrdrinServices/*.ts'],
                tasks: ['typescript:ordrin'],
                options: {
                    spawn: false,
                },
            },
            twitter: {
                files: ['src/providers/TwitterServices/*.ts'],
                tasks: ['typescript:twitter'],
                options: {
                    spawn: false,
                },
            },
        }
    });
    grunt.registerTask('default', ['typescript','copy']);
}