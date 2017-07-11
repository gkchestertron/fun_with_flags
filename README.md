# Fun With Flags!
[![Build Status](https://travis-ci.org/gkchestertron/fun_with_flags.svg?branch=master)](https://travis-ci.org/gkchestertron/fun_with_flags)
Fun with flags is a node framework for building cli tools. Powerful cli tools can be built with simple definitions and promises. The framework can be installed globally for ease of use, and autocompletion for the tools you build is generated automatically and made available through the fli\_completion script included with this package.

## Installation
Global installation is recommended:
```
$ npm install -g fun_with_flags
```
This may require sudo. You can also install it locally, and will have to write it with ./fli instead of the global fli command.

## Usage
Your cli tool should be be a node module in a folder named /fli/. It is built like so:
```
require('fun_with_flags').create({ ... your definition object here ... });
```
Your definition may be any number of levels deep and every object is a namespace. To run your cli tool just run fli from within the parent folder and pass the arguments, flags, and options:
```
$ fli command some_arg -f --later
```

### Namespaces
A namespace may and may have a description and any number of sub-namespaces or commands. If a namespace is passed an exec function it becomes a command. A namespace may also have flags and options which will be added to every command within its scope (i.e. you want an -e or --env flag/option for environment but don't want to write it a dozen times).
```
// namespace
{
  namespace: {
    description: 'this is a namespace description'
  }
}
```

### Commands 
A command has a description, exec function, a display function, flags, and options. The exec function is passed a target object which will contain the values of the flags and options (null if no value is passed - so you can check for undefined to see if a flag was not passed) and any other args you pass from the command line. It should return a promise.

The display function is optional, and will be passed the result of the exec function's promise when it resolves. The output will simply be logged to the console if no display function is available.
```
// namespace
{
  namespace: {
    description: 'this is a namespace description'

    // command
    command: {
      description: '<some_arg> - this is a command that takes a single argument',
      exec: function (target, some_arg) {
        return new Promise(function (resolve, reject) {
            resolve(some_arg);
        }
      },
      display: function (result) {
        console.log('the result was:', result);
      }
    }
  }
}
```

### Flags and Options
Flags and options may have a name, description, exec function, and a postExec function. The target for the exec function will automatically be set with whatever value was passed to the flag or option (or null if no value given). The flag/options's exec function runs before the command's exec. The flag/options's postExec is run after. Both should return promises. We use bluebird Promises. They're great.
```
// namespace
{
  namespace: {
    description: 'this is a namespace description'

    // command
    command: {
      description: '<some_arg> - this is a command that takes a single argument',
      exec: function (target, some_arg) {
        return new Promise(function (resolve, reject) {
            resolve({ message: some_arg+' was passed' });
        }
      },
      display: function (result) {
        console.log('the result object is:', result);
      },
      flags: {
        f: {
          description: 'this is a flag for doing things fast',
          name: 'fast' // fast will be the property set on the target object
        }
      },
      options: {
        later: { // if no name is given, the name of the flag/option label will be the prop set on the target
          description: 'an option to run this command a little later',
          postExec: function (target, result) {
            return new Promise(function (resolve, reject) {
              setTimeout(function () {
                result.message += ' later';
                resolve();
            });
          }
        }
      }
    }
  }
}
```

## Bash Completion
For completion put the src/fli\_completion file in /etc/bash\_completion.d/. If that doesn't work or you don't have that folder, just put it anywhere and source it in your .bashrc or .bash\_profile. Your script must run once to generate the autocomplete options. It then updates them whenever it is run.

##Example
To run the example:
```
$ node ./fli
```
Once you have the tool installed globally just run:
```
$ fli
```
