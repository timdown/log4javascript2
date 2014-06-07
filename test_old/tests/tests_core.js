xn.test.suite("Core", function(s) {
/*
	s.test("getUrlFileName() test", function(t) {
	});
*/

    s.test("toStr on document.createElement(\"xml\")", function(t) {
        var x = document.createElement("xml");
        t.log(log4javascript.Strings.toStr(x));
    });

    if (window.ActiveXObject) {
        s.test("toStr on ActiveX XHR", function(t) {
            var x = new ActiveXObject('Microsoft.XMLHTTP');
            t.log(log4javascript.Strings.toStr(x));
        });
    }

    s.test("isArrayLike on document.forms", function(t) {
        t.assert(log4javascript.Arrays.isArrayLike(document.forms));
    });

    s.test("isArrayLike on document.images", function(t) {
        t.assert(log4javascript.Arrays.isArrayLike(document.images));
    });

    s.test("isArrayLike on document.getElementsByTagName", function(t) {
        t.assert(log4javascript.Arrays.isArrayLike(document.getElementsByTagName("*")));
    });

    s.test("isArrayLike on select options property", function(t) {
        var select = document.createElement("select");
        t.assert(log4javascript.Arrays.isArrayLike(select.options));
    });

    if (typeof document.body.getElementsByClassName != "undefined") {
        s.test("isArrayLike on getElementsByClassName", function(t) {
            t.assert(log4javascript.Arrays.isArrayLike(document.body.getElementsByClassName("test")));
        });
    }

    s.test("Array.splice test 1", function(t) {
        var a = ["Marlon", "Ashley", "Darius", "Lloyd"];
        var deletedItems = a.splice(1, 2);
        t.assertEquals(a.join(","), "Marlon,Lloyd");
        t.assertEquals(deletedItems.join(","), "Ashley,Darius");
    });

    s.test("Array.splice test 2", function(t) {
        var a = ["Marlon", "Ashley", "Darius", "Lloyd"];
        var deletedItems = a.splice(1, 1, "Malky", "Jay");
        t.assertEquals(a.join(","), "Marlon,Malky,Jay,Darius,Lloyd");
        t.assertEquals(deletedItems.join(","), "Ashley");
    });

    s.test("Arrays.remove test", function(t) {
        var a = ["Marlon", "Ashley", "Darius"];
        log4javascript.Arrays.remove(a, "Darius");
        t.assertEquals(a.join(","), "Marlon,Ashley");
    });

	s.test("Arrays.remove with empty array test", function(t) {
		var a = [];
		log4javascript.Arrays.remove(a, "Darius");
		t.assertEquals(a.join(","), "");
	});

}, false);
