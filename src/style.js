const clc = require('cli-color');

module.exports = {
  error     : styleWrapper(clc.red),
  title     : styleWrapper(clc.yellow),
  warning   : styleWrapper(clc.yellow),
  label     : styleWrapper(clc.green),
  prop      : styleWrapper(clc.blue),
  info      : styleWrapper(clc.blue),
  text      : styleWrapper(clc.greenBright),
  success   : styleWrapper(clc.greenBright),
  select    : styleWrapper(clc.blue.bgBlackBright),
  highlight : styleWrapper(clc.black.bgGreen),
  clc       : clc // just extend the clc library
}

/**
 * wrapper for styling output of objects/arrays
 * @param {function} styleFunction - clc style function
 * @returns {function} - wrapped style function
 */
function styleWrapper(styleFunction) {
  return function (content) {
    if (typeof(content) == 'object')
      content = JSON.stringify(content, null, 2)

    return styleFunction(content)
  }
}
