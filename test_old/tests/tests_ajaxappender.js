xn.test.suite("AjaxAppender", function(s) {
    s.setUp = function(t) {
        t.logger = log4javascript.getLogger("test");
        t.logger.removeAllAppenders();
        t.appender = new ArrayAppender();
        t.logger.addAppender(t.appender);
    };

    s.tearDown = function(t) {
        t.logger.removeAppender(t.appender);
        log4javascript.resetConfiguration();
    };

    s.test("AjaxAppender JsonLayout single message test", function(t) {
        t.async(10000);
        // Create and add an Ajax appender
        var ajaxAppender = new log4javascript.AjaxAppender("../log4javascript.do");
        ajaxAppender.setLayout(new log4javascript.JsonLayout());
        ajaxAppender.setRequestSuccessCallback(
            function(xmlHttp) {
                // Response comes back as JSON array of messages logged
                var jsonResponse = xmlHttp.responseText;
                var arr = eval(jsonResponse);
                t.assertEquals(arr.length, 1);
                t.assertEquals(arr[0], "TEST");
                t.succeed();
            }
        );
        ajaxAppender.setFailCallback(
            function(msg) {
                t.fail(msg);
            }
        );
        t.logger.addAppender(ajaxAppender);
        t.logger.debug("TEST");
    });

    s.test("AjaxAppender JsonLayout batched messages test", function(t) {
        t.async(10000);
        var message1 = "TEST 1";
        var message2 = "String with \"lots of 'quotes'\" + plusses in";
        var message3 = "A non-threatening string";
        // Create and add an Ajax appender
        var ajaxAppender = new log4javascript.AjaxAppender("../log4javascript.do");
        ajaxAppender.setLayout(new log4javascript.JsonLayout());
        ajaxAppender.setBatchSize(3);
        ajaxAppender.setRequestSuccessCallback(
            function(xmlHttp) {
                // Response comes back as JSON array of messages logged
                var jsonResponse = xmlHttp.responseText;
                var arr = eval(jsonResponse);
                t.assertEquals(arr.length, 3);
                t.assertEquals(arr[0], message1);
                t.assertEquals(arr[1], message2);
                t.assertEquals(arr[2], message3);
                t.succeed();
            }
        );
        ajaxAppender.setFailCallback(
            function(msg) {
                t.fail(msg);
            }
        );
        t.logger.addAppender(ajaxAppender);
        t.logger.debug(message1);
        t.logger.info(message2);
        t.logger.warn(message3);
    });

    s.test("AjaxAppender HttpPostDataLayout single message test", function(t) {
        t.async(10000);
        // Create and add an Ajax appender
        var ajaxAppender = new log4javascript.AjaxAppender("../log4javascript.do");
        var testMessage = "TEST +\"1\"";
        ajaxAppender.setLayout(new log4javascript.HttpPostDataLayout());
        ajaxAppender.setRequestSuccessCallback(
            function(xmlHttp) {
                // Response comes back as JSON array of messages logged
                var jsonResponse = xmlHttp.responseText;
                var arr = eval(jsonResponse);
                t.assertEquals(arr.length, 1);
                t.assertEquals(arr[0], testMessage);
                t.succeed();
            }
        );
        ajaxAppender.setFailCallback(
            function(msg) {
                t.fail(msg);
                ajaxErrorMessage = msg;
            }
        );
        t.logger.addAppender(ajaxAppender);
        t.logger.debug(testMessage);
    });
}, false);
