define([
	'exports',
	'../errors/RequestError',
	'../errors/CancelError',
	'../Deferred',
	'../io-query',
	'../lang'
], function (exports, RequestError, CancelError, Deferred, ioQuery, lang) {
	exports.deepCreate = function deepCreate(source, properties) {
		properties = properties || {};
		var target = Object.create(source),
			name, value;

		for (name in source) {
			value = source[name];

			if (value && typeof value === 'object') {
				target[name] = exports.deepCreate(value, properties[name]);
			}
		}
		return lang.deepCopy(target, properties);
	};

	var freeze = Object.freeze || function (obj) { return obj; };
	function okHandler(response) {
		return freeze(response);
	}

	exports.deferred = function deferred(response, cancel, isValid, isReady, handleResponse, last) {
		var def = new Deferred(function (reason) {
			cancel && cancel(def, response);

			if (!reason || !(reason instanceof RequestError) && !(reason instanceof CancelError)) {
				return new CancelError('Request canceled', response);
			}
			return reason;
		});

		def.response = response;
		def.isValid = isValid;
		def.isReady = isReady;
		def.handleResponse = handleResponse;

		function errHandler(error) {
			error.response = response;
			throw error;
		}
		var responsePromise = def.then(okHandler).otherwise(errHandler);

		if (exports.notify) {
			responsePromise.then(
				lang.hitch(exports.notify, 'emit', 'load'),
				lang.hitch(exports.notify, 'emit', 'error')
			);
		}

		var dataPromise = responsePromise.then(function (response) {
				return response.data || response.text;
			});

		var promise = freeze(lang.delegate(dataPromise, {
			response: responsePromise
		}));


		if (last) {
			def.then(function (response) {
				last.call(def, response);
			}, function (error) {
				last.call(def, response, error);
			});
		}

		def.promise = promise;
		def.then = promise.then;

		return def;
	};

	exports.addCommonMethods = function addCommonMethods(provider, methods) {
		(methods || ['GET', 'POST', 'PUT', 'DELETE']).forEach(function (method) {
			provider[(method === 'DELETE' ? 'DEL' : method).toLowerCase()] = function (url, options) {
				options = Object.create(options || {});
				options.method = method;
				return provider(url, options);
			};
		});
	};

	exports.parseArgs = function parseArgs(url, options, skipData) {
		var data = options.data,
			query = options.query;

		if (data && !skipData) {
			if (typeof data === 'object') {
				options.data = ioQuery.objectToQuery(data);
			}
		}

		if (query) {
			if (typeof query === 'object') {
				query = ioQuery.objectToQuery(query);
			}
			if (options.preventCache) {
				query += (query ? '&' : '') + 'request.preventCache=' + (+(new Date));
			}
		}
		else if (options.preventCache) {
			query = 'request.preventCache=' + (+(new Date));
		}

		if (url && query) {
			url += (~url.indexOf('?') ? '&' : '?') + query;
		}

		return {
			url: url,
			options: options,
			getHeader: function () { return null; }
		};
	};

	exports.checkStatus = function (stat) {
		stat = stat || 0;
		return (stat >= 200 && stat < 300) || // allow any 2XX response code
			stat === 304 ||                 // or, get it out of the cache
			stat === 1223 ||                // or, Internet Explorer mangled the status code
			!stat;                         // or, we're Titanium/browser chrome/chrome extension requesting a local file
	};
});
