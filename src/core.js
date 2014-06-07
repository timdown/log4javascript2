var log4javascript = (function() {
    var UNDEFINED = "undefined",
        STRING = "string",
        NUMBER = "number",
        OBJECT = "object",
        FUNCTION = "function",
        UNKNOWN = "unknown",
        startUpTime = new Date(),
        environment,

        // Create a reference to the global object
        global = (function() { return this; })(),
        objectToString = Object.prototype.toString;

    /* ---------------------------------------------------------------------- */

    /* Array-related */

    var arrayIndexOf = Array.prototype.indexOf ?
        function(arr, val) {
            return arr.indexOf(val);
        } :

        function(arr, val) {
            for (var i = 0, len = arr.length; i < len; ++i) {
                if (arr[i] === val) {
                    return i;
                }
            }
            return -1;
        };

    function arrayRemove(arr, val) {
        var index = arrayIndexOf(arr, val);
        if (index >= 0) {
            arr.splice(index, 1);
            return true;
        } else {
            return false;
        }
    }

    function arrayContains(arr, val) {
        return arrayIndexOf(arr, val) > -1;
    }

    function toArray(args, startIndex, endIndex) {
        return Array.prototype.slice.call(args, startIndex, endIndex);
    }

    var nodeListExists = (typeof global.NodeList != UNDEFINED),
        htmlCollectionExists = (typeof global.HTMLCollection != UNDEFINED);

    /*
     We want anything Array-like to be treated as an array in expansions, including host collections such as NodeList
     and HTMLCollection. The function for most environments first checks instanceof, then tries the so-called
     'Miller Method', then tries duck typing for a finite length property and presence of a splice method, checks for
     arguments collection and finally checks for some the array-like host objects NodeList and HTMLCollection.
     */
    function isArrayLike(o) {
        return o instanceof Array ||
            objectToString.call(o) == "[object Array]" ||
            (typeof o == OBJECT && isFinite(o.length) &&
                /* Duck typing check for Array objects, arguments objects and IE node lists respectively */
                (typeof o.splice != UNDEFINED || typeof o.callee == FUNCTION || typeof o.item != UNDEFINED) ) ||
            (nodeListExists && o instanceof global.NodeList) ||
            (htmlCollectionExists && o instanceof global.HTMLCollection);
    }

    /* ---------------------------------------------------------------------- */

    /* Custom events, implemented as a mixin */

    var addCustomEventSupport = (function() {
        function createListenersArray(obj, eventType) {
            var created = false;
            var listeners = obj.eventListeners;
            if (!listeners) {
                obj.eventListeners = listeners = {};
            }
            if (!listeners[eventType]) {
                listeners[eventType] = [];
                created = true;
            }
            return created;
        }

        function addEventListener(eventType, listener) {
            createListenersArray(this, eventType);
            this.eventListeners[eventType].push(listener);
        }

        function removeEventListener(eventType, listener) {
            if (!createListenersArray(this, eventType)) {
                arrayRemove(this.eventListeners[eventType], listener);
            }
        }

        function dispatchEvent(eventType, eventArgs) {
            if (!createListenersArray(this, eventType)) {
                var listeners = this.eventListeners[eventType].slice(0);
                for (var i = 0, len = listeners.length; i < len; ++i) {
                    listeners[i](this, eventType, eventArgs);
                }
            }
        }

        return function(obj) {
            obj.addEventListener = addEventListener;
            obj.removeEventListener = removeEventListener;
            obj.dispatchEvent = dispatchEvent;
        };
    })();

    /* ---------------------------------------------------------------------- */

    function Log4JavaScript() {}

    addCustomEventSupport(Log4JavaScript.prototype);

    var api = new Log4JavaScript();
    api.version = "2.0";
    api.startUpTime = startUpTime;
    api.uniqueId = "log4javascript_" + (+startUpTime) + "_" + Math.floor(Math.random() * 1e8);
    api.enabled = !( (typeof global.log4javascript_disabled != UNDEFINED) && global.log4javascript_disabled );
    api.addCustomEventSupport = addCustomEventSupport;
    api.globalObj = global;
    api.showStackTraces = false;

    function reportError(message, exception) {
        api.dispatchEvent("error", { "message": message, "exception": exception });
    }

    api.reportError = reportError;

    api.Arrays = {
        indexOf: arrayIndexOf,
        remove: arrayRemove,
        contains: arrayContains,
        toArray: toArray,
        isArrayLike: isArrayLike
    };

    /* ---------------------------------------------------------------------- */

    /* Core feature tests */

    function failCoreFeatureTests(failedTestName) {
        var fullMessage = "Your environment does not support all the features required by log4javascript." +
                "Test failed: " + failedTestName;

        if (window) {
            fullMessage += [
                "\n\nlog4javascript is known to work in the following browsers:\n",
                "- Firefox 3.0 and higher",
                "- Internet Explorer 7 and higher",
                "- Google Chrome",
                "- Safari 4 and higher",
                "- Opera 9 and higher"
            ].join("\n");
        }
        alert(fullMessage);
    }

    var featureTests = [];

    function addFeatureTest(name, testFunc) {
        featureTests[featureTests.length] = [name, testFunc];
    }

    api.addFeatureTest = addFeatureTest;

    /* ---------------------------------------------------------------------- */
    /* Utility functions */

    /*
    Checks if the specified property can successfully be evaluated on the specified object. This is designed to work
    on all objects, including host objects
     */
    function canEvaluateProperty(obj, prop) {
        var t = typeof obj[prop];
        return t != UNKNOWN;
    }

    api.canEvaluateProperty = canEvaluateProperty;

    function toStr(obj) {
        if (typeof obj == STRING) {
            return obj;
        } else {
            try {
                return String(obj);
            } catch (e) {
                try {
                    return objectToString.call(obj);
                } catch (eInner) {
                    return "";
                }
            }
        }
    }

    function splitIntoLines(str) {
        // Normalize all line breaks to just \n and then split on \n
        return str.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    }

    // Returns a string consisting of len concatenated copies of str
    // TODO: Research most efficient way of doing this
    function createCharString(str, len) {
        var a = [];
        a.length = len + 1;
        return a.join(str);
    }

    function leftPad(str, len, padStr) {
        return len > 0 ? createCharString(padStr, len) + str : str;
    }

    function rightPad(str, len, padStr) {
        return len > 0 ? str + createCharString(padStr, len) : str;
    }

    // TODO: Research errors properly
    var isError = (function() {
        var errorConstructors = [];
        var errorPotentialConstructors = [global.Error, global.DOMException, global.RangeException,
            global.EventException];
        var i = errorPotentialConstructors.length, c;
        while (i--) {
            c = errorPotentialConstructors[i];
            if (typeof c != UNDEFINED) {
                errorConstructors.push(c);
            }
        }

        return function(o) {
            var i = errorConstructors.length, c;
            while (i--) {
                c = errorConstructors[i];

                if (o instanceof c) {
                    return true;
                }
            }
            return false;
        };
    })();

    api.isError = isError;

    var hasOwnPropertyExists = !!{}.hasOwnProperty;

    api.addFeatureTest("hasOwnProperty", function() {
        return hasOwnPropertyExists;
    });

    var extend;

    if (hasOwnPropertyExists) {
        api.extend = extend = function(o, props) {
            for (var i in props) {
                if (props.hasOwnProperty(i)) {
                    o[i] = props[i];
                }
            }
        };
    }
    
    if (extend) {
        api.createSettings = function(defaults) {
            function Settings() {}
            
            var proto = Settings.prototype;
            extend(proto, defaults);
            proto.defaults = defaults;

            proto.set = function(props) {
                for (var i in props) {
                    if (defaults.hasOwnProperty(i) && props.hasOwnProperty(i)) {
                        this[i] = props[i];
                    }
                }
            };

            return new Settings();
        };
    }

    function getExceptionMessage(ex) {
        return ex.message || ex.description || toStr(ex);
    }

    api.addFeatureTest("encodeURIComponent", function() {
        return typeof encodeURIComponent == FUNCTION;
    });

    function urlEncode(str) {
        return encodeURIComponent(str);
    }

    // Returns the portion of the URL after the last slash
    function getUrlFileName(url) {
        var lastSlashIndex = Math.max( url.lastIndexOf("/"), url.lastIndexOf("\\") );
        return url.substr(lastSlashIndex + 1);
    }

    api.Strings = {
        toStr: toStr,
        splitIntoLines: splitIntoLines,
        leftPad: leftPad,
        rightPad: rightPad,
        getUrlFileName: getUrlFileName,
        urlEncode: urlEncode
    };

    // Returns a nicely formatted representation of an error
    // TODO: Research safest way of getting string representations of error and error-like objects
    function exceptionToStr(ex) {
        if (ex) {
            var exStr = "Exception: " + getExceptionMessage(ex);
            try {
                if (typeof ex.lineNumber != UNDEFINED) {
                    exStr += " on line number " + ex.lineNumber;
                }
                if (typeof ex.fileName != UNDEFINED) {
                    exStr += " in file " + getUrlFileName(ex.fileName);
                }
            } catch (localEx) {
            }
            if (api.showStackTraces && typeof ex.stack != UNDEFINED) {
                exStr += "\r\nStack trace:\r\n" + ex.stack;
            }
            return exStr;
        }
        return null;
    }

    api.exceptionToStr = exceptionToStr;

    /* ---------------------------------------------------------------------- */
    /* Browser-related */

    if (typeof window != UNDEFINED) {
        var BrowserEnvironment = function() {
            this.isBrowser = true;
        };

        BrowserEnvironment.prototype = {
            addWindowEvent: function(type, listenerFn) {
                if (typeof window.addEventListener != UNDEFINED) {
                    window.addEventListener(type, listenerFn, false);
                } else if (typeof window.attachEvent != UNDEFINED) {
                    window.attachEvent("on" + type, listenerFn);
                }
            }
        };

        addCustomEventSupport(BrowserEnvironment.prototype);
        api.environment = new BrowserEnvironment();
        window.log4javascript = api;
    } else {
        api.environment = {
            isBrowser: false
        };
    }

    /*------------------------------------------------------------------------*/

    for (var i = 0, len = featureTests.length; i < len ; ++i) {
        if (!featureTests[i][1]()) {
            failCoreFeatureTests(featureTests[i][0]);
            return null;
        }
    }

    return api;
})();