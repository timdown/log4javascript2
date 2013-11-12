(function(api) {
    var isArrayLike = api.Arrays.isArrayLike,
        NUMBER = "number",
        BOOLEAN = "boolean",
        toStr = api.Strings.toStr,
        boolParam = api.boolParam,
        proto = new api.Layout("JsonLayout");

    function escapeNewLines(str) {
        return str.replace(/\r\n|\r|\n/g, "\\r\\n");
    }

    function formatValue(val, prefix, expand, lineBreak, tab) {
        // Check the type of the data value to decide whether quotation marks or expansion are required
        var formattedValue;
        var valType = typeof val;
        var i, childPrefix, finalIndex;


        if (val instanceof Date) {
            formattedValue = String( +val );
        } else if (expand && isArrayLike(val)) {
            formattedValue = "[" + lineBreak;
            childPrefix = prefix + tab;
            finalIndex = val.length - 1;

            for (i = 0; i <= finalIndex; ++i) {
                formattedValue += childPrefix + formatValue(val[i], childPrefix, false, lineBreak, tab);
                if (i < finalIndex) {
                    formattedValue += ",";
                }
                formattedValue += lineBreak;
            }
            formattedValue += prefix + "]";
        } else if (valType != NUMBER && valType != BOOLEAN) {
            formattedValue = '"' + escapeNewLines( toStr(val).replace(/"/g, '\\"') ) + '"';
        } else {
            formattedValue = val;
        }
        return formattedValue;
    }

    function JsonLayout(readable, combineMessages) {
        this.readable = readable = boolParam(readable, false);
        this.combineMessages = boolParam(combineMessages, true);
        this.batchHeader = readable ? "[\r\n" : "[";
        this.batchFooter = readable ? "]\r\n" : "]";
        this.batchSeparator = readable ? ",\r\n" : ",";
        this.setKeys();
        this.colon = readable ? ": " : ":";
        this.tab = readable ? "\t" : "";
        this.lineBreak = readable ? "\r\n" : "";
        this.init();
    }

    JsonLayout.prototype = proto;

    api.extend(proto, {
        contentType: "application/json",
        shouldIgnoreThrowable: false,

        isCombinedMessages: function() {
            return this.combineMessages;
        },

        format: function(loggingEvent) {
            var dataValues = this.getDataValues(loggingEvent, this.combineMessages);
            var str = "{" + this.lineBreak;

            for (var i = 0, finalIndex = dataValues.length - 1, dataValue; i <= finalIndex; ++i) {
                dataValue = dataValues[i];
                str += this.tab + "\"" + dataValue[0] + "\"" + this.colon +
                        formatValue(dataValue[1], this.tab, true, this.lineBreak, this.tab);

                if (i < finalIndex) {
                    str += ",";
                }
                str += this.lineBreak;
            }

            str += "}" + this.lineBreak;
            return str;
        }
    });

    api.JsonLayout = JsonLayout;
})(log4javascript);
