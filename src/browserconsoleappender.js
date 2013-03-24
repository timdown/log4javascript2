(function(api) {
    // BrowserConsoleAppender only works in browser environments with a window.console logging implementation or Opera

    var Level = api.Level, DEBUG = Level.DEBUG, INFO = Level.INFO, WARN = Level.WARN, ERROR = Level.ERROR;

    if (!api.environment.isBrowser) {
        alert("BrowserConsoleAppender can only work when running in a browser");
        return;
    }

    function BrowserConsoleAppender() {}

    BrowserConsoleAppender.prototype = new api.Appender();

    api.extend(BrowserConsoleAppender.prototype, {
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

            if (window.console && window.console.log) { // Safari and Firebug
                console = window.console;
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
            } else if ((typeof window.opera != "undefined") && window.opera.postError) { // Opera
                window.opera.postError(getFormattedMessage());
            }
        },

        group: function(name) {
            if (window.console && window.console.group) {
                window.console.group(name);
            }
        },

        groupEnd: function() {
            if (window.console && window.console.groupEnd) {
                window.console.groupEnd();
            }
        },

        // TODO: Check whether adding these two functions is correct
        time: function(name) {
            if (window.console && window.console.time) {
                window.console.time(name);
            }
        },

        timeEnd: function() {
            if (window.console && window.console.timeEnd) {
                window.console.timeEnd();
            }
        },

        toString: function() {
            return "BrowserConsoleAppender";
        }
    });

    api.BrowserConsoleAppender = BrowserConsoleAppender;
})(log4javascript);
