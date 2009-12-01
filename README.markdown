trollopjs
=========

[Trollop](http://trollop.rubyforge.org) is a command line option parser for Ruby.

trollopjs is a port of that to work with the Node library.

Almost everything is working except for the formatting of the help message.
Read about the differences below.

DESCRIPTION
-----------

trollopjs is a commandline option parser for Node that just gets out of your
way. One line of code per option is all you need to write. For that, you get a
nice automatically-generated help page, robust option parsing, command
subcompletion, and sensible defaults for everything you don't specify.

DOCUMENTATION/QUICK START
-------------------------

I have no documentation.  But if you are curious you can consult the Ruby docs
for the original Trollop:

[http://trollop.rubyforge.org/](http://trollop.rubyforge.org/)

Or you can checkout the files in the examples dir.

QUICK EXAMPLE
-------------

    var trollopjs = require('trollopjs');

    var opts = trollopjs.options(function() {
      this.opt('monkey', "Use monkey mode");                     // a flag --monkey, defaulting to false
      this.opt('goat', "Use goat mode", {dflt: true});           // a flag --goat, defaulting to true
      this.opt('num_limbs', "Number of limbs", {dflt: 4});       // an integer --num-limbs <i>, defaulting to 4
      this.opt('num_thumbs', "Number of thumbs", {type: 'int'}); // an integer --num-thumbs <i>, defaulting to nil
    });

    var sys = require('sys');
    sys.puts(sys.inspect(opts));
    /* prints:
    {
     "monkey": false,
     "goat": true,
     "num_limbs": 4,
     "help": false
    }
    */

INSTALLING/RUNNING
------------------

Checkout out the code and make sure it is in your [node path](http://nodejs.org/api.html#_modules).

Run a file with the following command:

    node filename.js

Pass it parameters:

    node filename.js --monkey

The `node` command has a tendency to steal 'help' and 'version' arguments, so if you 
follow it up with `--` you won't run into any problems:

    node -- filename.js --help

FEATURES/PROBLEMS
-----------------

(taken from the Trollop README)

- Dirt-simple usage.
- Sensible defaults. No tweaking necessary, much tweaking possible.
- Support for long options, short options, short option bundling, and
  automatic type validation and conversion.
- Support for subcommands.
- Automatic help message generation, wrapped to current screen width.
- Lots of unit tests.


DIFFERENCES FROM THE RUBY TROLLOP
---------------------------------

The Ruby Trollop has an IO type.   At this time there isn't a good mapping for that
in Node, so I removed it.

`default` is a keyword in javascript, so the option has been renamed `dflt`.

I haven't implemented the Trollop::die function.

LICENSE
-------

trollopjs is distributed under the same terms as Trollop:

Copyright (c) 2008--2009 William Morgan. Trollop is distributed under the same
terms as Ruby.

ABOUT THE RUBY TROLLOP
----------------------

Trollop is origonally by William Morgan (http://masanjin.net/)

Main page: http://trollop.rubyforge.org

Release announcements and comments: http://all-thing.net/label/trollop
