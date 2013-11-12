(function(api) {
    var UNDEF = "undefined",
        leftPad = api.Strings.leftPad,
        regex = /('[^']*')|(G+|y+|M+|w+|W+|D+|d+|F+|E+|a+|H+|k+|K+|h+|m+|s+|S+|Z+)|([a-zA-Z]+)/g,
        monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"],
        dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        TEXT2 = 0,
        TEXT3 = 1,
        YEAR = 2,
        MONTH = 3,
        TIMEZONE = 4,
        types = {
            G: TEXT2,
            y: YEAR,
            M: MONTH,
            E: TEXT3,
            a: TEXT2,
            Z: TIMEZONE
        },
        ONE_DAY = 24 * 60 * 60 * 1000,
        ONE_WEEK = 7 * ONE_DAY,
        DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK = 1;

    function getUTCTime(d) {
        return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(),
                d.getSeconds(), d.getMilliseconds());
    }

    function getTimeBetween(d1, d2) {
        return getUTCTime(d1) - getUTCTime(d2);
    }

    function getPreviousSunday(d) {
        // Using midday avoids any possibility of DST messing things up
        var midday = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
        var previousSunday = new Date(midday - d.getDay() * ONE_DAY);
        return new Date(previousSunday.getFullYear(), previousSunday.getMonth(), previousSunday.getDate());
    }

    function getWeekInYear(d, minimalDaysInFirstWeek) {
        if (typeof minimalDaysInFirstWeek == UNDEF) {
            minimalDaysInFirstWeek = DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;
        }
        var previousSunday = getPreviousSunday(d);
        var startOfYear = new Date(d.getFullYear(), 0, 1);
        var numberOfSundays = (previousSunday < startOfYear) ?
            0 : 1 + Math.floor(getTimeBetween(previousSunday, startOfYear) / ONE_WEEK);
        var numberOfDaysInFirstWeek =  7 - startOfYear.getDay();
        var weekInYear = numberOfSundays;
        if (numberOfDaysInFirstWeek < minimalDaysInFirstWeek) {
            weekInYear--;
        }
        return weekInYear;
    }

    function getWeekInMonth(d, minimalDaysInFirstWeek) {
        if (typeof minimalDaysInFirstWeek == UNDEF) {
            minimalDaysInFirstWeek = DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;
        }
        var previousSunday = getPreviousSunday(d);
        var startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        var numberOfSundays = (previousSunday < startOfMonth) ?
            0 : 1 + Math.floor(getTimeBetween(previousSunday, startOfMonth) / ONE_WEEK);
        var numberOfDaysInFirstWeek =  7 - startOfMonth.getDay();
        var weekInMonth = numberOfSundays;
        if (numberOfDaysInFirstWeek >= minimalDaysInFirstWeek) {
            weekInMonth++;
        }
        return weekInMonth;
    }

    function getDayInYear(d) {
        var startOfYear = new Date(d.getFullYear(), 0, 1);
        return 1 + Math.floor(getTimeBetween(d, startOfYear) / ONE_DAY);
    }

    /* ------------------------------------------------------------------ */

    function formatText(data, numberOfLetters, minLength) {
        return (numberOfLetters >= 4) ? data : data.slice(0, Math.max(minLength, numberOfLetters));
    }

    function formatNumber(data, numberOfLetters) {
        var dataString = "" + data;
        // Pad with 0s as necessary
        return leftPad(dataString, numberOfLetters - dataString.length, "0");
    }

    function SimpleDateFormat(formatString) {
        this.formatString = formatString;
        this.minimalDaysInFirstWeek = DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;
    }

    api.extend(SimpleDateFormat.prototype, {
        /**
         * Sets the minimum number of days in a week in order for that week to be considered as belonging to a
         * particular month or year
         */
        setMinimalDaysInFirstWeek: function(days) {
            this.minimalDaysInFirstWeek = days;
        },

        getMinimalDaysInFirstWeek: function() {
            return typeof this.minimalDaysInFirstWeek == UNDEF ?
                DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK : this.minimalDaysInFirstWeek;
        },

        format: function(date) {
            var simpleDateFormat = this;

            return this.formatString.replace(regex, function(matched, quotedString, patternLetters, otherLetters) {
                var prefix, absData, hours, minutes;
                var patternLetter, numberOfLetters, rawData;

                // If the pattern matched is quoted string, output the text between the quotes
                if (quotedString) {
                    return (quotedString == "''") ? "'" : quotedString.slice(1, -1);
                } else if (otherLetters) {
                    // Swallow non-pattern letters by doing nothing here
                    return "";
                } else if (patternLetters) {
                    // Replace pattern letters
                    patternLetter = patternLetters.charAt(0);
                    numberOfLetters = patternLetters.length;

                    // Create the raw data, depending on the pattern letter
                    rawData = "";
                    switch (patternLetter) {
                        case "G":
                            rawData = "AD";
                            break;
                        case "y":
                            rawData = date.getFullYear();
                            break;
                        case "M":
                            rawData = date.getMonth();
                            break;
                        case "w":
                            rawData = getWeekInYear( date, simpleDateFormat.getMinimalDaysInFirstWeek() );
                            break;
                        case "W":
                            rawData = getWeekInMonth( date, simpleDateFormat.getMinimalDaysInFirstWeek() );
                            break;
                        case "D":
                            rawData = getDayInYear(date);
                            break;
                        case "d":
                            rawData = date.getDate();
                            break;
                        case "F":
                            rawData = 1 + Math.floor( (date.getDate() - 1) / 7 );
                            break;
                        case "E":
                            rawData = dayNames[date.getDay()];
                            break;
                        case "a":
                            rawData = (date.getHours() >= 12) ? "PM" : "AM";
                            break;
                        case "H":
                            rawData = date.getHours();
                            break;
                        case "k":
                            rawData = date.getHours() || 24;
                            break;
                        case "K":
                            rawData = date.getHours() % 12;
                            break;
                        case "h":
                            rawData = (date.getHours() % 12) || 12;
                            break;
                        case "m":
                            rawData = date.getMinutes();
                            break;
                        case "s":
                            rawData = date.getSeconds();
                            break;
                        case "S":
                            rawData = date.getMilliseconds();
                            break;
                        case "Z":
                            // getTimezoneOffset() returns the number of minutes since GMT was this time.
                            rawData = date.getTimezoneOffset();
                            break;
                    }

                    // Format the raw data depending on the type
                    switch (types[patternLetter]) {
                        case TEXT2:
                            return formatText(rawData, numberOfLetters, 2);
                        case TEXT3:
                            return formatText(rawData, numberOfLetters, 3);
                        case YEAR:
                            if (numberOfLetters <= 3) {
                                // Output a 2-digit year
                                return ("" + rawData).slice(2, 4);
                            } else {
                                return formatNumber(rawData, numberOfLetters);
                            }
                            break;
                        case MONTH:
                            return (numberOfLetters >= 3) ?
                                formatText(monthNames[rawData], numberOfLetters, numberOfLetters) :
                                formatNumber(rawData + 1, numberOfLetters);
                        case TIMEZONE:
                            // The following line looks like a mistake but isn't
                            // because of the way getTimezoneOffset measures.
                            prefix = (rawData > 0) ? "-" : "+";
                            absData = Math.abs(rawData);

                            // Hours
                            hours = leftPad("" + Math.floor(absData / 60), 2, "0");

                            // Minutes
                            minutes = leftPad("" + (absData % 60), 2, "0");

                            return prefix + hours + minutes;
                        default:
                            // The default is number
                            return formatNumber(rawData, numberOfLetters);
                    }
                }
            });
        }
    });

    api.SimpleDateFormat = SimpleDateFormat;
})(log4javascript);
