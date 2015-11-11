module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
        // con esto minimizamos archivos JS
				minified : {
						  files: {
							    src: [
								    'public/javascripts/admin.js',
								    'public/javascripts/clean-blog.js'
							    ],
							    dest: 'public/assets/js/'
						  },
						  options : {
							    sourcemap: false,
							    allinone: false
						  }
				},
				// convertimos sass en css
				sass: {                            			// Task
				    dist: {                            // Target
				      options: {                       // Target options
					        style: 'expanded',
					        sourcemap: 'none'
					      },
					      files: [{
						        expand: true,
						        cwd: 'public/stylesheets/scss/',
						        src: ['admin.sass','style.sass'],
						        dest: 'public/stylesheets/',
						        ext: '.css'
					      }]
				    }
			  },
			  //con esto unimos y minimizamos archivos CSS
		 		cssmin: {
		           combine: {
		                files: {
		                     "public/assets/css/admin.min.css":["public/stylesheets/admin.css"],
												 "public/assets/css/style.min.css":["public/stylesheets/style.css"]
		                }
							 }
				},
		    watch: {
			        scripts: {
				            files: ['public/javascripts/*.js'],
				            tasks: ['minified'],
				            options: {
				                spawn: false,
				            }
							},
			        css: {
								  files: ['public/stylesheets/scss/*.sass'],
								  //files: ['public/stylesheets/scss/partials/*.scss'],
								  tasks: ['sass','cssmin'],
								  options: {
								    	spawn: false,
								  }
							}
        }
		});

	grunt.loadNpmTasks('grunt-minified');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask("default", [ "minified","sass", "cssmin", "watch"]);
	
};
