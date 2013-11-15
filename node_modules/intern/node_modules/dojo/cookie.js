define([], function () {
	// TODO: Put these utility functions somewhere else. dojo/string perhaps?

	/**
	 * Escapes a string to be used within a regular expression.
	 * @returns {string} Escaped string.
	 */
	function escapeString(/**string*/ string) {
		return string.replace(/[-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
	}

	/**
	 * Counts the number of instances of `needle` found inside `haystack`.
	 *
	 * @param haystack
	 * String to search.
	 *
	 * @param needle
	 * String to look for.
	 *
	 * @returns {number} Number of hits.
	 */
	function count(/**string*/ haystack, /**string*/ needle) {
		var hits = 0,
			lastIndex = haystack.indexOf(needle);

		while (lastIndex > -1) {
			++hits;
			lastIndex = haystack.indexOf(needle, lastIndex + 1);
		}

		return hits;
	}

	/**
	 * Options that may be used to set a cookie.
	 *
	 * @name cookieOptions
	 *
	 * @property {(Date|string)} expires
	 * The date at which the cookie should expire. By default, the cookie will expire when the browser closes.
	 *
	 * @property {number} maxAge
	 * The number of seconds from now that the cookie should expire. By default, the cookie will expire when the
	 * browser closes.
	 *
	 * @property {string} path
	 * The path to use for the cookie.
	 *
	 * @property {string} domain
	 * The domain to use for the cookie.
	 *
	 * @property {boolean} secure
	 * Whether or not to only send the cookie over secure connections.
	 */

	/**
	 * Creates a well-formed cookie options string.
	 * @returns {string}
	 */
	function createCookieOptions(/**cookieOptions*/ options) {
		var optionsString = '',
			value;

		for (var k in options) {
			value = options[k];

			if (k === 'maxAge') {
				k = 'max-age';
			}
			else if (k === 'secure' && !value) {
				continue;
			}

			optionsString += '; ' + encodeURIComponent(k);

			if (k === 'secure') {
				// secure is a boolean flag, so provide no value
			}
			else if (k === 'expires') {
				// Expires will not work if its value is URI-encoded
				optionsString += '=' + (value.toUTCString ? value.toUTCString() : value);
			}
			else {
				optionsString += '=' + encodeURIComponent(value);
			}
		}

		return optionsString;
	}

	if (!navigator.cookieEnabled) {
		return null;
	}

	var longAgo = new Date(1970, 0, 1).toUTCString();

	/**
	 * An interface for getting and setting cookies based on the DOM Storage API.
	 */
	return {
		/**
		 * The number of cookies that are currently set.
		 */
		get length() {
			return document.cookie.length ? count(document.cookie, '; ') + 1 : 0;
		},

		/**
		 * Gets the key of the cookie at the given index.
		 * Note that at least in Chrome 24, changing the value of an existing cookie puts that cookie at the end of the
		 * cookie string and so the sort order changes. Other browsers maintain key sort order.
		 * @returns {?string}
		 */
		key: function (/**number*/ index) {
			var keyValuePair = document.cookie.split('; ', index + 1)[index];
			return keyValuePair ? decodeURIComponent(/^([^=]+)/.exec(keyValuePair)[0]) : null;
		},

		/**
		 * Gets the value of a cookie.
		 * @returns {?string}
		 */
		getItem: function (/**string*/ key) {
			var match = new RegExp('(?:^|; )' + escapeString(encodeURIComponent(key)) + '=([^;]*)').exec(document.cookie);
			return match ? decodeURIComponent(match[1]) : null;
		},

		/**
		 * Sets the value of a cookie.
		 */
		setItem: function (/**string*/ key, /**string*/ data, /**cookieOptions=*/ options) {
			options = options || {};
			document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(data) + createCookieOptions(options);
		},

		/**
		 * Removes a cookie.
		 */
		removeItem: function (/**string*/ key, /**cookieOptions=*/ options) {
			options = options ? Object.create(options) : {};
			options.expires = longAgo;
			document.cookie = encodeURIComponent(key) + '=' + createCookieOptions(options);
		}
	};
});
