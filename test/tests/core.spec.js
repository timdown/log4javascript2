describe("Core", function() {
    it("toStr on document.createElement(\"xml\")", function() {
        var x = document.createElement("xml");
        expect(log4javascript.Strings.toStr(x)).toBeTruthy();
    });

    if (window.ActiveXObject) {
        it("toStr on ActiveX XHR", function() {
            var x = new ActiveXObject('Microsoft.XMLHTTP');
            expect(log4javascript.Strings.toStr(x)).toBeTruthy();
        });
    }

    it("isArrayLike on document.forms", function() {
        expect(log4javascript.Arrays.isArrayLike(document.forms)).toBe(true);
    });

    it("isArrayLike on document.images", function() {
        expect(log4javascript.Arrays.isArrayLike(document.images)).toBe(true);
    });

    it("isArrayLike on document.getElementsByTagName", function() {
        expect(log4javascript.Arrays.isArrayLike(document.getElementsByTagName("*"))).toBe(true);
    });

    it("isArrayLike on select options property", function() {
        var select = document.createElement("select");
        expect(log4javascript.Arrays.isArrayLike(select.options)).toBe(true);
    });

    if (typeof document.body.getElementsByClassName != "undefined") {
        it("isArrayLike on getElementsByClassName", function() {
            expect(log4javascript.Arrays.isArrayLike(document.body.getElementsByClassName("test"))).toBe(true);
        });
    }

    it("Array.splice test 1", function() {
        var a = ["Marlon", "Ashley", "Darius", "Lloyd"];
        var deletedItems = a.splice(1, 2);
        expect(a.join(",")).toEqual("Marlon,Lloyd");
        expect(deletedItems.join(",")).toEqual("Ashley,Darius");
    });

    it("Array.splice test 2", function() {
        var a = ["Marlon", "Ashley", "Darius", "Lloyd"];
        var deletedItems = a.splice(1, 1, "Malky", "Jay");
        expect(a.join(",")).toEqual("Marlon,Malky,Jay,Darius,Lloyd");
        expect(deletedItems.join(",")).toEqual("Ashley");
    });

    it("Arrays.remove test", function() {
        var a = ["Marlon", "Ashley", "Darius"];
        log4javascript.Arrays.remove(a, "Darius");
        expect(a.join(",")).toEqual("Marlon,Ashley");
    });
    
    it("Arrays.remove with empty array test", function() {
        var a = [];
        log4javascript.Arrays.remove(a, "Darius");
        expect(a.join(",")).toEqual("");
    });
});
