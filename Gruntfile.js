
module.exports = function(grunt) {

  grunt.initConfig({
    "file-creator": {
        "createConfigFile": {
          "server/config.js": function(fs, fd, done) {
            //The option is taking in the API key, which is decrypted and passed
            //to grunt at build time by Travis
            fs.writeSync(fd, 'module.exports.youtubeKey = \'' + grunt.option('ytKey') + '\';');
            done();
          }
        }
      }
  });

  grunt.loadNpmTasks('grunt-file-creator');
  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('build', function(n) {
    grunt.task.run([ 'file-creator:createConfigFile' ] );
  });
};