#Fun With Flags
Fun With Flags is a simple cli framework for node using promises. It parses your args/flags/options and uses a simple definition object to build powerful cli tools very quickly.

##Usage
Write a simple definition and pass it into the fwf factory.
```
// example-cli.js
var Promise = require('bluebird');

require('fun-with-flags')({
    dothething: {
        description: '<thing name> does the thing',
        display: function (result) {
            console.log('The thing is done:');
            console.log(result);
        },
        exec: function (target, name) {
            var result = { msg: 'the thing was successful' }
            target.name = name
            return new Promise(function (resolve, reject) {
                if (target.error)
                    reject(target.error);
                else
                    resolve(target);
            });
        },
        flags: {
            f: {
                description: 'does the thing fast',
                exec: function (target, result)
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
```
