var _       = require('underscore');
var P       = require('bluebird');
var rawArgs = process.argv.slice(2);
var log     = console.log.bind(console);
var args    = [];
var flags   = {};
var options = {};
var arg;
var option;
var flag;

while (arg = rawArgs.shift()) {
    if (/^--/.test(arg)) {
        arg = arg.slice(2);

        if (/=/.test(arg))
            options[arg.split('=')[0]] = arg.split('=')[1];
        else if (rawArgs[0] && !/^-/.test(rawArgs[0]))
            options[arg] = parseArg(rawArgs.shift());
        else
            options[arg] = null;
    }
    else if (/^-/.test(arg)) {
        arg = arg.slice(1).split('');

        for (var i in arg) {
            if (rawArgs[0] && !/^-/.test(rawArgs[0]))
                flags[arg[i]] = parseArg(rawArgs.shift());
            else
                flags[arg[i]] = null;
        }
    }
    else {
        args.push(arg);
    }
}

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
    var obj       = scriptObj,
        target = {},
        result = {},
        parentFlags = scriptObj.flags     || {},
        parentOptions = scriptObj.options || {};


    while (obj[args[0]]) {
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
        // run the exec function for each flag and option
        .then(function () {
            var flagExecs = _.filter(obj.flags, function (flag, flagName) {
                return !!flag.exec && _.has(flags, flagName);
            });

            var optionExecs = _.filter(obj.options, function (option, optionName) {
                return !!option.exec && _.has(options, optionName);
            });

            return P.each(_.map(flagExecs, function (flag) {
                return flag.exec;
            }), function (flagExec) {
                return flagExec.call(obj, target);
            })
            .then(P.each(_.map(optionExecs, function (option) {
                return option.exec;
            }), function (optionExec) {
                return optionExec.call(obj, target);
            }))
        })
        // run the command's exec function
        obj.exec.apply(obj, args)
        // set the result
        .then(function (objResult) {
            result = objResult;
        })
        // run the flag/option execs
        .then(function () {
            var flagExecs = _.filter(obj.flags, function (flag, flagName) {
                return !!flag.postExec && _.has(flags, flagName);
            });

            var optionExecs = _.filter(obj.options, function (option, optionName) {
                return !!option.postExec && _.has(options, optionName);
            });

            return P.each(_.map(flagExecs, function (flag) {
                return flag.postExec;
            }), function (flagExec) {
                return flagExec.call(obj, target, result);
            })
            .then(P.each(_.map(optionExecs, function (option) {
                return option.postExec;
            }), function (optionExec) {
                return optionExec.call(obj, target, result);
            }))
        })
        // run the display method on the result
        .then(function () {
            if (obj.display)
                obj.display(result)
            else
                console.log(result);
        })
        // catch errors
        .catch(log)
        // exit
        .then(process.exit);
    }
    else
        console.log(displayHelp(scriptObj));
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
                var description = flag.description.split('\n').join('\n        '+spaces);
                message += '\n'+spaces+'    -'+flagName+' : '+description;
            });
            _.each(val.options, function (option, optionName) {
                var description = option.description.split('\n').join('\n        '+spaces);
                message += '\n'+spaces+'    --'+optionName+' : '+description;
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

module.exports = function (scriptObj) {
    runFlags(scriptObj, args, flags, options);
};
