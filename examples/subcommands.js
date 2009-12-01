// Here's a program called "magic". We want this behavior:
//
//   magic delete <fn> => deletes a file
//   magic copy <fn>   => copies a file
//
// So 'delete' and 'copy' are subcommands.
//
// There are some global options, which appear to the left of the subcommand.
// There are some subcommand options, which appear to the right.
//
// Subcommand options can be specific to the subcommand. 'delete' might take
// different options from 'copy'.
//
// We do this by calling Trollop twice; one for the global options and once for
// the subcommand options. We need to tell Trollop what the subcommands are, so
// that it stops processing the global options when it encounters one of them.

var sys = require('sys');
var trollopjs = require('../index');

SUB_COMMANDS = ['delete', 'copy']

var argv = process.ARGV.slice(2);
global_opts = trollopjs.options(argv, function() {
  this.banner("magic file deleting and copying utility");
  this.opt('dry_run', "Don't actually do anything", {short: "-n"});
  this.stop_on(SUB_COMMANDS);
});

cmd = argv.shift(); // get the subcommand
switch(cmd) {
case 'delete':
  var cmd_opts = trollopjs.options(argv, function() {
      this.opt('force', "Force deletion");
    });
  break;
case 'copy':
  var cmd_opts = trollopjs.options(argv, function() {
      this.opt('double', "Copy twice for safety's sake");
    });
  break;
default:
  throw "unknown subcommand "+cmd;
}

sys.puts("Global options: " + sys.inspect(global_opts));
sys.puts("Subcommand: " + cmd);
sys.puts("Subcommand options: " + sys.inspect(cmd_opts));
sys.puts("Remaining arguments: " + sys.inspect(argv));

/* EXAMPLES

node ./examples/subcommands.js delete filename.js 

outputs:
Global options: {
  "dry_run": false,
  "help": false
}
Subcommand: delete
Subcommand options: {
  "force": false,
  "help": false
}
Remaining arguments: [
  "filename.js"
]
 
node ./examples/subcommands.js copy --double filename.js

outputs:
Global options: {
  "dry_run": false,
  "help": false
}
Subcommand: copy
Subcommand options: {
  "double": true,
  "help": false,
  "double_given": true
}
Remaining arguments: [
  "filename.js"
]

*/

