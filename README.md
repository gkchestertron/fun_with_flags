#note:
This readme is entirely out of date. Not really sure how bad. Will update in next version. Basically you can now install globally and "fli" will try and run a js file or folder named "fli" in your current directory.

#Fun With Flags
Fun With Flags is a simple cli framework for node using promises. It parses your args/flags/options and uses a simple definition object to build powerful cli tools very quickly.

##Usage
Write a simple definition and pass it into the fwf factory.
```javascript
// example-cli.js
var Promise = require('bluebird');

require('fun_with_flags')({
    // define a top-level command
    dothething: {
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
                if (target.error)
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
                exec: function (target, result) {
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
```

If you type the command:
```
$ node example-cli.js
```
You will get an auto-generated message indicating how to use your new cli tool.

Now try:

```
$ node example-cli.js dothething rightnow 
$ node example-cli.js dothething rightnow -f
$ node example-cli.js dothething rightnow --error 'something bad happened'
```
