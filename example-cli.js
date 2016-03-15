var Promise = require('bluebird');

require('./fun-with-flags')({
    dothething: {
        description: '<thing name> does the thing',
        display: function (result) {
            console.log('The thing is done:');
            console.log(result);
        },
        exec: function (target, name) {
            var result = { msg: 'the thing was successful' };
            target.name = name
            return new Promise(function (resolve, reject) {
                if (target.error)
                    reject(target.error);
                else
                    resolve(result);
            });
        },
        flags: {
            f: {
                description: 'does the thing fast',
                exec: function (target, result) {
                    result.msg += ' - and we did it fast';
                }
            }
        },
        options: {
            error: {
                description: 'make the cli throw an error'
            }
        }
    }
});

