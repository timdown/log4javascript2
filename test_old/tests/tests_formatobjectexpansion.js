xn.test.suite("Format object expansion", function(s) {
    s.test("expandObject", function(t) {
        var o = { b: 1, c: "test", d: { e: 3 } };
        var o2 = { p: o, o: o, f: function(arg) {alert(arg);}, h: "hello", a: ["a", "b", "c"] };

        var expansion = log4javascript.expandObject(o2, 4, "  ", true, true, true);
        t.log(expansion);
        t.log(expansion.toDefaultString().join("\r\n"));
    });

    s.test("expand date", function(t) {
        var date = new Date(2011, 11, 7);
        var expansion = log4javascript.expandObject(date);
        t.assertEquals(expansion.toDefaultString(), date.toString());
    });
}, false);
