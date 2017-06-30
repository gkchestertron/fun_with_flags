var cp    = require('child_process'),
    style = require('./style');

module.exports = function (cmd, args, opts) {
  opts = opts || {};

  var result = {
        allTheData: '',
      },
      returnResults  = opts.returnResults === false
        ? false
        : true;
      writeToStdIn  = opts.writeToStdIn === false
        ? false
        : true;

  delete opts.returnResults;
  delete opts.writeToStdIn;

  return new Promise(function (resolve, reject) {
    var sp = cp.spawn(cmd, args, opts);

    sp.stdout.on('data', function (data) {
      result.allTheData += data.toString();
      if (writeToStdIn)
        process.stdout.write(data.toString());
    });

    sp.stdin.on('data', function (data) {
      process.stdout.write(data.toString());
    });

    sp.stderr.on('data', function (data) {
      result.error = result.error || '';
      result.error += data.toString();
      process.stdout.write(style.error(data.toString()));
    });

    sp.on('close', function (code) {
      result.exitCode = code;
      if (returnResults)
        resolve(result);
      else
        resolve('');
    });

    sp.on('error', function (err) {
      reject(err);
    });
  })
};
