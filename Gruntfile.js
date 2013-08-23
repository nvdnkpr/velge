module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    coffee: {
      compile: {
        options: {
          bare: false
        },
        files: {
          'dist/<%= pkg.name %>.js': 'lib/<%= pkg.name %>.coffee',
          'test/velge_test.js': 'test/velge_test.coffee'
        }
      }
    },

    uglify: {
      options: {
        report: 'min'
      },
      dist: {
        src: 'dist/velge.js',
        dest: 'dist/velge.min.js'
      }
    },

    mocha: {
      src: ['test/test.html'],
      options: {
        bail: true,
        log: true,
        run: true,
        mocha: {
          ignoreLeaks: true
        }
      }
    },

    watch: {
      files: ['lib/*.coffee', 'test/*.coffee'],
      tasks: ['coffee:compile']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha');

  grunt.registerTask('test',    ['coffee:compile', 'mocha']);
  grunt.registerTask('default', ['test']);
  grunt.registerTask('release', ['coffee:compile', 'mocha', 'uglify']);
};
