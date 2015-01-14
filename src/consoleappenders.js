(function(api) {
    var Arrays = api.Arrays;

    if (!api.environment.isBrowser) {
        api.failModule("ConsoleAppenders", "this module is for browser environments only");
        return;
    }

    if (!api.isHostObject(document.createElement("div"), "ownerDocument")) {
        api.failModule("ConsoleAppenders", "ownerDocument is not supported");
        return;
    }

    function addChildElement(parent, tagNames, properties) {
        if (Arrays.isArrayLike(tagNames)) {
            Arrays.forEach(tagNames, function(tagName) {
                parent = addChildElement(parent, tagName, properties);
            });
            return parent;
        } else {
            var el = parent.ownerDocument.createElement(tagNames);
            api.extendHostObject(el, properties);
            return parent.appendChild(el);
        }
    }

    function addChildText(parent, text, lineBreaksToBrs) {
        var lines = lineBreaksToBrs ? text.split("\n") : [text];
        var doc = parent.ownerDocument;

        for (var i = 0, len = lines.length; i < len; ++i) {
            if (i > 0) {
                addChildElement(parent, "br");
            }
            parent.appendChild( doc.createTextNode(lines[i]) );
        }

        return parent.lastChild;
    }

    function RenderedLoggingEvent(loggingEvent, formattedMessage) {
        this.loggingEvent = loggingEvent;
        this.formattedMessage = formattedMessage;
    }

    RenderedLoggingEvent.prototype.draw = function(console) {
        addChildElement(console.containerElement, "div", {
            textContent: this.formattedMessage,
            className: this.loggingEvent.level.name
        });
    };

    function Console(options) {
        this.options = options;
        this.queuedEvents = [];
        
        var console = this;
        this.boundDrawQueuedEvents = function() {
            console.drawQueuedEvents();
        };
    }
    
    api.extend(Console.prototype, {
        draw: function(containerElement) {
            this.containerElement = containerElement;
            this.doc = containerElement.ownerDocument;
            this.consoleWindow = this.doc.defaultView || this.doc.parentWindow;

            addChildElement(containerElement, "div", {
                innerHTML: "Console!"
            });

            this.drawQueuedEvents();
            this.drawn = true;
        },
        
        queueEvent: function(event) {
            this.queuedEvents.push(event);
            if (this.drawn) {
                if (this.drawQueuedEventsTimer) {
                    window.clearTimeout(this.drawQueuedEventsTimer);
                }
                this.drawQueuedEventsTimer = window.setTimeout(this.boundDrawQueuedEvents, 100);
            }
        },
        
        drawQueuedEvents: function() {
            var events = this.queuedEvents;
            for (var i = 0, event; event = events[i++]; ) {
                event.draw(this);
            }
            events.length = 0;
            if (this.options.focusConsoleWindow) {
                this.consoleWindow.focus();
            }
        },
        
        log: function(message) {
            addChildElement(this.containerElement, "div", {
                textContent: message
            });
        }
    });

    function InPageAppender(options) {
        var console, appender = this;
        appender.console = console = new Console(options);
        
        window.addEventListener("load", function() {
            var containerElement = options.containerElement;
            if (typeof containerElement == "string") {
                containerElement = document.getElementById(containerElement);
            }
            if (!containerElement) {
                containerElement = addChildElement(document.body, "div", { className: "log4javascript_inPageAppender" });
            }
            console.draw(containerElement);
        });
    }

    InPageAppender.prototype = new api.Appender();

    api.extend(InPageAppender.prototype, {
        layout: new api.PatternLayout(),

        append: function(loggingEvent) {
            var layout = this.getLayout();
            var formattedMessage = layout.format(loggingEvent);
            if (layout.ignoresThrowable()) {
                formattedMessage += loggingEvent.getThrowableStrRep();
            }
            this.console.queueEvent( new RenderedLoggingEvent(loggingEvent, formattedMessage) );
        },
        
        

        toString: function() {
            return "InPageAppender";
        }
    });

    api.InPageAppender = InPageAppender;


})(log4javascript);