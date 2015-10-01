
module.exports = function(grunt) {

  grunt.initConfig({

    "file-creator": {
        "createConfigFile": {
          "server/config.js": function(fs, fd, done) {
            //The option is taking in the API key, which is decrypted and passed
            //to grunt at build time by Travis; note that encryption is repo-specific (i.e., each fork will use different encryption keys)
            fs.writeSync(fd, 'module.exports.youtubeKey = \'' + grunt.option('ytKey') + '\';');
            done();
          }
        }
      },
    "nodemon": {
         dev: {
           script: 'server/server.js'
         }
       },

    "shell": {
          mochaTest: {
            command: 'npm run mochaTest'
          },
          karmaTest: {
            command: ['npm run karmaTest',
                      'killall node'].join('&&')
          }
        }
  });

  grunt.registerTask('runServer', function () {
    var nodemon = grunt.util.spawn({
             cmd: 'grunt',
             grunt: true,
             args: 'nodemon'
        });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);
  });

  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-file-creator');
  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('build', function(n) {
    grunt.task.run([ 'file-creator:createConfigFile' ] );
  });
  grunt.registerTask('test', function(n) {
    grunt.task.run([ 'shell:mochaTest' ] );
    grunt.task.run([ 'runServer'] );
    grunt.task.run([ 'shell:karmaTest' ] );
  });
};
