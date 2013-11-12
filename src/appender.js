(function(api) {
    var reportError = api.reportError,
        Level = api.Level,
        Layout = api.Layout,
        Arrays = api.Arrays;

    function Appender() {}

    api.extend(Appender.prototype, {
        threshold: Level.ALL,

        // Performs threshold checks before delegating actual logging to the Appender's specific append method.
        doAppend: function(loggingEvent) {
            if (api.enabled && loggingEvent.level.level >= this.threshold.level) {
                this.append(loggingEvent);
            }
        },

        append: function() {},

        setLayout: function(layout) {
            if (layout instanceof Layout) {
                this.layout = layout;
            } else {
                reportError("Appender.setLayout: layout supplied to " + this + " must be a Layout object");
            }
        },

        getLayout: function() {
            return this.layout;
        },

        setThreshold: function(threshold) {
            var level = Level.fromNameOrLevel(threshold);
            if (level) {
                this.threshold = threshold;
            } else {
                reportError("Appender.setThreshold: threshold supplied to " + this + "must be a valid level name or a Level object");
            }
        },

        getThreshold: function() {
            return this.threshold;
        },

        setAddedToLogger: function(logger) {
            if (this.loggers) {
                this.loggers[this.loggers.length] = logger;
            }
        },

        setRemovedFromLogger: function(logger) {
            if (this.loggers) {
                Arrays.remove(this.loggers, logger);
            }
        },

        group: function() {},
        groupEnd: function() {},
        toString: function() {
            return "[Appender]";
        }
    });

    api.addCustomEventSupport(Appender.prototype);

    api.Appender = Appender;
})(log4javascript);