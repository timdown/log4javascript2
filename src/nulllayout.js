(function(api) {
    function NullLayout() {
        this.init();
    }

    var proto = new api.Layout("NullLayout");

    NullLayout.prototype = proto;

    proto.format = function(loggingEvent) {
        return loggingEvent.messages;
    };

    api.NullLayout = NullLayout;
})(log4javascript);
