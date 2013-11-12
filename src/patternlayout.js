(function(api) {
    var reportError = api.reportError,
        expandObject = api.expandObject,
        Strings = api.Strings,
        rightPad = Strings.rightPad,
        leftPad = Strings.leftPad,
        TTCC_CONVERSION_PATTERN = "%r %p %c - %m%n",
        DEFAULT_CONVERSION_PATTERN = "%m%n",
        ISO8601_DATEFORMAT = "yyyy-MM-dd HH:mm:ss,SSS",
        DATETIME_DATEFORMAT = "dd MMM yyyy HH:mm:ss,SSS",
        ABSOLUTETIME_DATEFORMAT = "HH:mm:ss,SSS",
        regex = /%(-?[0-9]+)?(\.?[0-9]+)?([acdfmMnpr%])(\{([^\}]+)\})?/g,
        errPrefix = "PatternLayout.format: ",
        proto = new api.Layout("PatternLayout");

    // Feature test for global regex string replace

    function PatternLayout(pattern) {
        this.pattern = pattern || DEFAULT_CONVERSION_PATTERN;
        this.init();
    }

    PatternLayout.prototype = proto;

    api.extend(PatternLayout, {
        TTCC_CONVERSION_PATTERN: TTCC_CONVERSION_PATTERN,
        DEFAULT_CONVERSION_PATTERN: DEFAULT_CONVERSION_PATTERN,
        ISO8601_DATEFORMAT: ISO8601_DATEFORMAT,
        DATETIME_DATEFORMAT: DATETIME_DATEFORMAT,
        ABSOLUTETIME_DATEFORMAT: ABSOLUTETIME_DATEFORMAT,
    });

    proto.format = function(loggingEvent) {
        var layout = this;

        return layout.pattern.replace(regex, function(matchedString, padding, truncation, conversionCharacter, dummy, specifier) {
            var replacement, replacementParts, replacementLen, depth, loggerName, loggerNameBits, precision, dateFormat,
                fieldIndex, strLen, i, len, l, isError, errorDetail;

            // Create a raw replacement string based on the conversion character and specifier
            replacement = "";
            switch(conversionCharacter) {
                case "a": // Array of messages
                case "m": // Message
                    depth = 0;
                    replacementParts = [];
                    if (specifier) {
                        depth = parseInt(specifier, 10);
                        if (isNaN(depth)) {
                            reportError(errPrefix + "invalid specifier '" + specifier +
                                    "' for conversion character '" + conversionCharacter +
                                    "' - should be a number");
                            depth = 0;
                        }
                    }
                    var messages = (conversionCharacter == "a") ? loggingEvent.messages[0] : loggingEvent.messages;
                    for (i = 0, len = messages.length; i < len; ++i) {
                        replacementParts[replacementParts.length] = (depth == 0) ?
                            messages[i] : expandObject(messages[i], depth, "", false, true, true).toDefaultString().join("\r\n");
                    }
                    replacement = replacementParts.join(" ");
                    break;
                case "c": // Logger name
                    loggerName = loggingEvent.logger.name;
                    if (specifier) {
                        precision = parseInt(specifier, 10);
                        loggerNameBits = loggingEvent.logger.name.split(".");
                        replacement = (precision >= loggerNameBits.length) ?
                            loggerName : loggerNameBits.slice(loggerNameBits.length - precision).join(".");
                    } else {
                        replacement = loggerName;
                    }
                    break;
                case "d": // Date
                    if (specifier) {
                        dateFormat = specifier;
                        // Pick up special cases
                        if (dateFormat == "ISO8601") {
                            dateFormat = ISO8601_DATEFORMAT;
                        } else if (dateFormat == "ABSOLUTE") {
                            dateFormat = ABSOLUTETIME_DATEFORMAT;
                        } else if (dateFormat == "DATE") {
                            dateFormat = DATETIME_DATEFORMAT;
                        }
                    } else {
                        dateFormat = ISO8601_DATEFORMAT;
                    }
                    // Format the date
                    replacement = new api.SimpleDateFormat(dateFormat).format(loggingEvent.timeStamp);
                    break;
                case "f": // Custom field
                    if (layout.hasCustomFields()) {
                        if (specifier) {
                            fieldIndex = parseInt(specifier, 10);
                            isError = false;
                            if (isNaN(fieldIndex)) {
                                isError = true;
                                errorDetail = "should be a number";
                            } else if (fieldIndex == 0) {
                                isError = true;
                                errorDetail = "must be greater than zero";
                            } else if (fieldIndex > layout.customFields.length) {
                                isError = true;
                                errorDetail = "there aren't that many custom fields";
                            }
                            if (isError) {
                                reportError(errPrefix + "invalid specifier '" +
                                    specifier + "' for conversion character 'f' - " + errorDetail);
                            } else {
                                fieldIndex--;
                            }
                        } else {
                            fieldIndex = 0;
                        }
                        var val = layout.customFields[fieldIndex].value;
                        if (typeof val == "function") {
                           val = val(layout, loggingEvent);
                        }
                        replacement = val;
                    }
                    break;
                case "n": // New line
                    replacement = "\r\n";
                    break;
                case "p": // Level
                    replacement = loggingEvent.level.name;
                    break;
                case "r": // Milliseconds since log4javascript startup
                    replacement = "" + (loggingEvent.timeStamp - api.startUpTime);
                    break;
                case "%": // Literal % sign
                    replacement = "%";
                    break;
                default:
                    replacement = matchedString;
                    break;
            }
            // Format the replacement according to any padding or
            // truncation specified

            // First, truncation
            if (truncation) {
                l = parseInt(truncation.slice(1), 10);
                strLen = replacement.length;
                if (l < strLen) {
                    replacement = replacement.slice(-l);
                }
            }
            // Next, padding
            if (padding) {
                if (padding.charAt(0) == "-") {
                    l = parseInt(padding.slice(1), 10);
                    replacementLen = replacement.length;
                    // Right pad with spaces
                    if (replacementLen < l) {
                        replacement = rightPad(replacement, l - replacementLen, " ");
                    }
                } else {
                    l = parseInt(padding, 10);
                    replacementLen = replacement.length;
                    // Left pad with spaces
                    while (replacement.length < l) {
                        replacement = leftPad(replacement, l - replacementLen, " ");
                    }
                }
            }
            return replacement;
        });
    };

    api.PatternLayout = PatternLayout;

})(log4javascript);
