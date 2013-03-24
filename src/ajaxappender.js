(function(api) {
    var handleError = api.reportError,
        factoryFound = false,
        UNDEFINED = "undefined",
        stringParam = api.stringParam,
        intParam = api.intParam,
        functionParam = api.functionParam,
        boolParam = api.boolParam,
        urlEncode = api.Strings.urlEncode,
        emptyFunction = function() {};

    if (!api.environment.isBrowser) {
        alert("AjaxAppender can only work when running in a browser");
        return;
    }

    var createXmlHttpRequest = (function() {
        var factories = [
            // Favour the ActiveX implementation because IE 7's non-ActiveX implementation does not work with file://
            // URLs
            function() { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); },
            function() { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); },
            function() { return new ActiveXObject("Microsoft.XMLHTTP"); },
            function() { return new XMLHttpRequest(); }
        ];

        for (var i = 0, len = factories.length; i < len; ++i) {
            try {
                if ( factories[i]() ) {
                    factoryFound = true;
                    return factories[i];
                }
            }
            catch (e) {}
        }
    })();

    function ajaxIsSupported() {
        if (!factoryFound) {
            handleError("AjaxAppender: could not create XMLHttpRequest object. AjaxAppenders disabled");
            return false;
        }
        return true;
    }

    api.createXmlHttpRequest = createXmlHttpRequest;

    function isHttpRequestSuccessful(xmlHttp) {
        return (typeof xmlHttp.status == UNDEFINED || xmlHttp.status === 0 ||
            (xmlHttp.status >= 200 && xmlHttp.status < 300) );
    }

    var defaults = {
        waitForResponse: false,
        timed: false,
        timerInterval: 1000,
        batchSize: 1,
        sendAllOnUnload: true,
        requestSuccessCallback: null,
        failCallback: null,
        postVarName: "data",
        sendAsFormData: false
    };

    function AjaxAppender(url) {
        var appender = this;
        var isSupported = ajaxIsSupported();

        if (!url) {
            handleError("AjaxAppender: URL must be specified in constructor");
            isSupported = false;
        }

        var timed = defaults.timed;
        var waitForResponse = defaults.waitForResponse;
        var batchSize = defaults.batchSize;
        var timerInterval = defaults.timerInterval;
        var requestSuccessCallback = defaults.requestSuccessCallback;
        var failCallback = defaults.failCallback;
        var postVarName = defaults.postVarName;
        var sendAllOnUnload = defaults.sendAllOnUnload;
        var sendAsFormData = defaults.sendAsFormData;
        var sessionId = null;

        var queuedLoggingEvents = [];
        var queuedRequests = [];
        var sending = false;
        var initialized = false;

        // Configuration methods. The function scope is used to prevent
        // direct alteration to the appender configuration properties.
        function checkCanConfigure(configOptionName) {
            if (initialized) {
                handleError("AjaxAppender: configuration option '" +
                    configOptionName +
                    "' may not be set after the appender has been initialized");
                return false;
            }
            return true;
        }

        this.getSessionId = function() { return sessionId; };
        this.setSessionId = function(sessionIdParam) {
            sessionId = stringParam(sessionIdParam, null);
            this.layout.setCustomField("sessionid", sessionId);
        };

        this.setLayout = function(layoutParam) {
            if (checkCanConfigure("layout")) {
                this.layout = layoutParam;
                // Set the session id as a custom field on the layout, if not already present
                if (sessionId !== null) {
                    this.setSessionId(sessionId);
                }
            }
        };

        this.isTimed = function() { return timed; };
        this.setTimed = function(timedParam) {
            if (checkCanConfigure("timed")) {
                timed = !!timedParam;
            }
        };

        this.getTimerInterval = function() { return timerInterval; };
        this.setTimerInterval = function(timerIntervalParam) {
            if (checkCanConfigure("timerInterval")) {
                timerInterval = intParam(timerIntervalParam, timerInterval);
            }
        };

        this.isWaitForResponse = function() { return waitForResponse; };
        this.setWaitForResponse = function(waitForResponseParam) {
            if (checkCanConfigure("waitForResponse")) {
                waitForResponse = !!waitForResponseParam;
            }
        };

        this.getBatchSize = function() { return batchSize; };
        this.setBatchSize = function(batchSizeParam) {
            if (checkCanConfigure("batchSize")) {
                batchSize = intParam(batchSizeParam, batchSize);
            }
        };

        this.isSendAllOnUnload = function() { return sendAllOnUnload; };
        this.setSendAllOnUnload = function(sendAllOnUnloadParam) {
            if (checkCanConfigure("sendAllOnUnload")) {
                sendAllOnUnload = intParam(sendAllOnUnloadParam, sendAllOnUnload);
            }
        };

        this.setRequestSuccessCallback = function(requestSuccessCallbackParam) {
            requestSuccessCallback = functionParam(requestSuccessCallbackParam, requestSuccessCallback);
        };

        this.setFailCallback = function(failCallbackParam) {
            failCallback = functionParam(failCallbackParam, failCallback);
        };

        this.getPostVarName = function() { return postVarName; };
        this.setPostVarName = function(postVarNameParam) {
            if (checkCanConfigure("postVarName")) {
                postVarName = stringParam(postVarNameParam, postVarName);
            }
        };

        this.isSendAsFormData = function() { return sendAsFormData; };
        this.setSendAsFormData = function(sendAsFormDataParam) {
            if (checkCanConfigure("sendAsFormData")) {
                sendAsFormData = boolParam(sendAsFormDataParam, sendAsFormDataParam);
            }
        };

        // Internal functions
        function sendAll() {
            if (isSupported && api.enabled) {
                sending = true;
                var currentRequestBatch;
                if (waitForResponse) {
                    // Send the first request then use this function as the callback once
                    // the response comes back
                    if (queuedRequests.length > 0) {
                        currentRequestBatch = queuedRequests.shift();
                        sendRequest(preparePostData(currentRequestBatch), sendAll);
                    } else {
                        sending = false;
                        if (timed) {
                            scheduleSending();
                        }
                    }
                } else {
                    // Rattle off all the requests without waiting to see the response
                    while ( (currentRequestBatch = queuedRequests.shift()) ) {
                        sendRequest(preparePostData(currentRequestBatch));
                    }
                    sending = false;
                    if (timed) {
                        scheduleSending();
                    }
                }
            }
        }

        this.sendAll = sendAll;

        // Called when the window unloads. At this point we're past caring about
        // waiting for responses or timers or incomplete batches - everything
        // must go, now
        function sendAllRemaining() {
            if (isSupported && api.enabled) {
                // Create requests for everything left over, batched as normal
                var actualBatchSize = appender.getLayout().allowBatching() ? batchSize : 1;
                var currentLoggingEvent;
                var batchedLoggingEvents = [];
                while ( (currentLoggingEvent = queuedLoggingEvents.shift()) ) {
                    batchedLoggingEvents[batchedLoggingEvents.length] = currentLoggingEvent;
                    if (queuedLoggingEvents.length >= actualBatchSize) {
                        // Queue this batch of log entries
                        queuedRequests[queuedRequests.length] = batchedLoggingEvents;
                        batchedLoggingEvents = [];
                    }
                }
                // If there's a partially completed batch, add it
                if (batchedLoggingEvents.length > 0) {
                    queuedRequests[queuedRequests.length] = batchedLoggingEvents;
                }
                waitForResponse = false;
                timed = false;
                sendAll();
            }
        }

        function preparePostData(batchedLoggingEvents) {
            // Format the logging events
            var formattedMessages = [];
            var currentLoggingEvent;
            var postData = "";
            var layout = appender.getLayout();
            while ( (currentLoggingEvent = batchedLoggingEvents.shift()) ) {
                var currentFormattedMessage = layout.format(currentLoggingEvent);
                if (layout.ignoresThrowable()) {
                    currentFormattedMessage += currentLoggingEvent.getThrowableStrRep();
                }
                formattedMessages[formattedMessages.length] = currentFormattedMessage;
            }
            // Create the post data string
            if (batchedLoggingEvents.length == 1) {
                postData = formattedMessages.join("");
            } else {
                postData = layout.batchHeader + formattedMessages.join(layout.batchSeparator) + layout.batchFooter;
            }

            if (sendAsFormData || layout.returnsFormData) {
                postData = layout.returnsFormData ? postData : urlEncode(postVarName) + "=" + urlEncode(postData);
                // Add the layout name to the post data
                if (postData.length > 0) {
                    postData += "&";
                }
                return postData + "layout=" + urlEncode("" + layout);
            } else {
                return postData;
            }
        }

        function scheduleSending() {
            window.setTimeout(sendAll, timerInterval);
        }

        function sendRequest(postData, successCallback) {
            try {
                var xmlHttp = createXmlHttpRequest();
                var layout = appender.getLayout();
                if (isSupported) {
                    if (xmlHttp.overrideMimeType) {
                        xmlHttp.overrideMimeType(layout.getContentType());
                    }
                    xmlHttp.onreadystatechange = function() {
                        if (xmlHttp.readyState == 4) {
                            if (isHttpRequestSuccessful(xmlHttp)) {
                                if (requestSuccessCallback) {
                                    requestSuccessCallback(xmlHttp);
                                }
                                if (successCallback) {
                                    successCallback(xmlHttp);
                                }
                            } else {
                                var msg = "AjaxAppender.append: XMLHttpRequest request to URL " +
                                    url + " returned status code " + xmlHttp.status;
                                handleError(msg);
                                if (failCallback) {
                                    failCallback(msg);
                                }
                            }
                            // Setting onreadystatechange to null causes an error in IE since XMLHttpRequest is an
                            // ActiveX object
                            xmlHttp.onreadystatechange = emptyFunction;
                            xmlHttp = null;
                        }
                    };
                    xmlHttp.open("POST", url, true);
                    try {
                        var contentType = sendAsFormData || layout.returnsFormData ?
                                          "application/x-www-form-urlencoded" : layout.getContentType();
                        xmlHttp.setRequestHeader("Content-Type", contentType);
                    } catch (headerEx) {
                        var msg = "AjaxAppender.append: your browser's XMLHttpRequest implementation" +
                            " does not support setRequestHeader, therefore cannot post data. AjaxAppender disabled";
                        handleError(msg);
                        isSupported = false;
                        if (failCallback) {
                            failCallback(msg);
                        }
                        return;
                    }
                    xmlHttp.send(postData);
                }
            } catch (ex) {
                var errMsg = "AjaxAppender.append: error sending log message to " + url;
                handleError(errMsg, ex);
                isSupported = false;
                if (failCallback) {
                    failCallback(errMsg + ". Details: " + api.exceptionToStr(ex));
                }
            }
        }

        this.append = function(loggingEvent) {
            if (isSupported) {
                if (!initialized) {
                    init();
                }
                queuedLoggingEvents[queuedLoggingEvents.length] = loggingEvent;
                var actualBatchSize = this.getLayout().allowBatching() ? batchSize : 1;

                if (queuedLoggingEvents.length >= actualBatchSize) {
                    var currentLoggingEvent;
                    var batchedLoggingEvents = [];
                    while ( (currentLoggingEvent = queuedLoggingEvents.shift()) ) {
                        batchedLoggingEvents[batchedLoggingEvents.length] = currentLoggingEvent;
                    }
                    // Queue this batch of log entries
                    queuedRequests[queuedRequests.length] = batchedLoggingEvents;

                    // If using a timer, the queue of requests will be processed by the
                    // timer function, so nothing needs to be done here.
                    if ( !timed && (!waitForResponse || (waitForResponse && !sending)) ) {
                        sendAll();
                    }
                }
            }
        };

        function init() {
            initialized = true;
            // Add unload event to send outstanding messages
            if (sendAllOnUnload) {
                api.environment.addWindowEvent("unload", sendAllRemaining);
            }
            // Start timer
            if (timed) {
                scheduleSending();
            }
        }
    }

    AjaxAppender.prototype = new api.Appender();

    AjaxAppender.prototype.defaults = {
        waitForResponse: false,
        timed: false,
        timerInterval: 1000,
        batchSize: 1,
        sendAllOnUnload: true,
        requestSuccessCallback: null,
        failCallback: null,
        postVarName: "data",
        sendAsFormData: false
    };

    AjaxAppender.prototype.layout = new api.HttpPostDataLayout();

    AjaxAppender.prototype.toString = function() {
        return "AjaxAppender";
    };

    api.AjaxAppender = AjaxAppender;
})(log4javascript);
