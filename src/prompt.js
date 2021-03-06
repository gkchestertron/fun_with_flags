prompt = require('prompt');

module.exports = function (prompts) {
  return new Promise(function (resolve, reject) {
    prompt.start();

    prompt.message = '';

    prompt.get(prompts, function (err, result) {
      prompt.pause();
      if (err)
        reject(err)
      else
        resolve(result);
    });
  });
};
