(function(api) {
    var urlEncode = api.Strings.urlEncode,
        proto = new api.Layout("HttpPostDataLayout");

    function HttpPostDataLayout() {
        this.setKeys();
        this.customFields = [];
    }

    HttpPostDataLayout.prototype = proto;

    api.extend(proto, {
        returnsFormData: true,
        shouldIgnoreThrowable: true,
        shouldAllowBatching: false,

        format: function(loggingEvent) {
            var dataValues = this.getDataValues(loggingEvent);
            var dataValue, val, queryBits = [];
            for (var i = 0, len = dataValues.length; i < len; ++i) {
                dataValue = dataValues[i];
                val = dataValue[1];
                if (val instanceof Date) {
                    val = String(+val);
                }
                queryBits[queryBits.length] = urlEncode(dataValue[0]) + "=" + urlEncode(val);
            }
            return queryBits.join("&");
        }
    });

    api.HttpPostDataLayout = HttpPostDataLayout;
})(log4javascript);
