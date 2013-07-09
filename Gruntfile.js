module.exports = function(grunt) {

	var path = require('path');

	grunt.initConfig({
		jsvalidate: {
			files: ['*.js', 'src/*.js']
		},
		browserify2: {
			dev: {
				entry: './src/app.js',
				compile: './js/app.js',
				debug: true
			},
			prod: {
				entry: './src/app.js',
				compile: './js/app.js'
			},
		},
		handlebars: {
			compile: {
				options: {
					wrapped: true,
				 	namespace: 'Handlebars.templates',
				 	processName: function(filename) {
   						return path.basename(filename, '.hbs')
				 	}
				},
				files: {
					"./js/templates.js": "./templates/*.hbs"
				}
			}

		},
		watch: {
			scripts: {
				files: ['src/*.js', "*js"],
				tasks: ['devcompile']
			},
			templates: {
				files: ['templates/*.hbs'],
				tasks: ['handlebars:compile']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browserify2');
	grunt.loadNpmTasks('grunt-jsvalidate');
	grunt.loadNpmTasks('grunt-contrib-handlebars');

	grunt.registerTask('compile', ['jsvalidate', 'browserify2:prod']);
	grunt.registerTask('devcompile', ['jsvalidate', 'browserify2:dev']);

	// Default task(s).
	grunt.registerTask('default', ['jsvalidate']);
};