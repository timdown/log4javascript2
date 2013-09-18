(function(api) {
    var anonymousLoggerName = "[anonymous]",
        nullLoggerName = "[null]",
        rootLoggerName = "root",
        Appender = api.Appender,
        Level = api.Level,
        LoggingEvent = api.LoggingEvent,
        UNDEFINED = "undefined",
        STRING = "string",
        toStr = api.Strings.toStr,
        Arrays = api.Arrays,
        reportError = api.reportError;

    function Logger(name) {
        this.name = name;
        this.parent = null;
        this.children = [];

        var logger = this,
            appenders = [],
            loggerLevel = null,
            isRoot = (name === rootLoggerName),
            isNull = (name === nullLoggerName),
            appenderCache = null,
            appenderCacheInvalidated = false,
            additive = true;

        logger.getAdditivity = function() {
            return additive;
        };

        logger.setAdditivity = function(additivity) {
            var valueChanged = (additive != additivity);
            additive = additivity;
            if (valueChanged) {
                this.invalidateAppenderCache();
            }
        };

        // Create methods that use the appenders variable in this scope
        logger.addAppender = function(appender) {
            if (isNull) {
                reportError("Logger.addAppender: you may not add an appender to the null logger");
            } else {
                if (appender instanceof Appender) {
                    if ( !Arrays.contains(appenders, appender) ) {
                        appenders.push(appender);
                        appender.setAddedToLogger(logger);
                        logger.invalidateAppenderCache();
                    }
                } else {
                    reportError("Logger.addAppender: appender supplied ('" + toStr(appender) + "') is not an Appender");
                }
            }
        };

        logger.removeAppender = function(appender) {
            Arrays.remove(appenders, appender);
            appender.setRemovedFromLogger(logger);
            logger.invalidateAppenderCache();
        };

        logger.removeAllAppenders = function() {
            var i, appenderCount = appenders.length;
            if (appenderCount > 0) {
                i = appenderCount;
                while (i--) {
                    appenders[i].setRemovedFromLogger(logger);
                }
                appenders.length = 0;
                logger.invalidateAppenderCache();
            }
        };

        logger.getEffectiveAppenders = function() {
            var parentEffectiveAppenders;
            if (appenderCache === null || appenderCacheInvalidated) {
                // Build appender cache
                parentEffectiveAppenders = (logger.parent && logger.getAdditivity()) ?
                    logger.parent.getEffectiveAppenders() : [];
                appenderCache = parentEffectiveAppenders.concat(appenders);
                appenderCacheInvalidated = false;
            }
            return appenderCache;
        };

        logger.invalidateAppenderCache = function() {
            appenderCacheInvalidated = true;
            for (var i = 0, len = logger.children.length; i < len; ++i) {
                logger.children[i].invalidateAppenderCache();
            }
        };

        logger.log = function(level, params) {
            var exception, paramEndIndex, lastParam, messages, date, loggingEvent;
            if ( api.enabled && level.isGreaterOrEqual( logger.getEffectiveLevel() ) ) {
                date = new Date();

                // Check whether last param is an exception
                paramEndIndex = params.length;
                lastParam = params[paramEndIndex - 1];
                if ( params.length > 1 && api.isError(lastParam) ) {
                    exception = lastParam;
                    paramEndIndex--;
                }

                // Construct genuine array for the params
                messages = Arrays.toArray(params, 0, paramEndIndex);

                loggingEvent = new LoggingEvent(logger, date, level, messages, exception);
                logger.callAppenders(loggingEvent);
            }
        };

        logger.setLevel = function(level) {
            level = Level.fromNameOrLevel(level);
            // Having a level of null on the root logger would be very bad.
            if (isRoot && level === null) {
                reportError("Logger.setLevel: level of the root logger may not be set to null");
            } else if (level instanceof Level) {
                loggerLevel = level;
            } else {
                 reportError("Logger.setLevel: level supplied to logger '" +
                    logger.name + "' must be a valid level name or a Level object.");
            }
        };

        logger.getLevel = function() {
            return loggerLevel;
        };

        var timers = {};

        logger.time = function(name, level) {
            if (api.enabled) {
                level = Level.fromNameOrLevel(level);
                if (typeof name == UNDEFINED) {
                    reportError("Logger.time: a name for the timer must be supplied");
                } else if (level && !(level instanceof Level)) {
                    reportError("Logger.time: level supplied to timer '" +
                        name + "' must be a valid level name or a Level object.");
                } else {
                    timers[name] = new api.Timer(name, level);
                }
            }
        };

        logger.timeEnd = function(name) {
            var timer, milliseconds;
            if (api.enabled) {
                if (typeof name == UNDEFINED) {
                    reportError("Logger.timeEnd: a name for the timer must be supplied");
                } else if (timers[name]) {
                    timer = timers[name];
                    milliseconds = timer.getElapsedTime();
                    logger.log(timer.level, ["Timer \"" + toStr(name) + "\" completed in " + milliseconds + "ms"]);
                    timers[name] = null;
                } else {
                    api.logLog.warn("Logger.timeEnd: no timer found with name \"" + name + "\"");
                }
            }
        };
    }

    var loggerProto = {
        isEnabledFor: function(level) {
            return level.isGreaterOrEqual( this.getEffectiveLevel() );
        },

        addChild: function(childLogger) {
            this.children.push(childLogger);
            childLogger.parent = this;
            childLogger.invalidateAppenderCache();
        },

        callAppenders: function(loggingEvent) {
            var effectiveAppenders = this.getEffectiveAppenders();
            var i = effectiveAppenders.length;
            while (i--) {
                effectiveAppenders[i].doAppend(loggingEvent);
            }
        },

        getEffectiveLevel: function() {
            for (var logger = this; logger !== null; logger = logger.parent) {
                var level = logger.getLevel();
                if (level !== null) {
                    return level;
                }
            }
            return null;
        },

        group: function(name, initiallyExpanded) {
            var effectiveAppenders, i;
            if (api.enabled) {
                effectiveAppenders = this.getEffectiveAppenders();
                i = effectiveAppenders.length;
                while (i--) {
                    effectiveAppenders[i].group(name, initiallyExpanded);
                }
            }
        },

        groupEnd: function() {
            var effectiveAppenders, i;
            if (api.enabled) {
                effectiveAppenders = this.getEffectiveAppenders();
                i = effectiveAppenders.length;
                while (i--) {
                    effectiveAppenders[i].groupEnd();
                }
            }
        },

        assert: function(expr) {
            var args;
            if (api.enabled && !expr) {
                args = Arrays.toArray(arguments, 1, arguments.length);

                if (!args.length) {
                    args[0] = "Assertion Failure";
                }
                args.push("\r\n", expr);
                this.log(Level.ERROR, args);
            }
        },

        toString: function() {
            return "Logger[" + this.name + "]";
        }
    };

    Logger.prototype = loggerProto;

    // Create the log and enabled-check methods for each of the built-in levels. This is to save code duplication and
    // is also slightly more performant than the old, fully-written-out code. The default levels are also created here;
    // any custom level added later will add appropriate methods to the Logger prototype.
    (function() {
        var formatRegex = /\{(\d+)\}/g;

        function logFormatter(args) {
            return args[0].replace(formatRegex,
                function(matched, submatch) {
                    var replacement = args[ +submatch - 1 ];
                    return typeof replacement == UNDEFINED ? matched : replacement;
                }
            );
        }

        function createLevelMethods(level) {
            if (level.colour) {
                var lower = level.name.toLowerCase();
                var capitalized = lower.replace(/^./, function(m) { return m.toUpperCase(); });

                loggerProto[lower] = function() {
                    this.log(level, arguments);
                };

                loggerProto[lower + "Format"] = function() {
                    this.log( level, [ logFormatter(arguments) ] );
                };

                loggerProto[ "is" + capitalized + "Enabled" ] = function() {
                    return this.isEnabledFor(level);
                };
            }
        }

        // Create logger methods for built-in levels
        for (var i = 0, level; level = Level.levels[i++]; ) {
            createLevelMethods(level);
        }

        Level.addCustomLevel = function(level, name, colour) {
            var levelObj = Level.addLevel(level, name, colour);
            createLevelMethods(levelObj);
        };
    })();

    /* ---------------------------------------------------------------------- */
    // Logger access methods

    // Hash table of loggers keyed by logger name
    var loggers = {},
        ROOT_LOGGER_DEFAULT_LEVEL = Level.DEBUG,
        rootLogger = new Logger(rootLoggerName);

    rootLogger.setLevel(ROOT_LOGGER_DEFAULT_LEVEL);

    api.getRootLogger = function() {
        return rootLogger;
    };
    
    function loggerExists(loggerName) {
        return loggers[loggerName] instanceof Logger;
    }

    api.loggerExists = loggerExists;

    function getLogger(loggerName) {
        var logger, lastDotIndex, parentLogger, parentLoggerName;

        // Use anonymous logger if loggerName is not specified or invalid
        if (typeof loggerName != STRING) {
            loggerName = anonymousLoggerName;
        }

        // Create the logger for this name if it doesn't already exist
        if (!loggerExists(loggerName)) {
            logger = new Logger(loggerName);
            loggers[loggerName] = logger;

            // Set up parent logger, if it doesn't exist
            lastDotIndex = loggerName.lastIndexOf(".");
            if (lastDotIndex > -1) {
                parentLoggerName = loggerName.slice(0, lastDotIndex);
                parentLogger = getLogger(parentLoggerName); // Recursively creates ancestor loggers
            } else {
                parentLogger = rootLogger;
            }
            parentLogger.addChild(logger);
        }
        return loggers[loggerName];
    }

    api.getLogger = getLogger;

    var nullLogger = null;

    api.getNullLogger = function() {
        if (!nullLogger) {
            nullLogger = new Logger(nullLoggerName);
            nullLogger.setLevel(Level.OFF);
        }
        return nullLogger;
    };
    
    api.destroyLogger = function(loggerName) {
        var exists = loggerExists(loggerName);
        if (exists) {
            delete loggers[loggerName];
        }
        return exists;
    };

    // Destroys all loggers
    api.resetConfiguration = function() {
        rootLogger.setLevel(ROOT_LOGGER_DEFAULT_LEVEL);
        loggers = {};
    };

    api.Logger = Logger;
})(log4javascript);
