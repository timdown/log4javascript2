(function(api) {
    var LoggingEvent = function(logger, timeStamp, level, messages, exception) {
        this.logger = logger;
        this.timeStamp = timeStamp;
        this.timeStampInMilliseconds = +timeStamp;
        this.timeStampInSeconds = Math.floor(this.timeStampInMilliseconds / 1000);
        this.milliseconds = this.timeStamp.getMilliseconds();
        this.level = level;
        this.messages = messages;
        this.exception = exception;
    };

    api.extend(LoggingEvent.prototype = {
        getThrowableStrRep: function() {
            return this.exception ? api.exceptionToStr(this.exception) : "";
        },

        getCombinedMessages: function() {
            var messages = this.messages;
            return (messages.length == 1) ? messages[0] : messages.join("\r\n");
        },

        
/*
        getRenderedMessages: function() {
            var renderedMessages = [];
            for (var i = 0, len = this.messages.length; i < len; ++i) {
                renderedMessages[i] = render(this.messages[i]);
            }
            return renderedMessages;
        },

        getCombinedRenderedMessages: function() {
            return (this.messages.length == 1) ? render( this.messages[0] ) : this.getRenderedMessages().join(newLine);
        },
*/

        toString: function() {
            return "LoggingEvent[" + this.level + "]";
        }
    });

    api.LoggingEvent = LoggingEvent;
})(log4javascript);
