(function(api) {
    var reportError = api.reportError,
        exceptionToStr = api.exceptionToStr,
        FUNCTION = "function",
        environment = api.environment,
        pageHref = environment.isBrowser ? window.location.href : "";

    function Layout(name) {
        this.name = name;
    }

    Layout.prototype = {
        defaults: {
            loggerKey: "logger",
            timeStampKey: "timestamp",
            millisecondsKey: "milliseconds",
            levelKey: "level",
            messageKey: "message",
            exceptionKey: "exception",
            urlKey: "url"
        },
        loggerKey: "logger",
        timeStampKey: "timestamp",
        millisecondsKey: "milliseconds",
        levelKey: "level",
        messageKey: "message",
        exceptionKey: "exception",
        urlKey: "url",
        batchHeader: "",
        batchFooter: "",
        batchSeparator: "",
        returnsFormData: false,
        overrideTimeStampsSetting: false,
        useTimeStampsInMilliseconds: null,
        contentType: "text/plain",
        shouldIgnoreThrowable: true,
        shouldAllowBatching: true,

        init: function() {
            this.customFields = [];
        },

        format: function() {
            reportError("Layout.format: layout supplied has no format() method");
        },

        ignoresThrowable: function() {
            return this.shouldIgnoreThrowable;
        },

        getContentType: function() {
            return this.contentType;
        },

        allowBatching: function() {
            return this.shouldAllowBatching;
        },

        setTimeStampsInMilliseconds: function(timeStampsInMilliseconds) {
            this.overrideTimeStampsSetting = true;
            this.useTimeStampsInMilliseconds = !!timeStampsInMilliseconds;
        },

        isTimeStampsInMilliseconds: function() {
            return this.overrideTimeStampsSetting ? this.useTimeStampsInMilliseconds : api.useTimeStampsInMilliseconds;
        },

        getTimeStampValue: function(loggingEvent) {
            return this.isTimeStampsInMilliseconds() ? loggingEvent.timeStampInMilliseconds : loggingEvent.timeStampInSeconds;
        },

        // TODO: Test for environment (eg browser, test by presence of window object)
        getDataValues: function(loggingEvent, combineMessages) {
            var dataValues = [
                [this.loggerKey, loggingEvent.logger.name],
                [this.timeStampKey, this.getTimeStampValue(loggingEvent)],
                [this.levelKey, loggingEvent.level.name],
                [this.messageKey, combineMessages ? loggingEvent.getCombinedMessages() : loggingEvent.messages]
            ];

            if (api.environment.isBrowser) {
                dataValues[dataValues.length] = [this.urlKey, pageHref];
            }

            if (!this.isTimeStampsInMilliseconds()) {
                dataValues[dataValues.length] = [this.millisecondsKey, loggingEvent.milliseconds];
            }

            if (loggingEvent.exception) {
                dataValues[dataValues.length] = [this.exceptionKey, exceptionToStr(loggingEvent.exception)];
            }

            if (this.hasCustomFields()) {
                for (var i = 0, len = this.customFields.length, val; i < len; ++i) {
                    val = this.customFields[i].value;

                    // Check if the value is a function. If so, execute it, passing it the
                    // current layout and the logging event
                    if (typeof val == FUNCTION) {
                        val = val(this, loggingEvent);
                    }
                    dataValues[dataValues.length] = [this.customFields[i].name, val];
                }
            }
            return dataValues;
        },

        setKeys: function(loggerKey, timeStampKey, levelKey, messageKey, exceptionKey, urlKey, millisecondsKey) {
            var d = this.defaults;
            this.loggerKey = stringParam(loggerKey, d.loggerKey);
            this.timeStampKey = stringParam(timeStampKey, d.timeStampKey);
            this.levelKey = stringParam(levelKey, d.levelKey);
            this.messageKey = stringParam(messageKey, d.messageKey);
            this.exceptionKey = stringParam(exceptionKey, d.exceptionKey);
            this.urlKey = stringParam(urlKey, d.urlKey);
            this.millisecondsKey = stringParam(millisecondsKey, d.millisecondsKey);
        },

        setCustomField: function(name, value) {
            var fieldUpdated = false, customField;
            for (var i = 0, len = this.customFields.length; i < len; ++i) {
                customField = this.customFields[i];
                if (customField.name === name) {
                    customField.value = value;
                    fieldUpdated = true;
                }
            }
            if (!fieldUpdated) {
                this.customFields[this.customFields.length] = {"name": name, "value": value};
            }
        },

        hasCustomFields: function() {
            return (this.customFields.length > 0);
        },

        toString: function() {
            return this.name;
        }
    };

    api.Layout = Layout;
})(log4javascript);
