var ArrayAppender = function(layout) {
    if (layout) {
        this.setLayout(layout);
    }
    this.logMessages = [];
};

ArrayAppender.prototype = new log4javascript.Appender();

ArrayAppender.prototype.layout = new log4javascript.NullLayout();

ArrayAppender.prototype.append = function(loggingEvent) {
    var formattedMessage = this.getLayout().format(loggingEvent);
    if (this.getLayout().ignoresThrowable()) {
        formattedMessage += loggingEvent.getThrowableStrRep();
    }
    this.logMessages.push(formattedMessage);
};

ArrayAppender.prototype.toString = function() {
    return "[ArrayAppender]";
};

// Simply tests a layout for exceptions when formatting
function testLayoutWithVariables(layout, t) {
    var emptyObject = {};
    var emptyArray = [];
    var emptyString = "";
    var localUndefined = emptyArray[0];
    var oneLevelObject = {
        "name": "One-level object"
    };
    var twoLevelObject = {
        "name": "Two-level object",
        "data": oneLevelObject
    };
    var threeLevelObject = {
        "name": "Three-level object",
        "data": twoLevelObject
    };
    var anArray = [
        3,
        "stuff",
        true,
        false,
        0,
        null,
        localUndefined,
        3.14,
        function(p) { return "I'm a function"; },
        [1, "things"]
    ];
    var arrayOfTestItems = [emptyObject, emptyString, emptyString, localUndefined, oneLevelObject,
            twoLevelObject, threeLevelObject, anArray];

    t.log("Testing layout " + layout)
    for (var i = 0; i < arrayOfTestItems.length; i++) {
        var ex = new Error("Test error");
        var loggingEvent = new log4javascript.LoggingEvent(t.logger, new Date(), log4javascript.Level.INFO,
                [arrayOfTestItems[i]], null);
        t.log("Formatting", arrayOfTestItems[i], result);
        var result = layout.format(loggingEvent);
        // Now try with an exception
        loggingEvent.exception = ex;
        t.log("Formatting with exception", arrayOfTestItems[i], result);
        result = layout.format(loggingEvent);
    }
};