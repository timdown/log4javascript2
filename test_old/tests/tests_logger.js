xn.test.suite("Logger", function(s) {
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

    s.test("Disable log4javascript test", function(t) {
        log4javascript.enabled = false;
        t.logger.debug("TEST");
        t.assertEquals(t.appender.logMessages.length, 0);
        log4javascript.enabled = true;
    });

    s.test("Logger logging test", function(t) {
        // Should log since the default level for loggers is DEBUG and
        // the default threshold for appenders is ALL
        t.logger.debug("TEST");
        t.assertEquals(t.appender.logMessages.length, 1);
    });

    s.test("Logger levels test", function(t) {
        var originalLevel = t.logger.getEffectiveLevel();
        t.logger.setLevel(log4javascript.Level.INFO);
        t.logger.debug("TEST");
		t.logger.setLevel(originalLevel);
        t.assertEquals(t.appender.logMessages.length, 0);
    });

	s.test("Logger getEffectiveLevel inheritance test 1", function(t) {
		var parentLogger = log4javascript.getLogger("test1");
		var childLogger = log4javascript.getLogger("test1.test2");
		parentLogger.setLevel(log4javascript.Level.ERROR);
		t.assertEquals(childLogger.getEffectiveLevel(), log4javascript.Level.ERROR);
	});

	s.test("Logger getEffectiveLevel inheritance test 2", function(t) {
		var grandParentLogger = log4javascript.getLogger("test1");
		var childLogger = log4javascript.getLogger("test1.test2.test3");
		grandParentLogger.setLevel(log4javascript.Level.ERROR);
		t.assertEquals(childLogger.getEffectiveLevel(), log4javascript.Level.ERROR);
	});

	s.test("Logger getEffectiveLevel inheritance test 3", function(t) {
		var parentLogger = log4javascript.getLogger("test1");
		var childLogger = log4javascript.getLogger("test1.test2");
		parentLogger.setLevel(log4javascript.Level.ERROR);
		childLogger.setLevel(log4javascript.Level.INFO);
		t.assertEquals(childLogger.getEffectiveLevel(), log4javascript.Level.INFO);
	});

	s.test("Logger getEffectiveLevel root inheritance test", function(t) {
		var rootLogger = log4javascript.getRootLogger();
		var childLogger = log4javascript.getLogger("test1.test2.test3");
		rootLogger.setLevel(log4javascript.Level.WARN);
		t.assertEquals(childLogger.getEffectiveLevel(), log4javascript.Level.WARN);
	});

	s.test("Logger null level test", function(t) {
		t.logger.setLevel(null);
		// Should default to root logger level, which is DEBUG
		t.assertEquals(t.logger.getEffectiveLevel(), log4javascript.Level.DEBUG);
	});

	s.test("Logger appender additivity test 1", function(t) {
		var parentLogger = log4javascript.getLogger("test1");
		var childLogger = log4javascript.getLogger("test1.test2");
		var parentLoggerAppender = new ArrayAppender();
		var childLoggerAppender = new ArrayAppender();

		parentLogger.addAppender(parentLoggerAppender);
		childLogger.addAppender(childLoggerAppender);

		parentLogger.info("Parent logger test message");
		childLogger.info("Child logger test message");

		t.assertEquals(parentLoggerAppender.logMessages.length, 2);
		t.assertEquals(childLoggerAppender.logMessages.length, 1);
	});

	s.test("Logger appender additivity test 2", function(t) {
		var parentLogger = log4javascript.getLogger("test1");
		var childLogger = log4javascript.getLogger("test1.test2");
		var parentLoggerAppender = new ArrayAppender();
		var childLoggerAppender = new ArrayAppender();

		parentLogger.addAppender(parentLoggerAppender);
		childLogger.addAppender(childLoggerAppender);

		childLogger.setAdditivity(false);

		parentLogger.info("Parent logger test message");
		childLogger.info("Child logger test message");

		t.assertEquals(parentLoggerAppender.logMessages.length, 1);
		t.assertEquals(childLoggerAppender.logMessages.length, 1);
	});

	s.test("Logger appender additivity test 3", function(t) {
		var parentLogger = log4javascript.getLogger("test1");
		var childLogger = log4javascript.getLogger("test1.test2");
		var parentLoggerAppender = new ArrayAppender();
		var childLoggerAppender = new ArrayAppender();

		parentLogger.addAppender(parentLoggerAppender);
		childLogger.addAppender(childLoggerAppender);

		childLogger.setAdditivity(false);

		parentLogger.info("Parent logger test message");
		childLogger.info("Child logger test message");

		childLogger.setAdditivity(true);

		childLogger.info("Child logger test message 2");

		t.assertEquals(parentLoggerAppender.logMessages.length, 2);
		t.assertEquals(childLoggerAppender.logMessages.length, 2);
	});

	s.test("Appender threshold test", function(t) {
        t.appender.setThreshold(log4javascript.Level.INFO);
        t.logger.debug("TEST");
        t.assertEquals(t.appender.logMessages.length, 0);
    });

    s.test("Basic appender / layout test", function(t) {
        t.logger.debug("TEST");
		t.assertEquals(t.appender.logMessages[0], "TEST");
    });

	s.test("Appender uniqueness within logger test", function(t) {
		// Add the same appender to the logger for a second time
		t.logger.addAppender(t.appender);
        t.logger.debug("TEST");
        t.assertEquals(t.appender.logMessages.length, 1);
    });

	s.test("Logger remove appender test", function(t) {
		t.logger.debug("TEST");
		t.logger.removeAppender(t.appender);
		t.logger.debug("TEST AGAIN");
		t.assertEquals(t.appender.logMessages.length, 1);
	});

    s.test("Appender threshold test", function(t) {
        t.appender.setThreshold(log4javascript.Level.INFO);
        t.logger.debug("TEST");
        t.assertEquals(t.appender.logMessages.length, 0);
    });

    s.test("Basic appender / layout test", function(t) {
        t.logger.debug("TEST");
        t.assertEquals(t.appender.logMessages[0], "TEST");
    });

    s.test("Appender uniqueness within logger test", function(t) {
        // Add the same appender to the logger for a second time
        t.logger.addAppender(t.appender);
        t.logger.debug("TEST");
        t.assertEquals(t.appender.logMessages.length, 1);
    });

    s.test("Logger remove appender test", function(t) {
        t.logger.debug("TEST");
        t.logger.removeAppender(t.appender);
        t.logger.debug("TEST AGAIN");
        t.assertEquals(t.appender.logMessages.length, 1);
    });

    s.test("Appender removal", function(t) {
		t.logger.debug("TEST");
		t.logger.removeAppender(t.appender);
		t.logger.debug("TEST AGAIN");
		t.assertEquals(t.appender.logMessages.length, 1);
	});

    s.test("Null logger test", function(t) {
        var log = log4javascript.getNullLogger();
		log.debug("TEST");
		t.assertEquals(t.appender.logMessages.length, 0);
	});

    s.test("Null logger group() test", function(t) {
        var log = log4javascript.getNullLogger();
		log.group("TEST");
		t.assertEquals(t.appender.logMessages.length, 0);
	});
}, false);
