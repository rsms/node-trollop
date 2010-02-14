# trollop

[Trollop](http://trollop.rubyforge.org) is a command line option parser for [Node](http://nodejs.org/).

## Description

trollop is a commandline option parser for Node that just gets out of your
way. One line of code per option is all you need to write. For that, you get a
nice automatically-generated help page, robust option parsing, command
subcompletion, and sensible defaults for everything you don't specify.

## Quick example

    var opts = require('trollop').options([
      'Usage: myprog [options]',
      'Options:',
      ['monkey', "Use monkey mode"],                       // a flag --monkey, defaulting to false
      ['goat', "Use goat mode", {dflt: true}],             // a flag --goat, defaulting to true
      ['num_limbs', "Number of limbs", {dflt: 4}],         // an integer --num-limbs <i>, defaulting to 4
      ['num_thumbs', "Number of thumbs", {type: 'int'}],   // an integer --num-thumbs <i>, defaulting to nil
    });

    require('sys').p(opts);
    /* prints:
    {
     "monkey": false,
     "goat": true,
     "num_limbs": 4,
     "help": false
    }
    */

## Documentation

I have no documentation.  But if you are curious you can consult the Ruby docs
for the original Trollop:

[http://trollop.rubyforge.org/](http://trollop.rubyforge.org/)

Or you can checkout the files in the examples dir.

## Bullet points

(taken from the Trollop README)

- Dirt-simple usage.
- Sensible defaults. No tweaking necessary, much tweaking possible.
- Support for long options, short options, short option bundling, and
  automatic type validation and conversion.
- Support for subcommands.
- Automatic help message generation, wrapped to current screen width.
- Lots of unit tests.


## Differences from the ruby trollop

The Ruby Trollop has an IO type.   At this time there isn't a good mapping for that
in Node, so I removed it.

`default` is a keyword in javascript, so the option has been renamed `def`.

I haven't implemented the Trollop::die function.

### About the ruby trollop

Trollop is origonally by William Morgan (http://masanjin.net/)

Main page: http://trollop.rubyforge.org

Release announcements and comments: http://all-thing.net/label/trollop

## License

trollop is distributed under the same terms as Trollop:

Copyright (c) 2008--2009 William Morgan. Trollop is distributed under the same
terms as Ruby.

## Authors

- [William Morgan](http://masanjin.net/) -- author of the original Ruby implementation.
- [Benjamin Thomas](http://benjaminthomas.org/) -- initial Node port.
- [Rasmus Andersson](http://hunch.se/) -- further converted the code to use node-features.
