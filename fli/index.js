var Promise = require('bluebird');

require('../fun-with-flags')({
    // define a top-level command
    dothething: {
        completion: ['demo', 'montgomery'],
        // add a description for the auto-usage message
        description: '<name> does the thing',
        display: function (result) {
            console.log('The thing, '+result.name+', is done:');
            console.log(result.msg);
        },
        // exec will be called after the flags/opions have been parsed into the target
        // should return a promise or result object
        // will be passed any arguments given beyond the parent command
        exec: function (target, name) {
            var result = { msg: 'the thing was successful' };
            result.name = target.name = name;

            if (!target.fast)
                result.msg += ' - and it was not fast';

            return new Promise(function (resolve, reject) {
                if (target.error !== undefined)
                    reject('the thing was not successful - '+target.error);
                else
                    resolve(result);
            });
        },
        flags: {
            // each flag also gets a description and exec
            f: {
                description: 'does the thing fast',
                // flag execs are called after the command's exec and are passed the target and result
                postExec: function (target, result) {
                    result.msg += ' - and we did it fast';
                },
                name: 'fast'
            }
        },
        options: {
            error: {
                description: 'make the cli throw an error'
            }
        }
    }
});
