xn.test.suite("PatternLayout", function(s) {
    s.setUp = function(t) {
        t.logger = log4javascript.getLogger("test");
		t.logger.removeAllAppenders();
		t.appender = new ArrayAppender();
        t.logger.addAppender(t.appender);
    };

    s.tearDown = function(t) {
        t.logger.removeAppender(t.appender);
		log4javascript.resetConfiguration();
	};

    /* ---------------------------------------------------------- */

    var getSampleDate = function() {
        var date = new Date();
        date.setFullYear(2006);
        date.setMonth(7);
        date.setDate(30);
        date.setHours(15);
        date.setMinutes(38);
        date.setSeconds(45);
        return date;
    };

    /* ---------------------------------------------------------- */

    s.test("String.replace test", function(t) {
        t.assertEquals("Hello world".replace(/o/g, "Z"), "HellZ wZrld");
    });

	s.test("PatternLayout format test", function(t) {
		var layout = new log4javascript.PatternLayout();
		testLayoutWithVariables(layout, t);
	});

    s.test("PatternLayout dates test", function(t) {
        var layout = new log4javascript.PatternLayout("%d %d{DATE} %d{HH:ss}");
        t.appender.setLayout(layout);
        t.logger.debug("TEST");
        t.assertRegexMatches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2},\d{3} \d{2}:\d{2}$/, t.appender.logMessages[0]);
    });

    s.test("PatternLayout modifiers test", function(t) {
        var layout = new log4javascript.PatternLayout("%m|%3m|%-3m|%6m|%-6m|%.2m|%1.2m|%6.8m|%-1.2m|%-6.8m|");
        t.appender.setLayout(layout);
        t.logger.debug("TEST");
        t.assertEquals(t.appender.logMessages[0], "TEST|TEST|TEST|  TEST|TEST  |ST|ST|  TEST|ST|TEST  |");
    });

    s.test("PatternLayout conversion characters test", function(t) {
        var layout = new log4javascript.PatternLayout("%c %n %p %r literal %%");
        t.appender.setLayout(layout);
        t.logger.debug("TEST");
        t.assertRegexMatches(/^test \s+ DEBUG \d+ literal %$/, t.appender.logMessages[0]);
    });

    s.test("PatternLayout message test", function(t) {
        var layout = new log4javascript.PatternLayout("%m{1} %m{2}");
        t.appender.setLayout(layout);
        var testObj = {
            strikers: {
                quick: "Marlon"
            }
        };
        t.logger.debug(testObj);
        t.assertEquals("{\r\n  strikers: [object Object]\r\n} {\r\n  strikers: {\r\n    quick: Marlon\r\n  }\r\n}", t.appender.logMessages[0]);
    });

    s.test("PatternLayout custom field test 1", function(t) {
        var layout = new log4javascript.PatternLayout("%f{1} %f{2}");
        layout.setCustomField("zero", "TEST");
        layout.setCustomField("one", function(layout, event) { return event.level.toString(); });
        t.appender.setLayout(layout);
        t.logger.debug("");
        t.assertEquals("TEST DEBUG", t.appender.logMessages[0]);
    });

    if (log4javascript.PatternLayout2) {
        var speedTestCount = 1000, speedTestPattern = "%m|%3m|%-3m|%6m|%-6m|%.2m|%1.2m|%6.8m|%-1.2m|%-6.8m|%d %d{DATE} %d{HH:ss}";

        s.test("PatternLayout speed test", function(t) {
            var layout = new log4javascript.PatternLayout(speedTestPattern);
            t.appender.setLayout(layout);
            for (var i = 0; i < speedTestCount; ++i) {
                t.logger.debug("TEST");
            }
        });

        s.test("PatternLayout2 speed test", function(t) {
            var layout = new log4javascript.PatternLayout2(speedTestPattern);
            t.appender.setLayout(layout);
            for (var i = 0; i < speedTestCount; ++i) {
                t.logger.debug("TEST");
            }
        });
    }
}, false);
