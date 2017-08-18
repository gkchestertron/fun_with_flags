const cp           = require('child_process')
const style        = require('./style')
const fs           = require('fs')

module.exports = function (cmd, args, opts) {
  opts = opts || {};

  const tempFileName = Date.now() + '-fwf-cmd.sh'

  var result = {
        allTheData: '',
      },
      returnResults  = opts.returnResults === false
        ? false
        : true;
      writeToStdIn   = opts.writeToStdIn === false
        ? false
        : true;

  // delete options we don't want to pass to child_process.spawn()
  delete opts.returnResults;
  delete opts.writeToStdIn;

  // write the cmd as a bash script
  return new Promise(function (resolve, reject) {
    fs.writeFile(tempFileName, '#!/bin/bash\n'+cmd, err => {
      if (err)
        reject(err)
      else
        resolve()
    })
  })
  .then(() => {
    fs.chmodSync(tempFileName, 0755);
    return null
  })
  .then(() => {
    return new Promise((resolve, reject) => {
      var sp = cp.spawn('./' + tempFileName, args, opts);

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
  })
  .then(result => {
    return new Promise((resolve, reject) => {
      fs.unlink(tempFileName, (err) => {
        if (err)
          reject(err)
        else
          resolve(result)
      })
    })
  })
};
