var clc    = require('cli-color');

module.exports = {
  error     : clc.red,
  title     : clc.yellow,
  warning   : clc.yellow,
  label     : clc.green,
  prop      : clc.blue,
  info      : clc.blue,
  text      : clc.greenBright,
  success   : clc.greenBright,
  select    : clc.blue.bgBlackBright,
  highlight : clc.black.bgGreen
};
