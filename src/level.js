(function(api) {
    function Level(level, name, colour) {
        this.level = level;
        this.name = name;
        this.colour = colour;
    }

    Level.prototype = {
        toString: function() {
            return this.name;
        },

        equals: function(level) {
            return this.level === level.level;
        },

        isGreaterOrEqual: function(level) {
            return this.level >= level.level;
        }
    };

    Level.levels = [];

    function addLevel(level, name, colour) {
        var upperName = name.toUpperCase();
        var levelObj = new Level(level, upperName, colour);
        Level[upperName] = levelObj;
        Level.levels.push(levelObj);
    }

    Level.addLevel = addLevel;

    addLevel(Number.MIN_VALUE, "All");
    addLevel(10000, "Trace", "#666");
    addLevel(20000, "Debug", "#090");
    addLevel(30000, "Info", "#009");
    addLevel(40000, "Warn", "#990");
    addLevel(50000, "Error", "#f00");
    addLevel(60000, "Fatal", "#606");
    addLevel(Number.MAX_VALUE, "Off");

    Level.fromNameOrLevel = function(nameOrLevel) {
        if (!nameOrLevel) {
            return null;
        } else if (nameOrLevel instanceof Level) {
            return nameOrLevel;
        } else {
            var level = Level[nameOrLevel.toUpperCase()];
            return (level && level instanceof Level) ? level : null;
        }
    };

    api.Level = Level;
})(log4javascript);
