define([ 'require' ], function (require) {
	/*jshint node:true */

	var has = require.has;
	if (!has) {
		has = (function () {
			var hasCache = Object.create(null),
				global = this,
				document = global.document,
				element = document && document.createElement('DIV');

			/**
			 * A standard API for retrieving feature test results and configuration data that may be
			 * used to remove code at build time. See {@link has.add} for information on adding new
			 * tests.
			 *
			 * @param name
			 * The name of the feature to test.
			 *
			 * @returns The value of the given has-flag.
			 *
			 * @example
			 * if (has('host-node')) {
			 *     // Node.js-specific code which can be optimized out
			 *     // for browser-specific builds
			 * }
			 */
			function has(/**string*/ name) {
				return typeof hasCache[name] === 'function' ? (hasCache[name] = hasCache[name](global, document, element)) : hasCache[name];
			}

			/**
			 * Registers a new feature test or configuration value for use by {@link has}.
			 *
			 * @param name
			 * The name of the feature to register.
			 *
			 * @param {*|function(global:Global, document:HTMLDocument=, element:HTMLElement=):*} test
			 * A value or test function to register. If a function is passed, it will be called once
			 * the first time its value is requested and the return value cached.
			 *
			 * @param now
			 * If `test` is a function, passing a truthy value will cause it to be invoked
			 * immediately. By default, a test function is not executed until the value is actually
			 * used for the first time.
			 *
			 * @param force
			 * If `name` is already registered, passing a truthy value will cause its value to be
			 * replaced with the new value. By default, re-registering a test that already exists is
			 * a no-op.
			 */
			has.add = function (/**string*/ name, test, /**boolean=*/ now, /**boolean=*/ force) {
				(!(name in hasCache) || force) && (hasCache[name] = test);
				now && has(name);
			};

			return has;
		})();
	}

	has.add('host-browser', typeof document !== 'undefined' && typeof location !== 'undefined');
	has.add('host-node', typeof process === 'object' && process.versions && process.versions.node);

	/**
	 * Resolves a conditional module ID into a real module ID based on a possibly-nested tenary
	 * expression that branches on has-flags. See {@link has.load} for details on the syntax.
	 *
	 * @param id
	 * The conditional module ID.
	 *
	 * @param toAbsMid
	 * A function that converts a relative module ID into the correct absolute module ID.
	 */
	has.normalize = function (/**string*/ id, /**Function*/ normalize) {
		var tokens = id.match(/[\?:]|[^:\?]*/g),
			i = 0,
			get = function (skip) {
				var term = tokens[i++];
				if (term === ':') {
					// empty string module name, resolves to 0
					return 0;
				}
				else {
					// postfixed with a ? means it is a feature to branch on, the term is the name of the feature
					if (tokens[i++] === '?') {
						if (!skip && has(term)) {
							// matched the feature, get the first value from the options
							return get();
						}
						else {
							// did not match, get the second value, passing over the first
							get(true);
							return get(skip);
						}
					}

					// a module
					return term || 0;
				}
			};

		id = get();
		return id && normalize(id);
	};

	/**
	 * Conditionally loads AMD modules based on the value of has-flags.
	 *
	 * @param id
	 * The module ID to load. The correct module ID to load is determined by the code in `has.normalize`.
	 *
	 * @param parentRequire
	 * The loader require function with respect to the module that contained the plugin resource in its dependency
	 * list.
	 *
	 * @param loaded
	 * Callback to loader that consumes result of plugin demand.
	 *
	 * @example
	 * define([
	 *     'dojo/has!test-foo?module/foo:test-bar?module/bar:module/baz'
	 * ], ...);
	 */
	has.load = function (/**string*/ id, /**Function*/ parentRequire, /**Function*/ load) {
		if (id) {
			parentRequire([ id ], load);
		}
		else {
			load();
		}
	};

	return has;
});
