
module.exports = function(grunt) {

  grunt.initConfig({
    "file-creator": {
        "createConfigFile": {
          "server/config.js": function(fs, fd, done) {
            fs.writeSync(fd, 'module.exports.youtubeKey = \'AIzaSyDt--PPbkglY1iFAKdOaeV54HcPYSP-QxU\';');
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