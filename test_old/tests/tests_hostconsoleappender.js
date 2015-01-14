xn.test.suite("HostConsoleAppender", function(s) {
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

	// Tests for exceptions when logging
	s.test("Logging/grouping test", function(t) {
		var hostConsoleAppender = new log4javascript.HostConsoleAppender();
		t.logger.addAppender(hostConsoleAppender);

		// Test each level
		t.logger.trace("TEST TRACE");
		t.logger.debug("TEST DEBUG");
		t.logger.info("TEST INFO");
		t.logger.warn("TEST WARN");
		t.logger.error("TEST ERROR");
		t.logger.fatal("TEST FATAL");

		// Test with exception
		t.logger.fatal("TEST FATAL", new Error("Fake error"));

		// Test multiple messages
		t.logger.info("TEST INFO", "Second message", ["a", "b", "c"]);

		// Test groups
		t.logger.group("TEST GROUP");
		t.logger.info("TEST INFO");
		t.logger.groupEnd("TEST GROUP");
		t.logger.info("TEST INFO");

		t.logger.removeAppender(hostConsoleAppender);
	});
}, false);
