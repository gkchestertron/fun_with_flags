var _       = require('underscore');
var P       = require('bluebird');
var fs      = require('fs');
var rawArgs = process.argv.slice(2);
var args    = [];
var flags   = {};
var options = {};
var arg;
var option;
var flag;

// iterate through passed arguments, flags, and options
while (arg = rawArgs.shift()) {

  // passed option with --option
  if (/^--/.test(arg)) {
    arg = arg.slice(2);

    // if we have = sign, set value
    if (/=/.test(arg))
      options[arg.split('=')[0]] = arg.split('=')[1];

    // if we don't have equals but the next thing is not another flag 
    // or option, set value
    else if (rawArgs[0] && !/^-/.test(rawArgs[0]))
      options[arg] = parseArg(rawArgs.shift());

    // set to null to indicate flag was passes
    else
      options[arg] = null;
  }

  // passed flag with -f
  else if (/^-/.test(arg)) {
    arg = arg.slice(1).split(''); // get just the letters

    // run through flags if multiple
    for (var i in arg) {
      // if the next thing is a value, set it to the flag
      if (rawArgs[0] && !/^-/.test(rawArgs[0]))
        flags[arg[i]] = parseArg(rawArgs.shift());

      // set to null to indicate that the flag was passed
      else
        flags[arg[i]] = null;
    }
  }

  // plain arg (not flag or option)
  else {
    args.push(arg);
  }
}

/**
 * parses an arg to convert booleans/null from strings to real values
 * @param {string} arg - arg to parse
 * @returns {mixed} - parsed arg
 */
function parseArg(arg) {
    if (arg === 'true')
        return true;
    else if (arg === 'false')
        return false;
    else if (arg === 'null')
        return null;
    return arg;
}

function runFlags(scriptObj, args, flags, options) {
    var obj    = scriptObj,
        target = {},
        result = {},
        parentFlags   = scriptObj.flags   || {},
        parentOptions = scriptObj.options || {},
        firstArg = args[0];


    while (obj[args[0]]) {
        // allways give help if -h is passed
        if (args.length === 1 && obj[args[0]].exec && flags.h !== undefined)
          break;
        obj = obj[args.shift()];
        obj.flags   = obj.flags   || {};
        obj.options = obj.options || {};
        parentFlags   = _.extend(obj.flags, parentFlags);
        parentOptions = _.extend(obj.options, parentOptions);
    }

    args.unshift(target);

    if (obj.exec) {
        // add the flags to the target
        _.each(obj.flags, function (flag, flagName) {
            var name = flag.name || flagName;

            if (_.has(flags, flagName))
                target[name] = flags[flagName];
        });

        // add the options to the target
        _.each(obj.options, function (option, optionName) {
            var name = option.name || optionName;

            if (_.has(options, optionName))
                target[name] = options[optionName];
        });

        // run the exec function for each flag
        var flagExecs = _.filter(obj.flags, function (flag, flagName) {
            return !!flag.exec && _.has(flags, flagName);
        });

        // run the exec function for each option
        var optionExecs = _.filter(obj.options, function (option, optionName) {
            return !!option.exec && _.has(options, optionName);
        });

        P.each(_.map(flagExecs, function (flag) {
            return flag.exec;
        }), function (flagExec) {
            return flagExec.call(obj, target);
        })
        .then(P.each(_.map(optionExecs, function (option) {
            return option.exec;
        }), function (optionExec) {
            return optionExec.call(obj, target);
        }))

        // run the command's exec function
        .then(function () {
          return obj.exec.apply(obj, args);
        })

        // set the result
        .then(function (objResult) {
            result = objResult;
        })

        // run the flag/option postExecs
        .then(function () {
            var flagExecs = _.filter(obj.flags, function (flag, flagName) {
                return !!flag.postExec && _.has(flags, flagName);
            });

            var optionExecs = _.filter(obj.options, function (option, optionName) {
                return !!option.postExec && _.has(options, optionName);
            });

            return P.all(_.map(flagExecs, function (flag) {
                return result = flag.postExec.call(obj, target, result);
            }))
            .then(function () {
              return P.all(_.map(optionExecs, function (option) {
                return result = option.postExec.call(obj, target, result);
              }))
            });
        })

        // run the display method on the result
        .then(function () {
            if (obj.display)
                console.log(obj.display(result));
            else
                console.log(result);
        })

        // catch errors
        .catch(function (err) {
          console.error(err);
        })

        // exit
        .then(process.exit);
    }
    else
        console.log(displayHelp(obj));
}

function displayHelp(scriptObj, i) {
    var message = '';

    i = i || 0;

    if (!i)
        message += 'Usage:\n';

    _.each(scriptObj, function (val, key) {
        var spaces = '';

        while (spaces.length < i)
            spaces += ' ';

        message += '\n'+spaces+key;

        if (typeof(val) === 'object' && val.description) {
            message += ': '+val.description;
            _.each(val.flags, function (flag, flagName) {
                var description = flag.description && flag.description.split('\n').join('\n        '+spaces) || '';
                message += '\n'+spaces+'    -'+flagName+': '+description;
            });
            _.each(val.options, function (option, optionName) {
                var description = option.description && option.description.split('\n').join('\n        '+spaces) || '';
                message += '\n'+spaces+'    --'+optionName+': '+description;
            });
            message+='\n';

            // if we have a sub-command
            _.each(val, function (subCommand, name) {
                var subObj = {};

                subObj[name] = subCommand;

                if (subCommand.description)
                    message += spaces+displayHelp(subObj, i + 4);
            });
        }
        else if (typeof val === 'object')
            message += ':'+spaces+displayHelp(val, i + 4);
    });

    return message;
}

function autoComplete(scriptObj, lines, path) {
  lines = lines || [];
  path  = path  || '';

  _.each(scriptObj, function (obj, name) {
    if (/^(flags|options|exec|description|display)$/.test(name))
      return;

    if (typeof(obj) === 'object') {
      if (path)
        lines.push(path+' '+name);
      else
        lines.push(name);

      if (!obj.exec) {
        if (path)
          autoComplete(obj, lines, path+' '+name);
        else
          autoComplete(obj, lines, name);
      }

      if (obj.completion) {
        autoComplete(obj.completion, lines, path+' '+name);
      }
    }
    if (typeof(obj) === 'string') {
      lines.push(path+' '+obj);
    }
  });

  return lines;
}

module.exports = function (scriptObj) {
    fs.writeFile('.fun_with_flags_autocomplete', autoComplete(scriptObj).join('\n'), err => {
      if (err)
        console.error(err)
    });
    runFlags(scriptObj, args, flags, options);
};
