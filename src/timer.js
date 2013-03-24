(function(api) {
    var INFO = api.Level.INFO;

    function Timer(name, level) {
        this.name = name;
        this.level = level || INFO;
        this.start = new Date();
    }

    Timer.prototype.getElapsedTime = function() {
        return new Date() - this.start;
    };

    api.Timer = Timer;
})(log4javascript);
