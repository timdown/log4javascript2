xn.test.suite("SimpleDateFormat", function(s) {
	//var applet = document.applets["simpledateformat"];

	/* ---------------------------------------------------------- */

	//var format1 = "EEE MMM dd HH:mm:ss yyyy GG";
	var format1Components = [
			"G",
			"GG",
			"GGG",
			"GGGG",
			"GGGGG",
			"y",
			"yy",
			"yyy",
			"yyyy",
			"yyyyy",
			"M",
			"MM",
			"MMM",
			"MMMM",
			"w",
			"ww",
			"www",
			"W",
			"WW",
			"WWW",
			"D",
			"DD",
			"DDD",
			"DDDD",
			"d",
			"dd",
			"ddd",
			"F",
			"FF",
			"FFF",
			"E",
			"EE",
			"EEE",
			"EEEE",
			"EEEEE",
			"EEEEEEEEEE",
			"a",
			"aa",
			"aaa",
			"aaaa",
			"aaaaa",
			"H",
			"HH",
			"HHH",
			"k",
			"kk",
			"kkk",
			"K",
			"KK",
			"KKK",
			"h",
			"hh",
			"hhh",
			"m",
			"mm",
			"mmm",
			"s",
			"ss",
			"sss",
			"S",
			"SS",
			"SSS",
			"SSSS"
			];

	var date1 = new Date();
	date1.setFullYear(2006);
	date1.setMonth(7);
	date1.setDate(30);
	date1.setHours(0);
	date1.setMinutes(38);
	date1.setSeconds(45);
	date1.setMilliseconds(58);

	var date1Format1ExpectedComponents = {
		"G" : "AD",
		"GG" : "AD",
		"GGG" : "AD",
		"GGGG" : "AD",
		"GGGGG" : "AD",
		"y" : "06",
		"yy" : "06",
		"yyy" : "06",
		"yyyy" : "2006",
		"yyyyy" : "02006",
		"M" : "8",
		"MM" : "08",
		"MMM" : "Aug",
		"MMMM" : "August",
		"w" : "35",
		"ww" : "35",
		"www" : "035",
		"W" : "5",
		"WW" : "05",
		"WWW" : "005",
		"D" : "242",
		"DD" : "242",
		"DDD" : "242",
		"DDDD" : "0242",
		"d" : "30",
		"dd" : "30",
		"ddd" : "030",
		"F" : "5",
		"FF" : "05",
		"FFF" : "005",
		"E" : "Wed",
		"EE" : "Wed",
		"EEE" : "Wed",
		"EEEE" : "Wednesday",
		"EEEEE" : "Wednesday",
		"EEEEEEEEEE" : "Wednesday",
		"a" : "AM",
		"aa" : "AM",
		"aaa" : "AM",
		"aaaa" : "AM",
		"aaaaa" : "AM",
		"H" : "0",
		"HH" : "00",
		"HHH" : "000",
		"k" : "24",
		"kk" : "24",
		"kkk" : "024",
		"K" : "0",
		"KK" : "00",
		"KKK" : "000",
		"h" : "12",
		"hh" : "12",
		"hhh" : "012",
		"m" : "38",
		"mm" : "38",
		"mmm" : "038",
		"s" : "45",
		"ss" : "45",
		"sss" : "045",
		"S" : "58",
		"SS" : "58",
		"SSS" : "058",
		"SSSS" : "0058"
	};

	function testManual(jsDate, format, expectedValue, test) {
		var sdf = new log4javascript.SimpleDateFormat(format);
		test.assertEquals(sdf.format(jsDate), expectedValue);
	}

/*
	function testAgainstJava(jsDate, format, test) {
		var sdf = new log4javascript.SimpleDateFormat(format);
		test.assertEquals(sdf.format(jsDate), String(applet.format(format, jsDate.getTime())));
	}
*/

	var date1Format1ExpectedComponentsArray = [];
	for (var i = 0; i < format1Components.length; i++) {
		date1Format1ExpectedComponentsArray[i] = date1Format1ExpectedComponents[format1Components[i]];
	}

	var format1 = format1Components.join(" "); // separate with spaces to make it readable
	var date1Format1Expected = date1Format1ExpectedComponentsArray.join(" ");

	s.test("SimpleDateFormat date 1, JavaScript SimpleDateFormat against expected value", function(t) {
		testManual(date1, format1, date1Format1Expected, t);
	});

/*
	s.test("SimpleDateFormat date 1, JavaScript SimpleDateFormat against Java SimpleDateFormat", function(t) {
		testAgainstJava(date1, format1, t);
	});

	s.test("SimpleDateFormat date 2, JavaScript SimpleDateFormat against Java SimpleDateFormat", function(t) {
		var date2 = new Date(2005, 7, 30, 12, 1, 23);
		testAgainstJava(date1, format1, t);
	});

	s.test("SimpleDateFormat date 3, JavaScript SimpleDateFormat against Java SimpleDateFormat", function(t) {
		var date2 = new Date(2004, 7, 30, 12, 1, 23);
		testAgainstJava(date1, format1, t);
	});

	s.test("SimpleDateFormat date 4, JavaScript SimpleDateFormat against Java SimpleDateFormat", function(t) {
		var date2 = new Date(2003, 2, 6, 1, 5, 44);
		testAgainstJava(date1, format1, t);
	});
*/
}, false);
