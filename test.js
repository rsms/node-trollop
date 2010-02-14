var sys = require('sys');
var trollopjs = require('./trollop');
var assert = require('assert');

var assert_parses_correctly = function(parser, commandline, expected_opts, expected_leftovers) {
  opts = parser.parse(commandline);
  assert.deepEqual(expected_opts, opts);
  assert.deepEqual(expected_leftovers, parser.leftovers);
};


var tests = {
  "test_unknown_arguments": function() {
    var p = new trollopjs.Parser();

    assert.throws(function() { p.parse(['--arg']) });
    p.opt("arg");
    assert.doesNotThrow(function() { p.parse(['--arg']) });
    assert.throws(function() { p.parse(['--arg2']) });
  },

  "test_syntax_check": function() {
    var p = new trollopjs.Parser();

    p.opt("arg");

    assert.doesNotThrow(function() { p.parse("--arg".split(/\s/)) });
    assert.doesNotThrow(function() { p.parse("arg".split(/\s/)) });
    assert.throws(function() { p.parse("---arg".split(/\s/)) });
    assert.throws(function() { p.parse("-arg".split(/\s/)) });
  },

  "test_required_flags_are_required": function() {
    var p = new trollopjs.Parser();

    p.opt("arg", "desc", {required: true});
    p.opt("arg2", "desc", {required: false});
    p.opt("arg3", "desc", {required: false});

    assert.doesNotThrow(function() { p.parse("--arg".split(/\s/)) });
    assert.doesNotThrow(function() { p.parse("--arg --arg2".split(/\s/)) });
    assert.throws(function() { p.parse("--arg2".split(/\s/)) });
    assert.throws(function() { p.parse("--arg2 --arg3".split(/\s/)) });
  },
  
  // flags that take an argument error unless given one
  "test_argflags_demand_args": function() {
    var p = new trollopjs.Parser();

    p.opt("goodarg", "desc", {type: String});
    p.opt("goodarg2", "desc", {type: String});

    assert.doesNotThrow(function() { p.parse("--goodarg goat".split(/\s/)) });
    assert.throws(function() { p.parse("--goodarg --goodarg2 goat".split(/\s/)) });
    assert.throws(function() { p.parse("--goodarg".split(/\s/)) });
  },

  // flags that don't take arguments ignore them
  "test_arglessflags_refuse_args": function() {
    var p = new trollopjs.Parser();

    p.opt("goodarg");
    p.opt("goodarg2");
    assert.doesNotThrow(function() { p.parse("--goodarg".split(/\s/)) });
    assert.doesNotThrow(function() { p.parse("--goodarg --goodarg2".split(/\s/)) });
    opts = p.parse("--goodarg a".split(/\s/));
    assert.equal(true, opts["goodarg"]);
    assert.deepEqual(["a"], p.leftovers);
  },

  // flags that require args of a specific type refuse args of other
  // types
  "test_typed_args_refuse_args_of_other_types": function() {
    var p = new trollopjs.Parser();

    assert.doesNotThrow(function() { p.opt("goodarg", "desc", {type: 'int'}); });
    assert.throws(function() { p.opt("badarg", "desc", {type: 'asdf'}); });

    assert.doesNotThrow(function() { p.parse("--goodarg 3".split(/\s/)); });
    assert.throws(function() { p.parse("--goodarg 4.2".split(/\s/)); });
    assert.throws(function() { p.parse("--goodarg hello".split(/\s/)); });
  },

  // type is correctly derived from :default
  "test_type_correctly_derived_from_default": function() {
    var p = new trollopjs.Parser();

    assert.throws(function() { p.opt("badarg", "desc", {dflt: [] } ); });

    var opts = null;

    // single arg: int
    assert.doesNotThrow(function() { p.opt("argsi", "desc", {dflt: 0 } ); });
    assert.doesNotThrow(function() { opts = p.parse("--") });
    assert.equal(0, opts["argsi"]);
    assert.doesNotThrow(function() { opts = p.parse("--argsi 4".split(/\s/)) });
    assert.equal(4, opts["argsi"]);
    assert.throws(function() { p.parse("--argsi 4.2".split(/\s/)) });
    assert.throws(function() { p.parse("--argsi hello".split(/\s/)) });

    // single arg: float
    assert.doesNotThrow(function() { p.opt("argsf", "desc", {dflt: 3.14 } ); });
    assert.doesNotThrow(function() { opts = p.parse("--") });
    assert.equal(3.14, opts["argsf"]);
    opts = p.parse("--argsf 2.41".split(/\s/)) 
    assert.doesNotThrow(function() { opts = p.parse("--argsf 2.41".split(/\s/)) });
    assert.equal(2.41, opts["argsf"]);
    assert.doesNotThrow(function() { opts = p.parse("--argsf 2".split(/\s/)) });
    assert.equal(2, opts["argsf"]);
    assert.throws(function() { p.parse("--argsf hello".split(/\s/)) });


    // single arg: date
    date = new Date();
    assert.doesNotThrow(function() { p.opt("argsd", "desc", {dflt: date } ); });
    assert.doesNotThrow(function() { opts = p.parse("--") });
    assert.equal(date.getTime(), opts["argsd"].getTime());
    assert.doesNotThrow(function() { opts = p.parse(['--argsd', 'Jan 4, 2007']) });
    assert.equal(Date.parse('Jan 4, 2007'), opts["argsd"]);
    assert.throws(function() { p.parse("--argsd hello".split(/\s/)) });

    // single arg: string
    assert.doesNotThrow(function() { p.opt("argss", "desc", {dflt: "foobar" } ); });
    assert.doesNotThrow(function() { opts = p.parse("--") });
    assert.equal("foobar", opts["argss"]);
    assert.doesNotThrow(function() { opts = p.parse("--argss 2.41".split(/\s/)) });
    assert.equal("2.41", opts["argss"]);
    assert.doesNotThrow(function() { opts = p.parse("--argss hello".split(/\s/)) });
    assert.equal("hello", opts["argss"]);

    // multi args: ints
    assert.doesNotThrow(function() { p.opt("argmi", "desc", {dflt: [3, 5] } ); });
    assert.doesNotThrow(function() { opts = p.parse("--") });
    assert.deepEqual([3, 5], opts["argmi"]);
    assert.doesNotThrow(function() { opts = p.parse("--argmi 4".split(/\s/)) });
    assert.deepEqual([4], opts["argmi"]);
    //Javascript just has a Number type, not an Integer and a Float, so we can't distinguish
    //between the two
    //assert.throws(function() { p.parse("--argmi 4.2".split(/\s/)) });
    assert.throws(function() { p.parse("--argmi hello".split(/\s/)) });

    // multi args: floats
    assert.doesNotThrow(function() { p.opt("argmf", "desc", {dflt: [3.34, 5.21] } ); });
    assert.doesNotThrow(function() { opts = p.parse("--") });
    assert.deepEqual([3.34, 5.21], opts["argmf"]);
    assert.doesNotThrow(function() { opts = p.parse("--argmf 2".split(/\s/)) });
    assert.deepEqual([2], opts["argmf"]);
    assert.doesNotThrow(function() { opts = p.parse("--argmf 4.0".split(/\s/)) });
    assert.deepEqual([4.0], opts["argmf"]);
    assert.throws(function() { p.parse("--argmf hello".split(/\s/)) });

    // multi args: dates
    dates = [new Date(), Date.parse('Jan 4, 2007')]
    assert.doesNotThrow(function() { p.opt("argmd", "desc", {dflt: dates } ); });
    assert.doesNotThrow(function() { opts = p.parse("--") });
    assert.deepEqual(dates, opts["argmd"]);
    assert.doesNotThrow(function() { opts = p.parse(['--argmd', 'Jan 4, 2007']) });
    assert.deepEqual([Date.parse('Jan 4, 2007')], opts["argmd"]);
    assert.throws(function() { p.parse("--argmd hello".split(/\s/)) });

    // multi args: strings
    assert.doesNotThrow(function() { p.opt("argmst", "desc", {dflt: "hello world".split(/\s/)} ); });
    assert.doesNotThrow(function() { opts = p.parse("--") });
    assert.deepEqual("hello world".split(/\s/), opts["argmst"]);
    assert.doesNotThrow(function() { opts = p.parse("--argmst 3.4".split(/\s/)) });
    assert.deepEqual(["3.4"], opts["argmst"]);
    assert.doesNotThrow(function() { opts = p.parse("--argmst goodbye".split(/\s/)) });
    assert.deepEqual(["goodbye"], opts["argmst"]);
  },

  // :type and :dflt must match if both are specified
  "test_type_and_default_must_match": function() {
    var p = new trollopjs.Parser();

    assert.throws(function() { p.opt("badarg", "desc", {type: 'int', dflt: "hello" } ); });
    assert.throws(function() { p.opt("badarg2", "desc", {type: 'string', dflt: 4 } ); });
    assert.throws(function() { p.opt("badarg2", "desc", {type: 'string', dflt: ["hi"] } ); });
    //Javascript just has a Number type, not an Integer and a Float, so we can't distinguish
    //between the two
    //assert.throws(function() { p.opt("badarg2", "desc", {type: 'ints', dflt: [3.14] } ); });

    assert.doesNotThrow(function() { p.opt("argsi", "desc", {type: 'int', dflt: 4 } ); });
    assert.doesNotThrow(function() { p.opt("argsf", "desc", {type: 'float', dflt: 3.14 } ); });
    assert.doesNotThrow(function() { p.opt("argsd", "desc", {type: 'date', dflt: new Date() } ); });
    assert.doesNotThrow(function() { p.opt("argss", "desc", {type: 'string', dflt: "yo" } ); });
    assert.doesNotThrow(function() { p.opt("argmi", "desc", {type: 'ints', dflt: [4] } ); });
    assert.doesNotThrow(function() { p.opt("argmf", "desc", {type: 'floats', dflt: [3.14] } ); });
    assert.doesNotThrow(function() { p.opt("argmd", "desc", {type: 'dates', dflt: [new Date()] } ); });
    assert.doesNotThrow(function() { p.opt("argmst", "desc", {type: 'strings', dflt: ["yo"] } ); });
  },

  "test_long_detects_bad_names": function() {
    var p = new trollopjs.Parser();

    assert.doesNotThrow(function() { p.opt("goodarg", "desc", {long: "none"} ) });
    assert.doesNotThrow(function() { p.opt("goodarg2", "desc", {long: "--two"} ) });
    assert.throws(function() { p.opt("badarg", "desc", {long: ""} ) });
    assert.throws(function() { p.opt("badarg2", "desc", {long: "--"} ) });
    assert.throws(function() { p.opt("badarg3", "desc", {long: "-one"} ) });
    assert.throws(function() { p.opt("badarg4", "desc", {long: "---toomany"} ) });
  },

  "test_short_detects_bad_names": function() {
    var p = new trollopjs.Parser();

    assert.doesNotThrow(function() { p.opt("goodarg", "desc", {short: "a"} ) });
    assert.doesNotThrow(function() { p.opt("goodarg2", "desc", {short: "-b"} ) });
    assert.throws(function() { p.opt("badarg", "desc", {short: ""} ) });
    assert.throws(function() { p.opt("badarg2", "desc", {short: "-ab"} ) });
    assert.throws(function() { p.opt("badarg3", "desc", {short: "--t"} ) });
  },

  "test_short_names_created_automatically": function() {
    var p = new trollopjs.Parser();

    p.opt("arg");
    p.opt("arg2");
    p.opt("arg3");
    opts = p.parse("-a -g".split(/\s/));
    assert.equal(true, opts["arg"]);
    assert.equal(false, opts["arg2"]);
    assert.equal(true, opts["arg3"]);
  },

  "test_short_autocreation_skips_dashes_and_numbers": function() {
    var p = new trollopjs.Parser();

    p.opt("arg"); // auto: a
    p.opt("arg_potato"); // auto: r
    p.opt("arg_muffin"); // auto: g
    assert.doesNotThrow(function() { p.opt("arg_daisy") }); // auto: d (not _)!
    assert.doesNotThrow(function() { p.opt("arg_r2d2f") }); // auto: f (not 2)!

    opts = p.parse("-f -d".split(/\s/));
    assert.equal(true, opts['arg_daisy']);
    assert.equal(true, opts['arg_r2d2f']);
    assert.equal(false, opts['arg']);
    assert.equal(false, opts['arg_potato']);
    assert.equal(false, opts['arg_muffin']);
  },

  "test_short_autocreation_is_ok_with_running_out_of_chars": function() {
    var p = new trollopjs.Parser();

    p.opt('arg1'); // auto: a
    p.opt('arg2'); // auto: r
    p.opt('arg3'); // auto: g
    p.opt('arg4'); // auto: uh oh!
    assert.doesNotThrow(function() { p.parse([]); });
  },

  "test_short_can_be_nothing": function() {
    var p = new trollopjs.Parser();

    assert.doesNotThrow(function() {
        p.opt("arg", "desc", {short: 'none'} );
        p.parse([]);
      });

    /* TODO: make this work
    sio = StringIO.new "w"
    p.educate(sio);
    assert sio.string =~ /--arg:\s+desc/
    */

    assert.throws(function() { p.parse("-a".split(/\s/)); });
  },

  // two args can't have the same name
  "test_conflicting_names_are_detected": function() {
    var p = new trollopjs.Parser();

    assert.doesNotThrow(function() { p.opt("goodarg"); });
    assert.throws(function() { p.opt("goodarg"); });
  },

  // two args can't have the same :long
  "test_conflicting_longs_detected": function() {
    var p = new trollopjs.Parser();

    assert.doesNotThrow(function() { p.opt("goodarg", "desc", {long: "--goodarg"} ); });
    assert.throws(function() { p.opt("badarg", "desc", {long: "--goodarg"} ); });
  },

  // two args can't have the same :short
  "test_conflicting_shorts_detected": function() {
    var p = new trollopjs.Parser();

    assert.doesNotThrow(function() { p.opt("goodarg", "desc", {short: "-g"} ); });
    assert.throws(function() { p.opt("badarg", "desc", {short: "-g"} ); });
  },

  "test_flag_defaults": function() {
    var p = new trollopjs.Parser();

    p.opt("defaultfalse", "desc");
    p.opt("defaulttrue", "desc", {dflt: true} );

    opts = p.parse([]);
    assert.equal(false, opts["defaultfalse"]);
    assert.equal(true, opts["defaulttrue"]);

    opts = p.parse("--defaultfalse --defaulttrue".split(/\s/));
    assert.equal(true, opts["defaultfalse"]);
    assert.equal(false, opts["defaulttrue"]);
  },

  "test_special_flags_work": function() {
    var p = new trollopjs.Parser();

    p.version("asdf fdas");
    assert.throws(function() { p.parse("-v".split(/\s/)) });
    assert.throws(function() { p.parse("-h".split(/\s/)) });
  },

  "test_short_options_combine": function() {
    var p = new trollopjs.Parser();

    p.opt('arg1', "desc", {short: "a"} );
    p.opt('arg2', "desc", {short: "b"} );
    p.opt('arg3', "desc", {short: "c", type: 'int'} );

    opts = null;
    assert.doesNotThrow(function() { opts = p.parse("-a -b".split(/\s/)); });
    assert.equal(true, opts['arg1']);
    assert.equal(true, opts['arg2']);
    assert.equal(null, opts['arg3']);

    assert.doesNotThrow(function() { opts = p.parse("-ab".split(/\s/)); });
    assert.equal(true, opts['arg1']);
    assert.equal(true, opts['arg2']);
    assert.equal(null, opts['arg3']);

    assert.doesNotThrow(function() { opts = p.parse("-ac 4 -b".split(/\s/)); });
    assert.equal(true, opts['arg1']);
    assert.equal(true, opts['arg2']);
    assert.equal(4, opts['arg3']);

    assert.throws(function() { p.parse("-cab 4".split(/\s/)); });
    assert.throws(function() { p.parse("-cba 4".split(/\s/)); });
  },

  "test_version_only_appears_if_set": function() {
    var p = new trollopjs.Parser();

    p.opt("arg");
    assert.throws(function() { p.parse("-v".split(/\s/)); });
    p.version("trollop 1.2.3.4");
    assert.throws(function() { p.parse("-v".split(/\s/)); });
  },

  "test_doubledash_ends_option_processing": function() {
    var p = new trollopjs.Parser();

    p.opt('arg1', "desc", {short: "a", dflt: 0} );
    p.opt('arg2', "desc", {short: "b", dflt: 0} );
    opts = null;
    assert.doesNotThrow(function() { opts = p.parse("-- -a 3 -b 2".split(/\s/)); });
    assert.equal(opts['arg1'], 0);
    assert.equal(opts['arg2'], 0);
    assert.deepEqual("-a 3 -b 2".split(/\s/), p.leftovers);
    assert.doesNotThrow(function() { opts = p.parse("-a 3 -- -b 2".split(/\s/)); });
    assert.equal(opts['arg1'], 3);
    assert.equal(opts['arg2'], 0);
    assert.deepEqual("-b 2".split(/\s/), p.leftovers);
    assert.doesNotThrow(function() { opts = p.parse("-a 3 -b 2 --".split(/\s/)); });
    assert.equal(opts['arg1'], 3);
    assert.equal(opts['arg2'], 2);
    assert.deepEqual([], p.leftovers);
  },

  /* TODO: make this work
  "test_wrap": function() {
    var p = new trollopjs.Parser();

    assert.equal([""], p.wrap(""));
    assert.equal(["a"], p.wrap("a"));
    assert.equal(["one two", "three"], p.wrap("one two three", :width => 8));
    assert.equal(["one two three"], p.wrap("one two three", :width => 80));
    assert.equal(["one", "two", "three"], p.wrap("one two three", :width => 3));
    assert.equal(["onetwothree"], p.wrap("onetwothree", :width => 3));
    assert.equal([
      "Test is an awesome program that does something very, very important.",
      "",
      "Usage:",
      "  test [options] <filenames>+",
      "where [options] are:"], p.wrap(<<EOM, :width => 100)
Test is an awesome program that does something very, very important.

Usage:
  test [options] <filenames>+
where [options] are:
EOM
  },
  */

  "test_floating_point_formatting": function() {
    var p = new trollopjs.Parser();

    p.opt('arg', "desc", {type: 'float', short: "f"} );
    opts = null;
    assert.doesNotThrow(function() { opts = p.parse("-f 1".split(/\s/)); });
    assert.equal(1.0, opts['arg']);
    assert.doesNotThrow(function() { opts = p.parse("-f 1.0".split(/\s/)); });
    assert.equal(1.0, opts['arg']);
    assert.doesNotThrow(function() { opts = p.parse("-f 0.1".split(/\s/)); });
    assert.equal(0.1, opts['arg']);
    assert.doesNotThrow(function() { opts = p.parse("-f .1".split(/\s/)); });
    assert.equal(0.1, opts['arg']);
    assert.doesNotThrow(function() { opts = p.parse("-f .99999999999999999999".split(/\s/)); });
    assert.equal(1.0, opts['arg']);
    assert.doesNotThrow(function() { opts = p.parse("-f -1".split(/\s/)); });
    assert.equal(-1.0, opts['arg']);
    assert.doesNotThrow(function() { opts = p.parse("-f -1.0".split(/\s/)); });
    assert.equal(-1.0, opts['arg']);
    assert.doesNotThrow(function() { opts = p.parse("-f -0.1".split(/\s/)); });
    assert.equal(-0.1, opts['arg']);
    assert.doesNotThrow(function() { opts = p.parse("-f -.1".split(/\s/)); });
    assert.equal(-0.1, opts['arg']);
    assert.throws(function() { p.parse("-f a".split(/\s/)); });
    assert.throws(function() { p.parse("-f 1a".split(/\s/)); });
    assert.throws(function() { p.parse("-f 1.a".split(/\s/)); });
    assert.throws(function() { p.parse("-f a.1".split(/\s/)); });
    assert.throws(function() { p.parse("-f 1.0.0".split(/\s/)); });
    assert.throws(function() { p.parse("-f .".split(/\s/)); });
    assert.throws(function() { p.parse("-f -.".split(/\s/)); });
  },

  "test_date_formatting": function() {
    var p = new trollopjs.Parser();

    p.opt('arg', "desc", {type: 'date', short: 'd'} );
    opts = null;
    assert.doesNotThrow(function() { opts = p.parse(['-d', 'Jan 4, 2007']) });
    assert.equal(Date.parse('Jan 4, 2007'), opts['arg']);
    /*
    begin
      require 'chronic'
      assert.doesNotThrow(function() { opts = p.parse(['-d', 'today']) });
      assert.equal(Date.today, opts['arg']);
    rescue LoadError
      // chronic is not available
    e nd
    */
  },

  "test_short_options_cant_be_numeric": function() {
    var p = new trollopjs.Parser();

    assert.throws(function() { p.opt('arg', "desc", {short: "-1"} ); });
    p.opt('a1b', "desc");
    p.opt('a2b', "desc");
    assert.notEqual("2", p.specs['a2b']['short']);
  },

  "test_short_options_can_be_weird": function() {
    var p = new trollopjs.Parser();

    assert.doesNotThrow(function() { p.opt('arg1', "desc", {short: "#"} ); });
    assert.doesNotThrow(function() { p.opt('arg2', "desc", {short: "."} ); });
    assert.throws(function() { p.opt('arg3', "desc", {short: "-"} ); });
  },

  "test_options_cant_be_set_multiple_times_if_not_specified": function() {
    var p = new trollopjs.Parser();

    p.opt('arg', "desc", {short: "-x"} );
    assert.doesNotThrow(function() { p.parse("-x".split(/\s/)); });
    assert.throws(function() { p.parse("-x -x".split(/\s/)); });
    assert.throws(function() { p.parse("-xx".split(/\s/)); });
  },

  "test_options_can_be_set_multiple_times_if_specified": function() {
    var p = new trollopjs.Parser();

    assert.doesNotThrow(function() {
        p.opt('arg', "desc", {short: "-x", multi: true} );
      });
    assert.doesNotThrow(function() { p.parse("-x".split(/\s/)); });
    assert.doesNotThrow(function() { p.parse("-x -x".split(/\s/)); });
    assert.doesNotThrow(function() { p.parse("-xx".split(/\s/)); });
  },

  "test_short_options_with_multiple_options": function() {
    var p = new trollopjs.Parser();

    opts = null;

    assert.doesNotThrow(function() {
        p.opt('xarg', "desc", {short: "-x", type: String, multi: true} );
      });
    assert.doesNotThrow(function() { opts = p.parse("-x a -x b".split(/\s/)); });
    assert.deepEqual("a b".split(/\s/), opts['xarg']);
    assert.deepEqual([], p.leftovers);
  },

  "test_short_options_with_multiple_options_does_not_affect_flags_type": function() {
    var p = new trollopjs.Parser();

    opts = null;

    assert.doesNotThrow(function() {
        p.opt('xarg', "desc", {short: "-x", type: 'flag', multi: true} );
      });

    assert.doesNotThrow(function() { opts = p.parse("-x a".split(/\s/)); });
    assert.equal(true, opts['xarg']);
    assert.deepEqual("a".split(/\s/), p.leftovers);

    assert.doesNotThrow(function() { opts = p.parse("-x a -x b".split(/\s/)); });
    assert.equal(true, opts['xarg']);
    assert.deepEqual("a b".split(/\s/), p.leftovers);

    assert.doesNotThrow(function() { opts = p.parse("-xx a -x b".split(/\s/)); });
    assert.equal(true, opts['xarg']);
    assert.deepEqual("a b".split(/\s/), p.leftovers);
  },

  "test_short_options_with_multiple_arguments": function() {
    var p = new trollopjs.Parser();

    opts = null;

    p.opt('xarg', "desc", {type: 'ints'} );
    assert.doesNotThrow(function() { opts = p.parse("-x 3 4 0".split(/\s/)); });
    assert.deepEqual([3, 4, 0], opts['xarg']);
    assert.deepEqual([], p.leftovers);

    p.opt('yarg', "desc", {type: 'floats'} );
    assert.doesNotThrow(function() { opts = p.parse("-y 3.14 4.21 0.66".split(/\s/)); });
    assert.deepEqual([3.14, 4.21, 0.66], opts['yarg']);
    assert.deepEqual([], p.leftovers);

    p.opt('zarg', "desc", {type: 'strings'} );
    assert.doesNotThrow(function() { opts = p.parse("-z a b c".split(/\s/)); });
    assert.deepEqual("a b c".split(/\s/), opts['zarg']);
    assert.deepEqual([], p.leftovers);
  },

  "test_short_options_with_multiple_options_and_arguments": function() {
    var p = new trollopjs.Parser();

    opts = null;

    p.opt('xarg', "desc", {type: 'ints', multi: true} );
    assert.doesNotThrow(function() { opts = p.parse("-x 3 4 5 -x 6 7".split(/\s/)); });
    assert.deepEqual([[3, 4, 5], [6, 7]], opts['xarg']);
    assert.deepEqual([], p.leftovers);

    p.opt('yarg', "desc", {type: 'floats', multi: true} );
    assert.doesNotThrow(function() { opts = p.parse("-y 3.14 4.21 5.66 -y 6.99 7.01".split(/\s/)); });
    assert.deepEqual([[3.14, 4.21, 5.66], [6.99, 7.01]], opts['yarg']);
    assert.deepEqual([], p.leftovers);

    p.opt('zarg', "desc", {type: 'strings', multi: true} );
    assert.doesNotThrow(function() { opts = p.parse("-z a b c -z d e".split(/\s/)); });
    assert.deepEqual(["a b c".split(/\s/), "d e".split(/\s/)], opts['zarg']);
    assert.deepEqual([], p.leftovers);
  },

/////--------starting here
  "test_combined_short_options_with_multiple_arguments": function() {
    var p = new trollopjs.Parser();

    p.opt('arg1', "desc", {short: "a"} );
    p.opt('arg2', "desc", {short: "b"} );
    p.opt('arg3', "desc", {short: "c", type: 'ints'} );
    p.opt('arg4', "desc", {short: "d", type: 'floats'} );

    opts = null;

    assert.doesNotThrow(function() { opts = p.parse("-abc 4 6 9".split(/\s/)); } );
    assert.equal(true, opts['arg1']);
    assert.equal(true, opts['arg2']);
    assert.deepEqual([4, 6, 9], opts['arg3']);

    assert.doesNotThrow(function() { opts = p.parse("-ac 4 6 9 -bd 3.14 2.41".split(/\s/)); } );
    assert.equal(true, opts['arg1']);
    assert.equal(true, opts['arg2']);
    assert.deepEqual([4, 6, 9], opts['arg3']);
    assert.deepEqual([3.14, 2.41], opts['arg4']);

    assert.throws(function() { opts = p.parse("-abcd 3.14 2.41".split(/\s/)); } );
  },

  "test_long_options_with_multiple_options": function() {
    var p = new trollopjs.Parser();

    p.opt('xarg', "desc", {type: String, multi: true} );
    opts = null;
    assert.doesNotThrow(function() { opts = p.parse("--xarg=a --xarg=b".split(/\s/)); } );
    assert.deepEqual("a b".split(/\s/), opts['xarg']);
    assert.deepEqual([], p.leftovers);
    assert.doesNotThrow(function() { opts = p.parse("--xarg a --xarg b".split(/\s/)); } );
    assert.deepEqual("a b".split(/\s/), opts['xarg']);
    assert.deepEqual([], p.leftovers);
  },

  "test_long_options_with_multiple_arguments": function() {
    var p = new trollopjs.Parser();

    opts = null;

    p.opt('xarg', "desc", {type: 'ints'} );
    assert.doesNotThrow(function() { opts = p.parse("--xarg 3 2 5".split(/\s/)); } );
    assert.deepEqual([3, 2, 5], opts['xarg']);
    assert.deepEqual([], p.leftovers);
    assert.doesNotThrow(function() { opts = p.parse("--xarg=3".split(/\s/)); } );
    assert.deepEqual([3], opts['xarg']);
    assert.deepEqual([], p.leftovers);

    p.opt('yarg', "desc", {type: 'floats'} );
    assert.doesNotThrow(function() { opts = p.parse("--yarg 3.14 2.41 5.66".split(/\s/)); } );
    assert.deepEqual([3.14, 2.41, 5.66], opts['yarg']);
    assert.deepEqual([], p.leftovers);
    assert.doesNotThrow(function() { opts = p.parse("--yarg=3.14".split(/\s/)); } );
    assert.deepEqual([3.14], opts['yarg']);
    assert.deepEqual([], p.leftovers);

    p.opt('zarg', "desc", {type: 'strings'} );
    assert.doesNotThrow(function() { opts = p.parse("--zarg a b c".split(/\s/)); } );
    assert.deepEqual("a b c".split(/\s/), opts['zarg']);
    assert.deepEqual([], p.leftovers);
    assert.doesNotThrow(function() { opts = p.parse("--zarg=a".split(/\s/)); } );
    assert.deepEqual("a".split(/\s/), opts['zarg']);
    assert.deepEqual([], p.leftovers);
  },

  "test_long_options_with_multiple_options_and_arguments": function() {
    var p = new trollopjs.Parser();

    opts = null;

    p.opt('xarg', "desc", {type: 'ints', multi: true} );
    assert.doesNotThrow(function() { opts = p.parse("--xarg 3 2 5 --xarg 2 1".split(/\s/)); } );
    assert.deepEqual([[3, 2, 5], [2, 1]], opts['xarg']);
    assert.deepEqual([], p.leftovers);
    assert.doesNotThrow(function() { opts = p.parse("--xarg=3 --xarg=2".split(/\s/)); } );
    assert.deepEqual([[3], [2]], opts['xarg']);
    assert.deepEqual([], p.leftovers);

    p.opt('yarg', "desc", {type: 'floats', multi: true} );
    assert.doesNotThrow(function() { opts = p.parse("--yarg 3.14 2.72 5 --yarg 2.41 1.41".split(/\s/)); } );
    assert.deepEqual([[3.14, 2.72, 5], [2.41, 1.41]], opts['yarg']);
    assert.deepEqual([], p.leftovers);
    assert.doesNotThrow(function() { opts = p.parse("--yarg=3.14 --yarg=2.41".split(/\s/)); } );
    assert.deepEqual([[3.14], [2.41]], opts['yarg']);
    assert.deepEqual([], p.leftovers);

    p.opt('zarg', "desc", {type: 'strings', multi: true} );
    assert.doesNotThrow(function() { opts = p.parse("--zarg a b c --zarg d e".split(/\s/)); } );
    assert.deepEqual(["a b c".split(/\s/), "d e".split(/\s/)], opts['zarg']);
    assert.deepEqual([], p.leftovers);
    assert.doesNotThrow(function() { opts = p.parse("--zarg=a --zarg=d".split(/\s/)); } );
    assert.deepEqual(["a".split(/\s/), "d".split(/\s/)], opts['zarg']);
    assert.deepEqual([], p.leftovers);
  },

  "test_long_options_also_take_equals": function() {
    var p = new trollopjs.Parser();

    p.opt('arg', "desc", {long: "arg", type: String, dflt: "hello"} );
    opts = null;
    assert.doesNotThrow(function() { opts = p.parse(); } );
    assert.equal("hello", opts['arg']);
    assert.doesNotThrow(function() { opts = p.parse("--arg goat".split(/\s/)); } );
    assert.equal("goat", opts['arg']);
    assert.doesNotThrow(function() { opts = p.parse("--arg=goat".split(/\s/)); } );
    assert.equal("goat", opts['arg']);
    // actually, this next one is valid. empty string for --arg, and goat as a
    // leftover.
    // assert.throws(function() { opts = p.parse("--arg= goat".split(/\s/)); } );
  },

  "test_auto_generated_long_names_convert_underscores_to_hyphens": function() {
    var p = new trollopjs.Parser();

    p.opt('hello_there');
    assert.equal("hello-there", p.specs['hello_there']['long']);
  },

  "test_arguments_passed_through_block": function() {
    var p = new trollopjs.Parser();

    var goat = 3
    var boat = 4
    new trollopjs.Parser([goat, function() {
      boat = goat
    }]);
    assert.equal(goat, boat);
  },

  "test_help_has_default_banner": function() {
    var p = new trollopjs.Parser();

    /* TODO: make this work
    sio = StringIO.new "w"
    p.parse([]);
    p.educate(sio);
    help = sio.string.split "\n"
    assert help[0] =~ /options/i
    assert.equal(2, help.length); // options, then -h);

    @p = Parser.new
    p.version("my version");
    sio = StringIO.new "w"
    p.parse([]);
    p.educate(sio);
    help = sio.string.split "\n"
    assert help[0] =~ /my version/i
    assert.equal(4, help.length); // version, options, -h, -v);

    @p = Parser.new
    p.banner("my own banner");
    sio = StringIO.new "w"
    p.parse([]);
    p.educate(sio);
    help = sio.string.split "\n"
    assert help[0] =~ /my own banner/i
    assert.equal(2, help.length); // banner, -h);
    */
  },

  "test_help_preserves_positions": function() {
    var p = new trollopjs.Parser();

    /* TODO: make this work
    p.opt('zzz', "zzz");
    p.opt('aaa', "aaa");
    sio = StringIO.new "w"
    p.educate(sio);

    help = sio.string.split "\n"
    assert help[1] =~ /zzz/
    assert help[2] =~ /aaa/
    */
  },

  "test_version_and_help_short_args_can_be_overridden": function() {
    var p = new trollopjs.Parser();

    p.opt('verbose', "desc", {short: "-v"} );
    p.opt('hello', "desc", {short: "-h"} );
    p.version("version");

    assert.doesNotThrow(function() { p.parse("-v".split(/\s/)) } );
    assert.throws(function() { p.parse("--version".split(/\s/)) } );
    assert.doesNotThrow(function() { p.parse("-h".split(/\s/)) } );
    assert.throws(function() { p.parse("--help".split(/\s/)) } );
  },

  "test_version_and_help_long_args_can_be_overridden": function() {
    var p = new trollopjs.Parser();

    p.opt('asdf', "desc", {long: "help"} );
    p.opt('asdf2', "desc2", {long: "version"} );
    assert.doesNotThrow(function() { p.parse(); } );
    assert.doesNotThrow(function() { p.parse("--help".split(/\s/)); } );
    assert.doesNotThrow(function() { p.parse("--version".split(/\s/)); } );
    assert.doesNotThrow(function() { p.parse("-h".split(/\s/)); } );
    assert.doesNotThrow(function() { p.parse("-v".split(/\s/)); } );
  },

  "test_version_and_help_override_errors": function() {
    var p = new trollopjs.Parser();

    p.opt('asdf', "desc", {type: String} );
    p.version("version");
    assert.doesNotThrow(function() { p.parse("--asdf goat".split(/\s/)); } );
    assert.throws(function() { p.parse("--asdf".split(/\s/)); } );
    assert.throws(function() { p.parse("--asdf --help".split(/\s/)); } );
    assert.throws(function() { p.parse("--asdf --version".split(/\s/)); } );
  },

  "test_conflicts": function() {
    var p = new trollopjs.Parser();

    p.opt('one');
    assert.throws(function() { p.conflicts('one', 'two'); } );
    p.opt('two');
    assert.doesNotThrow(function() { p.conflicts('one', 'two'); } );
    assert.doesNotThrow(function() { p.parse("--one".split(/\s/)); } );
    assert.doesNotThrow(function() { p.parse("--two".split(/\s/)); } );
    assert.throws(function() { opts = p.parse("--one --two".split(/\s/)); } );

    p.opt('hello');
    p.opt('yellow');
    p.opt('mellow');
    p.opt('jello');
    p.conflicts('hello', 'yellow', 'mellow', 'jello');
    assert.throws(function() { opts = p.parse("--hello --yellow --mellow --jello".split(/\s/)); } );
    assert.throws(function() { opts = p.parse("--hello --mellow --jello".split(/\s/)); } );
    assert.throws(function() { opts = p.parse("--hello --jello".split(/\s/)); } );

    assert.doesNotThrow(function() { opts = p.parse("--hello".split(/\s/)); } );
    assert.doesNotThrow(function() { opts = p.parse("--jello".split(/\s/)); } );
    assert.doesNotThrow(function() { opts = p.parse("--yellow".split(/\s/)); } );
    assert.doesNotThrow(function() { opts = p.parse("--mellow".split(/\s/)); } );

    assert.doesNotThrow(function() { opts = p.parse("--mellow --one".split(/\s/)); } );
    assert.doesNotThrow(function() { opts = p.parse("--mellow --two".split(/\s/)); } );

    assert.throws(function() { opts = p.parse("--mellow --two --jello".split(/\s/)); } );
    assert.throws(function() { opts = p.parse("--one --mellow --two --jello".split(/\s/)); } );
  },

  "test_conflict_error_messages": function() {
    var p = new trollopjs.Parser();

    p.opt('one');
    p.opt("two");
    p.conflicts('one', "two");

    try {
      p.parse("--one --two".split(/\s/));
      throw "no error thrown"
    }
    catch(e) {
      assert.ok(e.match(/--one/));
      assert.ok(e.match(/--two/));
    }
  },

  "test_depends": function() {
    var p = new trollopjs.Parser();

    p.opt('one');
    assert.throws(function() { p.depends('one', 'two'); } );
    p.opt('two');
    assert.doesNotThrow(function() { p.depends('one', 'two'); } );
    assert.doesNotThrow(function() { opts = p.parse("--one --two".split(/\s/)); } );
    assert.throws(function() { p.parse("--one".split(/\s/)); } );
    assert.throws(function() { p.parse("--two".split(/\s/)); } );

    p.opt('hello');
    p.opt('yellow');
    p.opt('mellow');
    p.opt('jello');
    p.depends('hello', 'yellow', 'mellow', 'jello');
    assert.doesNotThrow(function() { opts = p.parse("--hello --yellow --mellow --jello".split(/\s/)); } );
    assert.throws(function() { opts = p.parse("--hello --mellow --jello".split(/\s/)); } );
    assert.throws(function() { opts = p.parse("--hello --jello".split(/\s/)); } );

    assert.throws(function() { opts = p.parse("--hello".split(/\s/)); } );
    assert.throws(function() { opts = p.parse("--mellow".split(/\s/)); } );

    assert.doesNotThrow(function() { opts = p.parse("--hello --yellow --mellow --jello --one --two".split(/\s/)); } );
    assert.doesNotThrow(function() { opts = p.parse("--hello --yellow --mellow --jello --one --two a b c".split(/\s/)); } );

    assert.throws(function() { opts = p.parse("--mellow --two --jello --one".split(/\s/)); } );
  },

  "test_depend_error_messages": function() {
    var p = new trollopjs.Parser();

    p.opt('one');
    p.opt("two");
    p.depends('one', "two");

    assert.doesNotThrow(function() { p.parse("--one --two".split(/\s/)); } );

    try {
      p.parse("--one".split(/\s/));
      throw "no error thrown"
    }
    catch(e) {
      assert.ok(e.match(/--one/));
      assert.ok(e.match(/--two/));
    }

    try {
      p.parse("--two".split(/\s/));
      throw "no error thrown"
    }
    catch(e) {
      assert.ok(e.match(/--one/));
      assert.ok(e.match(/--two/));
    }
  },

  // courtesy neill zero
  "test_two_required_one_missing_accuses_correctly": function() {
    var p = new trollopjs.Parser();

    p.opt("arg1", "desc1", {required: true} );
    p.opt("arg2", "desc2", {required: true} );

    try {
      p.parse("--arg1".split(/\s/))
      throw "should have failed on a missing req"
    }
    catch(e) {
      assert.ok( e.match(/arg2/), "didn't mention arg2 in the error msg: " + e);
    }

    try {
      p.parse("--arg2".split(/\s/))
      throw "should have failed on a missing req"
    }
    catch(e) {
      assert.ok( e.match(/arg1/), "didn't mention arg1 in the error msg: " + e.message);
    }

    assert.doesNotThrow(function() { p.parse("--arg1 --arg2".split(/\s/)) } );
  },

  "test_stopwords_mixed": function() {
    var p = new trollopjs.Parser();

    p.opt("arg1", {dflt: false} );
    p.opt("arg2", {dflt: false} );
    p.stop_on("happy sad".split(/\s/));

    opts = p.parse("--arg1 happy --arg2".split(/\s/));
    assert.equal(true, opts["arg1"]);
    assert.equal(false, opts["arg2"]);

    // restart parsing
    p.leftovers.shift();
    opts = p.parse(p.leftovers);
    assert.equal(false, opts["arg1"]);
    assert.equal(true, opts["arg2"]);
  },

  "test_stopwords_no_stopwords": function() {
    var p = new trollopjs.Parser();

    p.opt("arg1", {dflt: false} );
    p.opt("arg2", {dflt: false} );
    p.stop_on("happy sad".split(/\s/));

    opts = p.parse("--arg1 --arg2".split(/\s/));
    assert.equal(true, opts["arg1"]);
    assert.equal(true, opts["arg2"]);

    // restart parsing
    p.leftovers.shift();
    opts = p.parse(p.leftovers);
    assert.equal(false, opts["arg1"]);
    assert.equal(false, opts["arg2"]);
  },

  "test_stopwords_multiple_stopwords": function() {
    var p = new trollopjs.Parser();

    p.opt("arg1", {dflt: false} );
    p.opt("arg2", {dflt: false} );
    p.stop_on("happy sad".split(/\s/));

    opts = p.parse("happy sad --arg1 --arg2".split(/\s/));
    assert.equal(false, opts["arg1"]);
    assert.equal(false, opts["arg2"]);

    // restart parsing
    p.leftovers.shift();
    opts = p.parse(p.leftovers);
    assert.equal(false, opts["arg1"]);
    assert.equal(false, opts["arg2"]);

    // restart parsing again
    p.leftovers.shift();
    opts = p.parse(p.leftovers);
    assert.equal(true, opts["arg1"]);
    assert.equal(true, opts["arg2"]);
  },

  "test_stopwords_with_short_args": function() {
    var p = new trollopjs.Parser();

    p.opt('global_option', "This is a global option", {short: "-g"} );
    p.stop_on("sub-command-1 sub-command-2".split(/\s/));

    global_opts = p.parse("-g sub-command-1 -c".split(/\s/));
    cmd = p.leftovers.shift();

    var q = new trollopjs.Parser();
    q.opt('cmd_option', "This is an option only for the subcommand", {short: "-c"} );
    cmd_opts = q.parse(p.leftovers);

    assert.equal(true, global_opts['global_option']);
    assert.equal(null, global_opts['cmd_option']);

    assert.equal(true, cmd_opts['cmd_option']);
    assert.equal(null, cmd_opts['global_option']);

    assert.equal(cmd, "sub-command-1");
    assert.deepEqual(q.leftovers, []);
  },

  "test_unknown_subcommand": function() {
    var p = new trollopjs.Parser();

    p.opt('global_flag', "Global flag", {short: "-g", type: 'flag'} );
    p.opt('global_param', "Global parameter", {short: "-p", dflt: 5} );
    p.stop_on_unknown();

    expected_opts = {global_flag: true, help: false, global_param: 5, global_flag_given: true }
    expected_leftovers = [ "my_subcommand", "-c" ]

    assert_parses_correctly(p, "--global-flag my_subcommand -c".split(/\s/), expected_opts, expected_leftovers);
    assert_parses_correctly(p, "-g my_subcommand -c".split(/\s/), expected_opts, expected_leftovers);

    expected_opts = {global_flag: false, help: false, global_param: 5, global_param_given: true }
    expected_leftovers = [ "my_subcommand", "-c" ]

    assert_parses_correctly(p, "-p 5 my_subcommand -c".split(/\s/), expected_opts, expected_leftovers);
    assert_parses_correctly(p, "--global-param 5 my_subcommand -c".split(/\s/), expected_opts, expected_leftovers);
  },

  "test_alternate_args": function() {
    var p = new trollopjs.Parser();

    args = "-a -b -c".split(/\s/)

    opts = trollopjs.options(args, function() {
      this.opt('alpher', "Ralph Alpher", {short: "-a"} );
      this.opt('bethe', "Hans Bethe", {short: "-b"} );
      this.opt('gamow', "George Gamow", {short: "-c"} );
    });

    physicists_with_humor = ['alpher', 'bethe', 'gamow']
    physicists_with_humor.forEach(function(physicist) {
        assert.equal(true, opts[physicist]);
      });
  },

  "test_openstruct_style_access": function() {
    var p = new trollopjs.Parser();

    p.opt("arg1", "desc", {type: 'int'} );
    p.opt('arg2', "desc", {type: 'int'} );

    opts = p.parse("--arg1 3 --arg2 4".split(/\s/));

    assert.doesNotThrow(function() { opts.arg1 } );
    assert.doesNotThrow(function() { opts.arg2 } );
    assert.equal(3, opts.arg1);
    assert.equal(4, opts.arg2);
  },

  "test_multi_args_autobox_defaults": function() {
    var p = new trollopjs.Parser();

    p.opt('arg1', "desc", {dflt: "hello", multi: true} );
    p.opt('arg2', "desc", {dflt: ["hello"], multi: true} );

    opts = p.parse();
    assert.deepEqual(["hello"], opts['arg1']);
    assert.deepEqual(["hello"], opts['arg2']);

    opts = p.parse("--arg1 hello".split(/\s/));
    assert.deepEqual(["hello"], opts['arg1']);
    assert.deepEqual(["hello"], opts['arg2']);

    opts = p.parse("--arg1 hello --arg1 there".split(/\s/));
    assert.deepEqual(["hello", "there"], opts['arg1']);
  },

  "test_ambigious_multi_plus_array_default_resolved_as_specified_by_documentation": function() {
    var p = new trollopjs.Parser();

    p.opt('arg1', "desc", {dflt: ["potato"], multi: true} );
    p.opt('arg2', "desc", {dflt: ["potato"], multi: true, type: 'strings'} );
    p.opt('arg3', "desc", {dflt: ["potato"]} );
    p.opt('arg4', "desc", {dflt: ["potato", "rhubarb"], short: 'none', multi: true} );

    // arg1 should be multi-occurring but not multi-valued
    opts = p.parse("--arg1 one two".split(/\s/));
    assert.deepEqual(["one"], opts['arg1']);
    assert.deepEqual(["two"], p.leftovers);

    opts = p.parse("--arg1 one --arg1 two".split(/\s/));
    assert.deepEqual(["one", "two"], opts['arg1']);
    assert.deepEqual([], p.leftovers);

    // arg2 should be multi-valued and multi-occurring
    opts = p.parse("--arg2 one two".split(/\s/));
    assert.deepEqual([["one", "two"]], opts['arg2']);
    assert.deepEqual([], p.leftovers);

    // arg3 should be multi-valued but not multi-occurring
    opts = p.parse("--arg3 one two".split(/\s/));
    assert.deepEqual(["one", "two"], opts['arg3']);
    assert.deepEqual([], p.leftovers);

    // arg4 should be multi-valued but not multi-occurring
    opts = p.parse();
    assert.deepEqual(["potato", "rhubarb"], opts['arg4']);
  },

  "test_given_keys": function() {
    var p = new trollopjs.Parser();

    p.opt('arg1');
    p.opt('arg2');

    opts = p.parse("--arg1".split(/\s/));
    assert.ok(opts['arg1_given']);
    assert.ok(!opts['arg2_given']);

    opts = p.parse("--arg2".split(/\s/));
    assert.ok(!opts['arg1_given']);
    assert.ok(opts['arg2_given']);

    opts = p.parse([]);
    assert.ok(!opts['arg1_given']);
    assert.ok(!opts['arg2_given']);

    opts = p.parse("--arg1 --arg2".split(/\s/));
    assert.ok(opts['arg1_given']);
    assert.ok(opts['arg2_given']);
  },

  "test_default_shorts_assigned_only_after_user_shorts": function() {
    var p = new trollopjs.Parser();

    p.opt('aab', "aaa"); // should be assigned to -b);
    p.opt('ccd', "bbb"); // should be assigned to -d);
    p.opt('user1', "user1", {short: 'a'} );
    p.opt('user2', "user2", {short: 'c'} );

    opts = p.parse("-a -b".split(/\s/));
    assert.ok(opts['user1']);
    assert.ok(!opts['user2']);
    assert.ok(opts['aab']);
    assert.ok(!opts['ccd']);

    opts = p.parse("-c -d".split(/\s/));
    assert.ok(!opts['user1']);
    assert.ok(opts['user2']);
    assert.ok(!opts['aab']);
    assert.ok(opts['ccd']);
  },

  "test_accepts_arguments_with_spaces": function() {
    var p = new trollopjs.Parser();

    p.opt('arg1', "arg", {type: String} );
    p.opt('arg2', "arg2", {type: String} );

    opts = p.parse(["--arg1", "hello there", "--arg2=hello there"]);
    assert.equal("hello there", opts['arg1']);
    assert.equal("hello there", opts['arg2']);
    assert.equal(0, p.leftovers.length);
  },

  "test_multi_args_default_to_empty_array": function() {
    var p = new trollopjs.Parser();

    p.opt('arg1', "arg", {multi: true} );
    opts = p.parse("");
    assert.deepEqual([], opts['arg1']);
  },
};

for( var name in tests ) {
  sys.puts(name);
  tests[name]();
};
