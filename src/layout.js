(function(api) {
    var reportError = api.reportError,
        exceptionToStr = api.exceptionToStr,
        FUNCTION = "function",
        environment = api.environment,
        pageHref = environment.isBrowser ? window.location.href : "";

    function Layout(name) {
        this.name = name;
    }

    api.extend(Layout.prototype, {
        keys: api.createSettings({
            loggerKey: "logger",
            timeStampKey: "timestamp",
            millisecondsKey: "milliseconds",
            levelKey: "level",
            messageKey: "message",
            exceptionKey: "exception",
            urlKey: "url"
        }),
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
            var keys = this.keys;
            var dataValues = [
                [keys.loggerKey, loggingEvent.logger.name],
                [keys.timeStampKey, this.getTimeStampValue(loggingEvent)],
                [keys.levelKey, loggingEvent.level.name],
                [keys.messageKey, combineMessages ? loggingEvent.getCombinedMessages() : loggingEvent.messages]
            ];

            if (api.environment.isBrowser) {
                dataValues.push( [this.urlKey, pageHref] );
            }

            if (!this.isTimeStampsInMilliseconds()) {
                dataValues.push( [this.millisecondsKey, loggingEvent.milliseconds] );
            }

            if (loggingEvent.exception) {
                dataValues.push( [this.exceptionKey, exceptionToStr(loggingEvent.exception)] );
            }

            var customFields = this.customFields;
            for (var i = 0, len = customFields.length, val; i < len; ++i) {
                val = customFields[i].value;

                // Check if the value is a function. If so, execute it, passing it the
                // current layout and the logging event
                if (typeof val == FUNCTION) {
                    val = val(this, loggingEvent);
                }
                dataValues.push( [customFields[i].name, val] );
            }
            return dataValues;
        },

        setKeys: function(keys) {
            var d = this.defaults;
            this.keys.set(keys);
        },

        setCustomField: function(name, value) {
            var fieldUpdated = false, customField, customFields = this.customFields;
            for (var i = 0, len = customFields.length; i < len; ++i) {
                customField = customFields[i];
                if (customField.name === name) {
                    customField.value = value;
                    fieldUpdated = true;
                }
            }
            if (!fieldUpdated) {
                customFields.push( {"name": name, "value": value} );
            }
        },

        hasCustomFields: function() {
            return (this.customFields.length > 0);
        },

        toString: function() {
            return this.name;
        }
    });

    api.Layout = Layout;
})(log4javascript);
