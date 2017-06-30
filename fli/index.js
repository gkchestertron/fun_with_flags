var fwf = require('../fun-with-flags'),
    Promise = require('bluebird');

fwf.create({
  login: {
    description: 'prompts for username and password',

    display: function (result) {
      return fwf.style.select((target.username)) + ' ' + fwf.style.highlight('is totally logged in');
    },

    exec: function (target) {
      return fwf.prompt(['username', 'password'])
      .then(function (result) {
        target.username = result.username;
        console.log(fwf.style.info('logging in...'));
        return Promise.delay(1000, target);
      });
    }
  },

  curl: {
    description: '<url> calls shell to run curl on a url',

    display: function (result) {
      if (result.error)
        return fwf.style.error('command exited with a code of: '+result.exitCode);
      else
        return 'command exited with a code of: '+result.exitCode;
    },

    exec: function (target, url) {
      return fwf.shell('curl', [url]);
    }
  }
});
