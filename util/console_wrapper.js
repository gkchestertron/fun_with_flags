module.exports = function (cb) {
  var str = '',
      old_stdout = process.stdout.write;

  process.stdout.write = function () {
    var args = Array.prototype.slice.call(arguments);

    str += args.join('');
  }

  cb();

  process.stdout.write = old_stdout;

  return str;
};
