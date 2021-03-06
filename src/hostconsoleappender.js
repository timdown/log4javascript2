(function(api) {
    // HostConsoleAppender is an appender for writing to the console provided by the environment, such as a browser or
    // Node.js

    var Level = api.Level, DEBUG = Level.DEBUG, INFO = Level.INFO, WARN = Level.WARN, ERROR = Level.ERROR;
    var global = api.globalObj;
    
    function HostConsoleAppender() {}

    HostConsoleAppender.prototype = new api.Appender();
    
    function createConsoleMethodWrapper(methodName, argumentCount) {
        return function() {
            var console = global.console;
            if ( console && console[methodName] ) {
                switch (argumentCount) {
                    case 0:
                        return console[methodName]();
                    case 1:
                        return console[methodName](arguments[0]);
                }
            }
        };
    }

    api.extend(HostConsoleAppender.prototype, {
        layout: new api.NullLayout(),
        threshold: api.Level.DEBUG,

        append: function(loggingEvent) {
            var appender = this;
            var formattedMesage, console;

            var getFormattedMessage = function() {
                var layout = appender.getLayout();
                var formattedMessage = layout.format(loggingEvent);
                if (layout.ignoresThrowable() && loggingEvent.exception) {
                    formattedMessage += loggingEvent.getThrowableStrRep();
                }
                return formattedMessage;
            };

            if ( api.hostConsoleExists && (console = global.console) && console.log ) { // Browsers with built-in console
                formattedMesage = getFormattedMessage();
                // Log to Firebug using its logging methods or revert to the console.log
                // method in Safari
                if (console.debug && DEBUG.isGreaterOrEqual(loggingEvent.level)) {
                    console.debug(formattedMesage);
                } else if (console.info && INFO.equals(loggingEvent.level)) {
                    console.info(formattedMesage);
                } else if (console.warn && WARN.equals(loggingEvent.level)) {
                    console.warn(formattedMesage);
                } else if (console.error && loggingEvent.level.isGreaterOrEqual(ERROR)) {
                    console.error(formattedMesage);
                } else {
                    console.log(formattedMesage);
                }
            } else if ((typeof global.opera != "undefined") && global.opera.postError) { // Opera
                global.opera.postError( getFormattedMessage() );
            }
        },

        group: createConsoleMethodWrapper("group", 1),
        groupEnd: createConsoleMethodWrapper("groupEnd", 0),

        // TODO: Check whether adding the next two functions is correct
        time: createConsoleMethodWrapper("time", 1),
        timeEnd: createConsoleMethodWrapper("timeEnd", 0),

        toString: function() {
            return "HostConsoleAppender";
        }
    });

    api.HostConsoleAppender = HostConsoleAppender;
})(log4javascript);
