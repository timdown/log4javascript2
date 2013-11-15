define([ './has' ], function (has) {
	/**
	 * An interface for providing information to users about this release of Dojo.
	 */
	var kernel = {};

	/**
	 * Version information about this release of Dojo.
	 */
	kernel.version = {
		/**
		 * Major version. If total version is "1.2.0beta1", will be 1.
		 */
		major: 2,

		/**
		 * Minor version. If total version is "1.2.0beta1", will be 2.
		 */
		minor: 0,

		/**
		 * Patch version. If total version is "1.2.0beta1", will be 0.
		 */
		patch: 0,

		/**
		 * Descriptor flag. If total version is "1.2.0beta1", will be "beta1".
		 */
		flag: 'dev',

		/**
		 * The ID of the Git commit used to build this version of Dojo.
		 * @type ?string
		 */
		revision: ('$Rev$'.match(/[0-9a-f]{40}/) || [])[0],

		toString: function () {
			var v = this;
			return v.major + '.' + v.minor + '.' + v.patch + v.flag + (v.revision ? ' (' + v.revision + ')' : '');
		}
	};

	// by default, these functions should be available. remove them at build time.
	has.add('dojo-debug-messages', true);

	if (has('dojo-debug-messages')) {
		/**
		 * Warns that a code path has been deprecated.
		 *
		 * @param action
		 * The action being deprecated, usually in the form "module.someFunction()".
		 *
		 * @param advice
		 * Text to append to the message. Often provides advice on a new function or facility to achieve the same goal
		 * during the deprecation period.
		 *
		 * @param removal
		 * Text to indicate when in the future the behavior will be removed. Usually a version number.
		 *
		 * @example
		 * kernel.deprecated("myApp.getTemp()", "use myApp.getLocaleTemp() instead", "1.0");
		 */
		kernel.deprecated = function (/**string*/ action, /**string=*/ advice, /**string=*/ removal) {
			var message = 'DEPRECATED: ' + action;

			if (advice) {
				message += ' ' + advice;
			}

			if (removal) {
				message += ' -- will be removed in version: ' + removal;
			}

			console.warn(message);
		};

		/**
		 * Warns that a code path or module is experimental.
		 *
		 * @param action
		 * The experimental action, usually in the form "module.someFunction()".
		 *
		 * @param advice
		 * Text to append to the message. Often provides advice on why the code path is experimental.
		 *
		 * @example
		 * dojo.experimental("dojo.data.Result");
		 *
		 * @example
		 * dojo.experimental("dojo.weather.toKelvin()", "PENDING approval from NOAA");
		 */
		kernel.experimental = function (/**string*/ action, /**string=*/ advice) {
			var message = 'EXPERIMENTAL: ' + action + ' -- APIs subject to change without notice.';

			if (advice) {
				message += ' ' + advice;
			}

			console.warn(message);
		};
	}
	else {
		kernel.deprecated = kernel.experimental = function () {};
	}

	return kernel;
});