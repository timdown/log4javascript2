(function(api) {
    function AlertAppender() {}

    AlertAppender.prototype = new api.Appender();

    api.extend(AlertAppender.prototype, {
        layout: new api.SimpleLayout(),

        append: function(loggingEvent) {
            var layout = this.getLayout();
            var formattedMessage = layout.format(loggingEvent);
            if (layout.ignoresThrowable()) {
                formattedMessage += loggingEvent.getThrowableStrRep();
            }
            alert(formattedMessage);
        },

        toString: function() {
            return "AlertAppender";
        }
    });

    api.AlertAppender = AlertAppender;
})(log4javascript);
