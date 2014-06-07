describe("Logger", function() {
    var ArrayAppender = createArrayAppenderConstructor();
    
    beforeEach(function() {
        this.logger = log4javascript.getLogger("test");
        this.logger.removeAllAppenders();
        this.appender = new ArrayAppender();
        this.logger.addAppender(this.appender);
    });

    afterEach(function() {
        this.logger.removeAppender(this.appender);
        log4javascript.resetConfiguration();
    });

    it("Disable log4javascript test", function() {
        log4javascript.enabled = false;
        this.logger.debug("TEST");
        expect(this.appender.logMessages.length).toBe(0);
        log4javascript.enabled = true;
    });
    
    it("Logger logging test", function() {
        // Should log since the default level for loggers is DEBUG and
        // the default threshold for appenders is ALL
        this.logger.debug("TEST");
        expect(this.appender.logMessages.length).toBe(1);
    });

    it("Logger levels test", function() {
        var originalLevel = this.logger.getEffectiveLevel();
        this.logger.setLevel(log4javascript.Level.INFO);
        this.logger.debug("TEST");
        this.logger.setLevel(originalLevel);
        expect(this.appender.logMessages.length).toBe(0);
    });

    it("Logger getEffectiveLevel inheritance test 1", function() {
        var parentLogger = log4javascript.getLogger("test1");
        var childLogger = log4javascript.getLogger("test1.test2");
        parentLogger.setLevel(log4javascript.Level.ERROR);
        expect(childLogger.getEffectiveLevel()).toBe(log4javascript.Level.ERROR);
    });

    it("Logger getEffectiveLevel inheritance test 2", function() {
        var grandParentLogger = log4javascript.getLogger("test1");
        var childLogger = log4javascript.getLogger("test1.test2.test3");
        grandParentLogger.setLevel(log4javascript.Level.ERROR);
        expect(childLogger.getEffectiveLevel()).toBe(log4javascript.Level.ERROR);
    });

    it("Logger getEffectiveLevel inheritance test 3", function() {
        var parentLogger = log4javascript.getLogger("test1");
        var childLogger = log4javascript.getLogger("test1.test2");
        parentLogger.setLevel(log4javascript.Level.ERROR);
        childLogger.setLevel(log4javascript.Level.INFO);
        expect(childLogger.getEffectiveLevel()).toBe(log4javascript.Level.INFO);
    });

    it("Logger getEffectiveLevel root inheritance test", function() {
        var rootLogger = log4javascript.getRootLogger();
        var childLogger = log4javascript.getLogger("test1.test2.test3");
        rootLogger.setLevel(log4javascript.Level.WARN);
        expect(childLogger.getEffectiveLevel()).toBe(log4javascript.Level.WARN);
    });

    it("Logger null level test", function() {
        this.logger.setLevel(null);
        // Should default to root logger level, which is DEBUG
        expect(this.logger.getEffectiveLevel()).toBe(log4javascript.Level.DEBUG);
    });

    it("Logger appender additivity test 1", function() {
        var parentLogger = log4javascript.getLogger("test1");
        var childLogger = log4javascript.getLogger("test1.test2");
        var parentLoggerAppender = new ArrayAppender();
        var childLoggerAppender = new ArrayAppender();

        parentLogger.addAppender(parentLoggerAppender);
        childLogger.addAppender(childLoggerAppender);

        parentLogger.info("Parent logger test message");
        childLogger.info("Child logger test message");

        expect(parentLoggerAppender.logMessages.length).toBe(2);
        expect(childLoggerAppender.logMessages.length).toBe(1);
    });

    it("Logger appender additivity test 2", function() {
        var parentLogger = log4javascript.getLogger("test1");
        var childLogger = log4javascript.getLogger("test1.test2");
        var parentLoggerAppender = new ArrayAppender();
        var childLoggerAppender = new ArrayAppender();

        parentLogger.addAppender(parentLoggerAppender);
        childLogger.addAppender(childLoggerAppender);

        childLogger.setAdditivity(false);

        parentLogger.info("Parent logger test message");
        childLogger.info("Child logger test message");

        expect(parentLoggerAppender.logMessages.length).toBe(1);
        expect(childLoggerAppender.logMessages.length).toBe(1);
    });

    it("Logger appender additivity test 3", function() {
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

        expect(parentLoggerAppender.logMessages.length).toBe(2);
        expect(childLoggerAppender.logMessages.length).toBe(2);
    });

    it("Appender threshold test", function() {
        this.appender.setThreshold(log4javascript.Level.INFO);
        this.logger.debug("TEST");
        expect(this.appender.logMessages.length).toBe(0);
    });

    it("Basic appender / layout test", function() {
        this.logger.debug("TEST");
        expect(this.appender.logMessages[0]).toBe("TEST");
    });

    it("Appender uniqueness within logger test", function() {
        // Add the same appender to the logger for a second time
        this.logger.addAppender(this.appender);
        this.logger.debug("TEST");
        expect(this.appender.logMessages.length).toBe(1);
    });

    it("Logger remove appender test", function() {
        this.logger.debug("TEST");
        this.logger.removeAppender(this.appender);
        this.logger.debug("TEST AGAIN");
        expect(this.appender.logMessages.length).toBe(1);
    });

    it("Appender threshold test", function() {
        this.appender.setThreshold(log4javascript.Level.INFO);
        this.logger.debug("TEST");
        expect(this.appender.logMessages.length).toBe(0);
    });

    it("Basic appender / layout test", function() {
        this.logger.debug("TEST");
        expect(this.appender.logMessages[0]).toBe("TEST");
    });

    it("Appender uniqueness within logger test", function() {
        // Add the same appender to the logger for a second time
        this.logger.addAppender(this.appender);
        this.logger.debug("TEST");
        expect(this.appender.logMessages.length).toBe(1);
    });

    it("Logger remove appender test", function() {
        this.logger.debug("TEST");
        this.logger.removeAppender(this.appender);
        this.logger.debug("TEST AGAIN");
        expect(this.appender.logMessages.length).toBe(1);
    });

    it("Appender removal", function() {
        this.logger.debug("TEST");
        this.logger.removeAppender(this.appender);
        this.logger.debug("TEST AGAIN");
        expect(this.appender.logMessages.length).toBe(1);
    });

    it("Null logger test", function() {
        var log = log4javascript.getNullLogger();
        log.debug("TEST");
        expect(this.appender.logMessages.length).toBe(0);
    });

    it("Null logger group() test", function() {
        var log = log4javascript.getNullLogger();
        log.group("TEST");
        expect(this.appender.logMessages.length).toBe(0);
    });
});
