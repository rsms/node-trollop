var sys = require('sys');
var trollopjs = require('../index');

// no args given, so opts is just the default options
var opts = trollopjs.options(function() {
  this.opt('monkey', "Use monkey mode");                     // a flag --monkey, defaulting to false
  this.opt('goat', "Use goat mode", {dflt: true});           // a flag --goat, defaulting to true
  this.opt('num_limbs', "Number of limbs", {dflt: 4});       // an integer --num-limbs <i>, defaulting to 4
  this.opt('num_thumbs', "Number of thumbs", {type: 'int'}); // an integer --num-thumbs <i>, defaulting to nil
});

sys.puts(sys.inspect(opts));
/* EXAMPLES

node ./examples/simple.js

outputs:
{
  "monkey": false,
  "goat": true,
  "num_limbs": 4,
  "help": false
}

node ./examples/simple.js --monkey --num-limbs 3

outputs:
{
  "monkey": true,
  "goat": true,
  "num_limbs": 3,
  "help": false,
  "monkey_given": true,
  "num_limbs_given": true
}

*/
