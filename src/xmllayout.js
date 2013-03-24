(function(api) {
    var STRING = "string",
        toStr = api.Strings.toStr,
        boolParam = api.boolParam,
        proto = new api.Layout("XmlLayout");

    function escapeCdata(str) {
        return str.replace(/\]\]>/g, "]]>]]&gt;<![CDATA[");
    }

    function formatMessage(message) {
        message = (typeof message == STRING) ? message : toStr(message);
        return "<log4javascript:message><![CDATA[" + escapeCdata(message) + "]]></log4javascript:message>";
    }

    function XmlLayout(combineMessages) {
        this.combineMessages = boolParam(combineMessages, true);
        this.init();
    }

    XmlLayout.prototype = proto;

    api.extend(proto, {
        contentType: "text/xml",
        shouldIgnoreThrowable: false,

        isCombinedMessages: function() {
            return this.combineMessages;
        },

        format: function(loggingEvent) {
            var i, len, field, parts = [
                "<log4javascript:event logger=\"",
                loggingEvent.logger.name,
                "\" timestamp=\"",
                this.getTimeStampValue(loggingEvent),
                "\""
            ];

            if (!this.isTimeStampsInMilliseconds()) {
                parts.push(" milliseconds=\"" + loggingEvent.milliseconds + "\"");
            }

            parts.push(" level=\"" + loggingEvent.level.name + "\">\r\n");

            if (this.combineMessages) {
                parts.push(formatMessage(loggingEvent.getCombinedMessages()));
            } else {
                parts.push("<log4javascript:messages>" + newLine);
                for (i = 0, len = loggingEvent.messages.length; i < len; ++i) {
                    parts.push(formatMessage(loggingEvent.messages[i]) + newLine);
                }
                parts.push("</log4javascript:messages>" + newLine);
            }
            if (this.hasCustomFields()) {
                for (i = 0, len = this.customFields.length; i < len; ++i) {
                    field = this.customFields[i];
                    parts.push("<log4javascript:customfield name=\"" + field.name + "\"><![CDATA["
                        + field.value.toString() + "]]></log4javascript:customfield>\r\n");
                }
            }
            if (loggingEvent.exception) {
                parts.push("<log4javascript:exception><![CDATA[" +
                    getExceptionStringRep(loggingEvent.exception) +
                    "]]></log4javascript:exception>\r\b" + newLine);
            }
            parts.push("</log4javascript:event>\r\n\r\n");
            return parts.join("");
        }
    });

	api.XmlLayout = XmlLayout;
})(log4javascript);
