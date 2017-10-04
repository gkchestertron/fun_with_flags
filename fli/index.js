var fwf = require('../fun-with-flags');

fwf.create({
  echo: {
    description: '<...str> print a naked string (so long as it isn\'t a valid subcommand',

    exec: (target, ...str) => str.join(' '),

    replace: {
      description: '<pattern> <replacement> <...str> replace by pattern within a naked string',

      exec: (target, pattern, replacement, ...str) => 
        str.join(' ').replace(pattern, replacement)
    },

    flags: {
      r: {
        description: 'reverse output',

        postExec: (target, result) => result.split('').reverse().join(''),

        takeArg: false
      }
    }
  }
});
