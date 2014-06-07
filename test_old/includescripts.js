(function() {
    var scripts = [
        "core.js",
        "simpledateformat.js",
        "level.js",
        "timer.js",
        "loggingevent.js",
        "formatobjectexpansion.js",
        "layout.js",
        "appender.js",
        "logger.js",
        "renderer.js",
        "nulllayout.js",
        "simplelayout.js",
        "xmllayout.js",
        "jsonlayout.js",
        "httppostdatalayout.js",
        "patternlayout.js",
/*
        "patternlayout2.js",
*/
        "alertappender.js",
        "browserconsoleappender.js",
        "ajaxappender.js"
    ];

    if (window.location.search.indexOf("?singlejsfile") == 0) {
        var compress = /&compress$/.test(window.location.search) ? "?compress=1" : "";
        document.writeln('<script type="text/javascript" src="allscripts.js.php' + compress + '"></script>');
    } else {
        var prefix = "../src/";
        var scriptTags = [];
        for (var i = 0, len = scripts.length; i < len; ++i) {
            scriptTags.push('<script type="text/javascript" src="' + prefix + scripts[i] + '"></script>');
        }
        document.writeln(scriptTags.join("\n"));
    }
})();
