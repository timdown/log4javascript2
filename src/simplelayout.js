(function(api) {
    function SimpleLayout() {
        this.init();
    }
    
    var proto = new api.Layout("SimpleLayout");

    SimpleLayout.prototype = proto;

    proto.format = function(loggingEvent) {
        return loggingEvent.level.name + " - " + loggingEvent.getCombinedMessages();
    };

    api.SimpleLayout = SimpleLayout;
})(log4javascript);
