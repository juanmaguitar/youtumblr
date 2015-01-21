module.exports = function(grunt) {

  grunt.initConfig({
    distFolder: '_dist',
    devFolder: '_src',
    pkg: grunt.file.readJSON('package.json')
  });

  // jasmine
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.config('jasmine', {
    pivotal: {
      src: [
         '<%= devFolder %>/js/plugins/*.js',
          '<%= devFolder %>/js/config.js',
          '<%= devFolder %>/js/auth.js',
          '<%= devFolder %>/js/tumblr.js',
          '<%= devFolder %>/js/youtube.js',
          '<%= devFolder %>/js/main.js'
      ],
      options: {
        specs: '<%= devFolder %>/specs/*spec.js',
        vendor: [
          '<%= devFolder %>/bower_components/jquery/dist/jquery.js',
          '<%= devFolder %>/bower_components/bluebird/js/browser/bluebird.js',
          '<%= devFolder %>/modernizr/modernizr.custom.js',
          '<%= devFolder %>/modernizr/details/details-test.js'
        ]
      }
    }
  });

  // targethtml
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.config('compass', {
    dev: {
      options: {
        sassDir: ['_src/scss'],
        cssDir: ['_src/css'],
        outputStyle : 'nested',
        sourcemap: true,
        environment: 'development'
      }
    },
    prod: {
      options: {
       sassDir: ['_src/scss'],
       cssDir: ['_dist'],
       outputStyle : 'compressed',
       environment: 'production'
      }
    }
  });

  // targethtml
  grunt.loadNpmTasks('grunt-targethtml');
  grunt.config('targethtml', {
    dev: {
      files: {
        'index.html' : 'index.html.tpl'
      }
    },
    prod: {
      files: {
        'index.html' : 'index.html.tpl'
      }
    }
  });

  // jshint
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.config('jshint', {
    files: [
      'Gruntfile.js',
      '<%= devFolder %>/modernizr/details/*.js',
      '<%= devFolder %>/js/plugins/*.js',
      '<%= devFolder %>/js/*'
    ],
    options: {
      // options here to override JSHint defaults
      "expr" : true,
      globals: {
        jQuery: true,
        console: true,
        module: true,
        document: true
      }
    }
  });

  /* concat */
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.config('concat', {
      options: {
       separator: ';'
      },
      dist: {
        src: [
          '<%= devFolder %>/bower_components/jquery/dist/jquery.js',
          '<%= devFolder %>/bower_components/bluebird/js/browser/bluebird.js',
          '<%= devFolder %>/modernizr/modernizr.custom.js',
          '<%= devFolder %>/modernizr/details/details-test.js',
          '<%= devFolder %>/js/plugins/*.js',
          '<%= devFolder %>/js/config.js',
          '<%= devFolder %>/js/auth.js',
          '<%= devFolder %>/js/*.js',
          '<%= devFolder %>/js/main.js'
        ],
        dest: '<%= devFolder %>/tmp/<%= pkg.name %>.js'
      }
  });

  /* uglify */
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.config('uglify', {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          '<%= distFolder %>/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>' ],
          '<%= distFolder %>/details-pollyfill.min.js': ['modernizr/details/details-pollyfill.js' ]
        }
      }
  });

  /* watch */
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.config('watch', {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
  });


  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('dev', ['jshint', 'targethtml:dev', 'compass:dev']);
  grunt.registerTask('prod', ['jshint', 'targethtml:prod', 'concat', 'uglify', 'compass:prod']);
  grunt.registerTask('default', ['jshint', 'targethtml:dev', 'compass:dev']);

};